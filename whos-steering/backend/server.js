require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const pool = require('./db/pool');

const app = express();

// ── Security headers ─────────────────────────────────────────
app.use(helmet());

// ── CORS ─────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'https://whossteering.com',
    'https://www.whossteering.com',
    'https://whos-steering.netlify.app',
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
}));

// ── Stripe webhook — RAW body BEFORE json parser ──────────────
app.post('/api/checkout/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
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
        `UPDATE payments SET status = 'succeeded', stripe_charge_id = $1 WHERE stripe_payment_intent = $2`,
        [pi.latest_charge, pi.id]
      );
      await pool.query(
        `UPDATE orders SET status = 'paid', updated_at = NOW() WHERE id = $1 AND status = 'pending'`,
        [pi.metadata.orderId]
      );
      await pool.query(
        `INSERT INTO order_status_history (order_id, from_status, to_status, note)
         VALUES ($1,'pending','paid','Payment confirmed via Stripe webhook')`,
        [pi.metadata.orderId]
      );
    }

    if (event.type === 'payment_intent.payment_failed') {
      await pool.query(
        `UPDATE payments SET status = 'failed' WHERE stripe_payment_intent = $1`,
        [pi.id]
      );
    }

    if (event.type === 'charge.refunded') {
      const charge = event.data.object;
      await pool.query(
        `UPDATE payments SET refunded_amount = $1 WHERE stripe_charge_id = $2`,
        [(charge.amount_refunded / 100).toFixed(2), charge.id]
      );
      await pool.query(
        `UPDATE orders SET status = 'refunded', updated_at = NOW()
         WHERE id = (SELECT order_id FROM payments WHERE stripe_charge_id = $1)`,
        [charge.id]
      );
    }
  } catch (err) {
    console.error('Webhook handler error:', err);
  }

  res.json({ received: true });
});

// ── Body parser ──────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));

// ── Rate limiting ─────────────────────────────────────────────
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));
app.use('/api/auth/', rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/checkout', require('./routes/checkout'));
app.use('/api/orders',   require('./routes/orders'));
app.use('/api/upload',   require('./routes/upload'));

// ── Health check ──────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ ok: true }));

// ── Global error handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Who's Steering API running on :${PORT}`));
