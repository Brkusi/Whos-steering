const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const pool = require('../db/pool');
const {adminRequired} = require('../middleware/auth');
const PRODUCT = 'audi-a6-a7-c7-digital-cluster';
const wrap = fn => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next);
let schemaReady;
function ensureSchema(){
  if(!schemaReady) schemaReady = pool.query(`CREATE TABLE IF NOT EXISTS product_waitlist (
    product text NOT NULL, email text NOT NULL, name text NOT NULL, vehicle text NOT NULL DEFAULT '',
    unsubscribe_token text NOT NULL UNIQUE, consent_version text NOT NULL DEFAULT 'product-availability-v1',
    consent_at timestamptz NOT NULL DEFAULT now(), created_at timestamptz NOT NULL DEFAULT now(),
    unsubscribed_at timestamptz, PRIMARY KEY (product,email)
  )`).catch(error=>{schemaReady=undefined;throw error;});
  return schemaReady;
}
router.post('/subscribe',rateLimit({windowMs:60*60*1000,max:5}),wrap(async(req,res)=>{
  const {product,consent} = req.body || {};
  const email = typeof req.body?.email==='string'?req.body.email.trim().toLowerCase():'';
  const name = typeof req.body?.name==='string'?req.body.name.trim():'';
  const vehicle = req.body?.vehicle == null?'':req.body.vehicle;
  if(product!==PRODUCT || consent!==true || !name || name.length>100 || email.length>254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) || typeof vehicle!=='string' || vehicle.length>200)
    return res.status(400).json({error:'Enter your name, a valid email and consent to product availability updates.'});
  await ensureSchema();
  await pool.query(`INSERT INTO product_waitlist(product,email,name,vehicle,unsubscribe_token) VALUES($1,$2,$3,$4,$5)
    ON CONFLICT(product,email) DO UPDATE SET name=EXCLUDED.name,vehicle=EXCLUDED.vehicle,consent_at=now(),
    consent_version='product-availability-v1',unsubscribed_at=NULL`,[product,email,name,vehicle.trim(),crypto.randomBytes(32).toString('hex')]);
  res.json({ok:true});
}));
router.post('/unsubscribe',rateLimit({windowMs:60*60*1000,max:30}),wrap(async(req,res)=>{
  if(!/^[a-f0-9]{64}$/.test(req.body?.id||''))return res.status(400).json({error:'Invalid unsubscribe link.'});
  await ensureSchema();
  await pool.query('UPDATE product_waitlist SET unsubscribed_at=now() WHERE unsubscribe_token=$1',[req.body.id]);
  res.json({ok:true});
}));
router.get('/admin',adminRequired,wrap(async(req,res)=>{
  await ensureSchema();
  const {rows}=await pool.query('SELECT product,email,name,vehicle,created_at,consent_at,unsubscribe_token FROM product_waitlist WHERE unsubscribed_at IS NULL ORDER BY created_at ASC');
  res.set('Cache-Control','no-store').json({subscribers:rows.map(row=>({product:row.product,email:row.email,name:row.name,vehicle:row.vehicle,createdAt:row.created_at,consentAt:row.consent_at,unsubscribeUrl:`https://whossteering.com/products/audi-a6-a7-digital-instrument-cluster/#unsubscribe-${row.unsubscribe_token}`}))});
}));
module.exports=router;
