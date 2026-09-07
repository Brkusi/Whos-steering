const router = require('express').Router();
const pool = require('../db/pool');
const {
  adminRequired
} = require('../middleware/auth');
const {
  validateRefund,
  paymentSnapshot,
  syncRefunds
} = require('../lib/refunds');
const stripeClient = () => require('stripe')(process.env.STRIPE_SECRET_KEY);
router.use(adminRequired);
router.get('/', async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  try {
    const {
      rows
    } = await pool.query(`SELECT p.id,p.order_id,p.amount,p.currency,p.status,p.refunded_amount,p.created_at,
      COALESCE(c.email,o.guest_email) AS email, o.status AS order_status
      FROM payments p JOIN orders o ON o.id=p.order_id LEFT JOIN customers c ON c.id=o.customer_id
      ORDER BY p.created_at DESC LIMIT 51 OFFSET $1`, [(page - 1) * 50]);
    res.json({
      payments: rows.slice(0, 50),
      hasMore: rows.length > 50
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Unable to load payments. Please retry.'
    });
  }
});
router.get('/:id', async (req, res) => {
  try {
    const {
      rows
    } = await pool.query('SELECT * FROM payments WHERE id=$1', [req.params.id]);
    if (!rows.length) return res.status(404).json({
      error: 'Payment not found.'
    });
    if (rows[0].provider === 'paypal') return res.json(await require('../lib/paypal').snapshot(pool, rows[0]));
    res.json(await paymentSnapshot(stripeClient(), rows[0].stripe_payment_intent));
  } catch (err) {
    console.error(err);
    res.status(502).json({
      error: 'Unable to verify the current payment with Stripe. Please retry.'
    });
  }
});
router.post('/:id/refunds', async (req, res) => {
  try {
    validateRefund(req.body);
  } catch (err) {
    return res.status(400).json({
      error: err.message
    });
  }
  const {
    rows: providerRows
  } = await pool.query('SELECT * FROM payments WHERE id=$1', [req.params.id]);
  if (providerRows[0]?.provider === 'paypal') {
    try {
      return res.json(await require('../lib/paypal-refund').issuePaypalRefund(pool, providerRows[0], req.body, req.user.id));
    } catch (err) {
      console.error(err);
      return res.status(502).json({
        error: err.message || 'Unable to confirm the PayPal refund. Retry the same request.'
      });
    }
  }
  const stripe = stripeClient();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Same order lock as customer cancellation. Concurrent requests cannot spend the same balance.
    const {
      rows
    } = await client.query(`SELECT p.stripe_payment_intent,p.order_id,o.status FROM payments p JOIN orders o ON o.id=p.order_id WHERE p.id=$1 FOR UPDATE OF o`, [req.params.id]);
    if (!rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        error: 'Payment not found.'
      });
    }
    const payment = rows[0];
    const snapshot = await paymentSnapshot(stripe, payment.stripe_payment_intent);
    // Stripe metadata makes retries recoverable even after its 24h idempotency cache expires.
    let refund = snapshot.refunds.find(r => r.requestId === req.body.requestId);
    if (refund && (refund.amount !== req.body.amount || refund.reason !== req.body.reason || refund.note !== req.body.note.trim())) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        error: 'This request was already used for a different refund. Refresh the payment.'
      });
    }
    if (!refund) {
      if (snapshot.status !== 'succeeded' || req.body.amount > snapshot.available) {
        await client.query('ROLLBACK');
        return res.status(409).json({
          error: 'The refundable balance changed or the payment is not complete. Refresh before retrying.'
        });
      }
      refund = await stripe.refunds.create({
        payment_intent: payment.stripe_payment_intent,
        amount: req.body.amount,
        reason: req.body.reason,
        metadata: {
          requestId: req.body.requestId,
          orderId: payment.order_id,
          adminId: req.user.id,
          note: req.body.note.trim()
        }
      }, {
        idempotencyKey: `admin-refund-${req.params.id}-${req.body.requestId}`
      });
    }
    const updated = await syncRefunds(client, stripe, payment.stripe_payment_intent);
    const auditNote = `Admin refund ${refund.id}: ${(refund.amount / 100).toFixed(2)} ${snapshot.currency.toUpperCase()} — ${req.body.note.trim()}`;
    await client.query(`INSERT INTO order_status_history(order_id,from_status,to_status,note,changed_by)
      SELECT $1,$2,(SELECT status FROM orders WHERE id=$1),$3,$4 WHERE NOT EXISTS(SELECT 1 FROM order_status_history WHERE order_id=$1 AND note=$3)`, [payment.order_id, payment.status, auditNote, req.user.id]);
    await client.query('COMMIT');
    res.json({
      refund: {
        id: refund.id,
        status: refund.status,
        amount: refund.amount
      },
      payment: updated
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Admin refund failed', err);
    res.status(502).json({
      error: 'Unable to confirm the refund result. Retry this same request to safely recover its status.'
    });
  } finally {
    client.release();
  }
});
module.exports = router;
