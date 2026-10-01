const router=require('express').Router();
const rateLimit=require('express-rate-limit');
const pool=require('../db/pool');
const sales=require('../lib/sales');
const {adminRequired}=require('../middleware/auth');
const wrap=fn=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
const token=/^[a-f0-9]{64}$/;
router.get('/status',(req,res)=>res.json({email:sales.mailReady(),recovery:sales.recoveryReady()}));
router.post('/save',rateLimit({windowMs:60*60*1000,max:10}),wrap(async(req,res)=>{
  const {email,kind,payload,consent}=req.body;
  if(typeof email!=='string'||email.length>254||!/^\S+@\S+\.\S+$/.test(email)||!['build','checkout','fitment'].includes(kind)||!payload||typeof payload!=='object'||JSON.stringify(payload).length>60000) return res.status(400).json({error:'Please enter a valid email and wheel details.'});
  if(kind==='build' && (!payload.config||!['BMW','AUDI','MERCEDES','TOYOTA','PORSCHE','DODGE_SRT'].includes(payload.config.brand))) return res.status(400).json({error:'Invalid wheel build.'});
  if(kind==='checkout' && (!Array.isArray(payload.items)||!payload.items.length||payload.items.length>30)) return res.status(400).json({error:'Your cart is empty or invalid.'});
  if(kind==='fitment' && (!payload.year||!payload.model||!payload.photoUrl)) return res.status(400).json({error:'Add your vehicle year, model and wheel photo first.'});
  if(kind==='checkout' && payload.items.some(i=>!i||typeof i.name!=='string'||typeof i.price!=='number'||!Number.isFinite(i.price)||i.price<0||!i.config||typeof i.config!=='object'))return res.status(400).json({error:'Invalid saved cart.'});
  if(kind==='fitment' && [payload.year,payload.model,payload.photoUrl].some(v=>typeof v!=='string'||v.length>2000))return res.status(400).json({error:'Invalid vehicle details.'});
  const {rows}=await pool.query("SELECT count(*) FROM sales_leads WHERE lower(email)=lower($1) AND created_at>now()-interval '24 hours'",[email.trim()]);
  if(Number(rows[0].count)>=5)return res.status(429).json({error:'You have saved several requests today. Please use your existing link or try tomorrow.'});
  res.json(await sales.save(email,kind,payload,consent===true));
}));
router.get('/saved/:id',wrap(async(req,res)=>{
  if(!token.test(req.params.id))return res.status(404).json({error:'Saved build not found.'});
  const {rows}=await pool.query("SELECT kind,payload FROM sales_leads WHERE id=$1 AND expires_at>now() AND kind<>'fitment'",[req.params.id]);
  if(!rows.length)return res.status(404).json({error:'This saved build has expired. Please start a new build.'});
  res.set('Cache-Control','no-store').json(rows[0]);
}));
router.post('/unsubscribe',wrap(async(req,res)=>{
  if(!token.test(req.body.id||''))return res.status(400).json({error:'Invalid unsubscribe link.'});
  await pool.query('UPDATE sales_leads SET unsubscribed_at=now(),consent=false WHERE lower(email)=(SELECT lower(email) FROM sales_leads WHERE id=$1)',[req.body.id]);
  res.json({ok:true});
}));
router.post('/events',wrap(async(req,res)=>{
  const {session,event}=req.body;
  if(!/^[a-zA-Z0-9-]{16,64}$/.test(session||'')||!['configure_started','checkout_started','build_resumed'].includes(event))return res.status(400).json({error:'Invalid event.'});
  await pool.query('INSERT INTO sales_events(session_id,event) VALUES($1,$2) ON CONFLICT DO NOTHING',[session,event]);
  res.json({ok:true});
}));
router.get('/admin',adminRequired,wrap(async(req,res)=>{
  const days=Number(req.query.days||30);
  if(![7,30,90].includes(days))return res.status(400).json({error:'Choose a valid reporting period.'});
  const paid="('paid','in_build','quality_check','shipped','delivered')";
  const [events,orders,counts,recovered,eventDaily,orderDaily,recentSaves,fitment]=await Promise.all([
    pool.query("SELECT event,count(*) FROM sales_events WHERE created_at>=now()-($1::int*interval '1 day') GROUP BY event",[days]),
    pool.query(`SELECT count(*) AS purchases,coalesce(sum(total),0) AS revenue FROM orders WHERE created_at>=now()-($1::int*interval '1 day') AND status IN ${paid}`,[days]),
    pool.query("SELECT kind,count(*) FROM sales_leads WHERE created_at>=now()-($1::int*interval '1 day') GROUP BY kind",[days]),
    pool.query(`SELECT count(*) AS orders,coalesce(sum(o.total),0) AS revenue FROM sales_attributions a JOIN orders o ON o.id=a.order_id WHERE a.created_at>=now()-($1::int*interval '1 day') AND o.status IN ${paid}`,[days]),
    pool.query("SELECT to_char(created_at AT TIME ZONE 'UTC','YYYY-MM-DD') AS day,event,count(*) AS count FROM sales_events WHERE created_at>=now()-($1::int*interval '1 day') GROUP BY day,event ORDER BY day",[days]),
    pool.query(`SELECT to_char(created_at AT TIME ZONE 'UTC','YYYY-MM-DD') AS day,count(*) AS count FROM orders WHERE created_at>=now()-($1::int*interval '1 day') AND status IN ${paid} GROUP BY day ORDER BY day`,[days]),
    pool.query("SELECT id,email,kind,created_at,stage FROM sales_leads WHERE kind IN ('build','checkout') ORDER BY created_at DESC LIMIT 8"),
    pool.query("SELECT count(*) FILTER (WHERE status='open') AS open,count(*) FILTER (WHERE status='resolved') AS resolved,min(created_at) FILTER (WHERE status='open') AS oldest_open FROM sales_leads WHERE kind='fitment'"),
  ]);
  res.set('Cache-Control','no-store').json({days,events:events.rows,counts:counts.rows,recovered:recovered.rows[0],orders:orders.rows[0],activity:{events:eventDaily.rows,orders:orderDaily.rows},recentSaves:recentSaves.rows,fitment:fitment.rows[0],email:sales.mailReady(),recovery:sales.recoveryReady()});
}));
router.get('/admin/fitment',adminRequired,wrap(async(req,res)=>{
  const status=['open','resolved','all'].includes(req.query.status)?req.query.status:'open';
  const sort=req.query.sort==='newest'?'newest':'oldest';
  const page=Math.max(1,Math.min(1000,Number.parseInt(req.query.page,10)||1));
  const search=typeof req.query.search==='string'?req.query.search.trim().slice(0,100):'';
  const clauses=["kind='fitment'"];
  const params=[];
  if(status!=='all'){params.push(status);clauses.push(`status=$${params.length}`);}
  if(search){params.push(search.toLowerCase());const n=params.length;clauses.push(`(position($${n} in lower(email))>0 OR position($${n} in lower(coalesce(payload->>'brand','')))>0 OR position($${n} in lower(coalesce(payload->>'model','')))>0 OR position($${n} in lower(coalesce(payload->>'year','')))>0)`);}
  const where=clauses.join(' AND ');
  const count=await pool.query(`SELECT count(*) AS total FROM sales_leads WHERE ${where}`,params);
  const total=Number(count.rows[0].total);
  const direction=sort==='newest'?'DESC':'ASC';
  const rows=await pool.query(`SELECT id,email,payload,created_at,status FROM sales_leads WHERE ${where} ORDER BY created_at ${direction},id ${direction} LIMIT 25 OFFSET $${params.length+1}`,[...params,(page-1)*25]);
  res.set('Cache-Control','no-store').json({leads:rows.rows,total,page,hasMore:page*25<total});
}));
router.patch('/admin/:id',adminRequired,wrap(async(req,res)=>{
  if(!['open','resolved'].includes(req.body.status))return res.status(400).json({error:'Invalid status.'});
  const {rowCount}=await pool.query("UPDATE sales_leads SET status=$1 WHERE id=$2 AND kind='fitment'",[req.body.status,req.params.id]);
  if(!rowCount)return res.status(404).json({error:'Fitment request not found.'});
  res.json({ok:true});
}));
module.exports=router;
