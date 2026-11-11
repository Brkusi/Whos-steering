const router=require('express').Router();
const rateLimit=require('express-rate-limit');
const crypto=require('crypto');
const pool=require('../db/pool');
const {adminRequired}=require('../middleware/auth');
const wrap=fn=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
router.post('/subscribe',rateLimit({windowMs:60*60*1000,max:5}),wrap(async(req,res)=>{
 const email=typeof req.body.email==='string'?req.body.email.trim().toLowerCase():'';
 if(email.length>254||!/^\S+@\S+\.\S+$/.test(email)||req.body.consent!==true)return res.status(400).json({error:'Enter a valid email and agree to receive the newsletter.'});
 await pool.query(`INSERT INTO newsletter_subscribers(email,unsubscribe_token,consent_version) VALUES($1,$2,'newsletter-v1')
 ON CONFLICT(email) DO UPDATE SET consent_at=now(),consent_version='newsletter-v1',unsubscribed_at=NULL`,[email,crypto.randomBytes(32).toString('hex')]);
 res.json({ok:true});
}));
router.post('/unsubscribe',wrap(async(req,res)=>{
 if(!/^[a-f0-9]{64}$/.test(req.body.id||''))return res.status(400).json({error:'Invalid unsubscribe link.'});
 await pool.query('UPDATE newsletter_subscribers SET unsubscribed_at=now() WHERE unsubscribe_token=$1',[req.body.id]);
 res.json({ok:true});
}));
router.get('/admin',adminRequired,wrap(async(req,res)=>{
 const {rows}=await pool.query('SELECT email,consent_at,created_at,unsubscribe_token FROM newsletter_subscribers WHERE unsubscribed_at IS NULL ORDER BY created_at DESC');
 res.set('Cache-Control','no-store').json({subscribers:rows.map(row=>({email:row.email,consentAt:row.consent_at,subscribedAt:row.created_at,unsubscribeUrl:`https://whossteering.com/unsubscribe#newsletter-${row.unsubscribe_token}`}))});
}));
module.exports=router;
