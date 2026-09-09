const pool = require('../db/pool');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const site = 'https://whossteering.com';
const from = "Who's Steering <service@whossteering.com>";
const mailReady = () => Boolean(process.env.RESEND_API_KEY);
const recoveryReady = () => mailReady() && Boolean(process.env.SALES_POSTAL_ADDRESS);
const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const resumeUrl = id => `${site}/resume#${id}`;
async function send(lead, recovery = false) {
  if (!mailReady() || (recovery && !recoveryReady())) return false;
  const subjects = ['Your wheel build is saved', 'Your custom wheel is waiting', 'Need help confirming fitment?', 'Ready to finish your wheel?'];
  const stage = recovery ? lead.stage : 0;
  const body = stage === 2 ? 'Reply with your vehicle year and model if you need help confirming fitment before ordering.' : 'Return to your saved selections whenever you are ready. Current pricing will be confirmed at checkout.';
  const response = await fetch('https://api.resend.com/emails', {
    method:'POST', signal:AbortSignal.timeout(15000),
    headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type':'application/json','Idempotency-Key':`sales-${lead.id}-${stage}`},
    body:JSON.stringify({from,to:[lead.email],reply_to:'service@whossteering.com',
      subject:subjects[stage] || subjects[3],
      html:`<h1>${subjects[stage] || subjects[3]}</h1><p>${body}</p><p><a href="${resumeUrl(lead.id)}">Return to your wheel</a></p><p>This private link expires after 30 days. Please do not share it.</p>${recovery ? `<p>Who's Steering · ${escape(process.env.SALES_POSTAL_ADDRESS)}</p><p><a href="${site}/unsubscribe#${lead.id}">Unsubscribe from build reminders</a></p>` : ''}`})
  });
  if (!response.ok) throw new Error(`Email provider returned ${response.status}`);
  return true;
}
async function save(email,kind,payload,consent) {
  const id = crypto.randomBytes(32).toString('hex');
  const {rows} = await pool.query(`INSERT INTO sales_leads(id,email,kind,payload,consent,consent_version) VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,[id,email.toLowerCase().trim(),kind,payload,consent,consent ? 'build-reminders-v1' : null]);
  let emailed = false;
  if(kind==='fitment' && mailReady()) {
    try {
      const response=await fetch('https://api.resend.com/emails',{method:'POST',signal:AbortSignal.timeout(15000),headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`fitment-${id}`},body:JSON.stringify({from,to:['service@whossteering.com'],reply_to:'service@whossteering.com',subject:'New steering wheel fitment inquiry',html:`<p>A customer requested fitment help for ${escape(payload.brand)} ${escape(payload.year)} ${escape(payload.model)}.</p><p>Customer: ${escape(email)}</p><p><a href="${site}/admin">Review the request and wheel photo in your admin inbox</a></p>`})});
      if(!response.ok)throw new Error(`Email provider returned ${response.status}`);
    }catch(e){console.error('Fitment notification failed:',e.message);}
  }
  if(kind!=='fitment') {
    try { emailed = await send(rows[0]); } catch(e) { console.error('Saved build email failed:',e.message); }
  }
  return {url:resumeUrl(id),emailed};
}
let running = false;
async function tick() {
  if(running) return;
  running=true;
  let client;
  try {
    client=await pool.connect();
    const {rows:locks}=await client.query('SELECT pg_try_advisory_lock(8391204) AS locked');
    if(!locks[0].locked) return;
    await client.query(`DELETE FROM sales_leads WHERE expires_at < now(); DELETE FROM sales_events WHERE created_at < now()-interval '90 days'`);
    if(!recoveryReady()) return;
    const {rows}=await client.query(`SELECT l.* FROM sales_leads l WHERE kind IN ('build','checkout') AND consent AND unsubscribed_at IS NULL AND stage < 3 AND expires_at > now()
      AND (last_sent_at IS NULL OR last_sent_at < now()-interval '20 hours')
      AND created_at + CASE stage WHEN 0 THEN interval '1 hour' WHEN 1 THEN interval '24 hours' ELSE interval '72 hours' END < now()
      AND NOT EXISTS(SELECT 1 FROM orders o WHERE lower(o.guest_email)=lower(l.email) AND o.created_at>=l.created_at-interval '1 hour' AND o.status <> 'pending')
      AND NOT EXISTS(SELECT 1 FROM sales_leads n WHERE lower(n.email)=lower(l.email) AND (n.created_at,n.id)>(l.created_at,l.id))
      ORDER BY created_at LIMIT 20`);
    for(const lead of rows) {
      // Recheck immediately before sending, including payments whose order status may lag.
      const {rows:blocked}=await client.query(`SELECT 1 FROM sales_leads WHERE id=$1 AND unsubscribed_at IS NOT NULL UNION ALL SELECT 1 FROM orders o LEFT JOIN payments p ON p.order_id=o.id WHERE lower(o.guest_email)=lower($2) AND o.created_at>=$3::timestamptz-interval '1 hour' AND (o.status<>'pending' OR p.status IN ('succeeded','processing','COMPLETED')) LIMIT 1`,[lead.id,lead.email,lead.created_at]);
      if(blocked.length) continue;
      try {
        await send({...lead,stage:lead.stage+1},true);
        await client.query('UPDATE sales_leads SET stage=stage+1,last_sent_at=now() WHERE id=$1',[lead.id]);
      } catch(e) {console.error('Recovery email failed:',e.message);}
    }
  } catch(e) {console.error('Sales scheduler:',e.message);}
  finally {if(client){await client.query('SELECT pg_advisory_unlock(8391204)').catch(()=>{});client.release();}running=false;}
}
async function captureCheckout(email,items) {
  if(!recoveryReady())return;
  const {rows}=await pool.query("SELECT id FROM sales_leads WHERE lower(email)=lower($1) AND kind='checkout' AND created_at>now()-interval '1 hour' ORDER BY created_at DESC LIMIT 1",[email.trim()]);
  if(rows.length){await pool.query('UPDATE sales_leads SET payload=$1 WHERE id=$2',[{items},rows[0].id]);return;}
  await save(email,'checkout',{items},true);
}
async function initialize() {
  await pool.query('BEGIN; SELECT pg_advisory_xact_lock(8391205); ' + fs.readFileSync(path.join(__dirname,'../db/migrations/20260908_sales.sql'),'utf8') + '; COMMIT;');
  const interval=setInterval(tick,60000); interval.unref(); tick();
}
module.exports={save,initialize,mailReady,recoveryReady,captureCheckout};
