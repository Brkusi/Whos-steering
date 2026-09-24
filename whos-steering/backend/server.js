require('dotenv').config();
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be configured with at least 32 characters');
}
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const rateLimit = require('express-rate-limit');
const pool    = require('./db/pool');

const app = express();
// Render forwards client addresses through its edge proxy.
if (process.env.RENDER) app.set('trust proxy', 1);

// ── CORS ──────────────────────────────────────────────────────
const allowedOrigins = (process.env.FRONTEND_URL || '').split(',').map(value => value.trim()).filter(Boolean);
const corsOptions = {
  origin(origin, callback) {
    if (!origin || !allowedOrigins.length || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(Object.assign(new Error('Origin not allowed'), { status: 403 }));
  },
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ── Security headers ──────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // The API serves JSON; the storefront CSP is set by Netlify.
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ── Stripe webhook — RAW body BEFORE json parser ──────────────
app.post('/api/checkout/webhook',
  express.raw({ type: 'application/json', limit: '1mb' }),
  async (req, res) => {
    const stripeLib = require('stripe');
    const stripe    = stripeLib(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers['stripe-signature'];
    if (!process.env.STRIPE_WEBHOOK_SECRET || !sig) {
      return res.status(400).json({ error: 'Webhook signature is missing or not configured' });
    }
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      return res.status(400).json({ error: `Webhook error: ${err.message}` });
    }

    const pi = event.data.object;

    try {
      if (event.type === 'payment_intent.succeeded') {
        await pool.query(
          `UPDATE payments
           SET status = 'succeeded',
               stripe_charge_id = $1,
               updated_at = NOW()
           WHERE stripe_payment_intent = $2`,
          [pi.latest_charge, pi.id]
        );

        const { rows: changed } = await pool.query(
          `UPDATE orders
           SET status = 'paid', updated_at = NOW()
           WHERE id = $1
             AND status IN ('pending','payment_processing')
           RETURNING id`,
          [pi.metadata.orderId]
        );

        // Insert history only if this webhook actually changed the status.
        // That avoids duplicates if the confirmation verification endpoint
        // already marked the same succeeded payment as paid.
        if (changed.length) {
          await pool.query(
            `INSERT INTO order_status_history
              (order_id, from_status, to_status, note)
             VALUES ($1,'pending','paid','Payment confirmed via Stripe webhook')`,
            [pi.metadata.orderId]
          );
        }
      }

      if (event.type === 'payment_intent.payment_failed') {
        await pool.query(
          `UPDATE payments SET status = 'failed' WHERE stripe_payment_intent = $1`,
          [pi.id]
        );
      }

      if (['charge.refunded','refund.created','refund.updated','refund.failed','charge.refund.updated'].includes(event.type)) {
        const object=event.data.object;
        const piId=object.payment_intent || (object.charge ? (await stripe.charges.retrieve(object.charge)).payment_intent : null);
        if(piId){const client=await pool.connect();try{await client.query('BEGIN');await require('./lib/refunds').syncRefunds(client,stripe,piId);await client.query('COMMIT');}catch(err){await client.query('ROLLBACK');throw err;}finally{client.release();}}
      }

    } catch (err) {
      console.error('Webhook handler error:', err);
      return res.status(500).json({ error: 'Webhook processing failed' });
    }

    res.json({ received: true });
  }
);

// ── Body parser ───────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(require('./lib/security').sanitizeRequestBody);

// ── Rate limiting ─────────────────────────────────────────────
app.use('/api/',      rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));
app.use('/api/auth/', rateLimit({ windowMs: 15 * 60 * 1000, max: 20  }));
app.use('/api/auth/password-reset', rateLimit({ windowMs: 60 * 60 * 1000, max: 8, standardHeaders: true, legacyHeaders: false }));
// Public tracking lookups require email + order number. Keep this endpoint
// tighter than the general API to discourage automated guessing.
app.use('/api/orders/track', rateLimit({ windowMs: 15 * 60 * 1000, max: 30 }));

// ── Routes ────────────────────────────────────────────────────
app.use('/api/sales', require('./routes/sales'));
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/checkout', require('./routes/checkout'));
app.use('/api/orders',   require('./routes/orders'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/paypal', require('./routes/paypal'));
app.use('/api/upload',   require('./routes/upload'));

// ── Health check ──────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ ok: true }));

// ── Global error handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err);
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'Image must be 10 MB or smaller' });
  if (err.code === 'LIMIT_UNEXPECTED_FILE') return res.status(400).json({ error: 'Expected one image in the photo field' });
  const status = Number.isInteger(err.status) && err.status >= 400 && err.status <= 599 ? err.status : 500;
  res.status(status).json({ error: status >= 500 ? 'Internal server error' : (err.message || 'Request failed') });
});

const PORT = process.env.PORT || 3001;
require('./lib/sales').initialize().then(() => {
  app.listen(PORT, () => console.log(`Who's Steering API running on :${PORT}`));
}).catch(err => { console.error('Sales schema initialization failed:', err.message); process.exit(1); });
