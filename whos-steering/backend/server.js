require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const rateLimit = require('express-rate-limit');
const pool    = require('./db/pool');

const app = express();

// ── CORS ──────────────────────────────────────────────────────
app.use(cors());
app.options('*', cors());

// ── Security headers ──────────────────────────────────────────
app.use(helmet());

// ── Stripe webhook — RAW body BEFORE json parser ──────────────
app.post('/api/checkout/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const stripeLib = require('stripe');
    const stripe    = stripeLib(process.env.STRIPE_SECRET_KEY);
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

      if (event.type === 'charge.refunded') {
        const charge = event.data.object;

        const { rows: paymentRows } = await pool.query(
          `UPDATE payments
           SET refunded_amount = $1,
               refund_reason = COALESCE(refund_reason, 'requested_by_customer'),
               updated_at = NOW()
           WHERE stripe_charge_id = $2
           RETURNING order_id`,
          [(charge.amount_refunded / 100).toFixed(2), charge.id]
        );

        if (paymentRows.length) {
          const orderId = paymentRows[0].order_id;

          const { rows: orderRows } = await pool.query(
            `UPDATE orders
             SET status = 'refunded', updated_at = NOW()
             WHERE id = $1
               AND status IN ('paid','cancelled')
             RETURNING id, status`,
            [orderId]
          );

          if (orderRows.length) {
            await pool.query(
              `INSERT INTO order_status_history
                (order_id, from_status, to_status, note)
               VALUES ($1,'cancelled','refunded','Stripe confirmed the refund')`,
              [orderId]
            );
          }
        }
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

// ── Rate limiting ─────────────────────────────────────────────
app.use('/api/',      rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));
app.use('/api/auth/', rateLimit({ windowMs: 15 * 60 * 1000, max: 20  }));

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
