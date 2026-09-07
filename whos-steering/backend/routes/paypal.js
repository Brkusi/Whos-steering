const router = require('express').Router();
const pool = require('../db/pool');
const paypal = require('../lib/paypal');
const jwt = require('jsonwebtoken');
router.get('/availability', (req, res) => res.json({
  enabled: paypal.enabled()
}));
router.post('/capture', async (req, res) => {
  try {
    const token = jwt.verify(req.body.checkoutToken, process.env.JWT_SECRET);
    if (token.scope !== 'paypal-checkout' || token.orderId !== req.body.orderId) throw new Error();
  } catch {
    return res.status(403).json({
      error: 'This checkout session could not be verified. Please contact support if payment was approved.'
    });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const {
      rows
    } = await client.query("SELECT p.* FROM payments p JOIN orders o ON o.id=p.order_id WHERE p.order_id=$1 AND p.provider='paypal' FOR UPDATE OF o", [req.body.orderId]);
    if (!rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        error: 'Payment not found.'
      });
    }
    const result = await paypal.captureOrder(client, rows[0]);
    await client.query('COMMIT');
    res.json(result);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(502).json({
      error: 'PayPal confirmation is unavailable. Retry this confirmation; do not pay again.'
    });
  } finally {
    client.release();
  }
});
router.post('/webhook', async (req, res) => {
  if (!process.env.PAYPAL_WEBHOOK_ID) return res.status(503).json({
    error: 'Webhook is not configured.'
  });
  try {
    const verified = await paypal.request('/v1/notifications/verify-webhook-signature', {
      method: 'POST',
      body: {
        auth_algo: req.headers['paypal-auth-algo'],
        cert_url: req.headers['paypal-cert-url'],
        transmission_id: req.headers['paypal-transmission-id'],
        transmission_sig: req.headers['paypal-transmission-sig'],
        transmission_time: req.headers['paypal-transmission-time'],
        webhook_id: process.env.PAYPAL_WEBHOOK_ID,
        webhook_event: req.body
      }
    });
    if (verified.verification_status !== 'SUCCESS') return res.status(400).json({
      error: 'Invalid webhook signature.'
    });
    if (req.body.event_type === 'PAYMENT.CAPTURE.REFUNDED' && req.body.resource?.id) {
      const refund = await paypal.request(`/v2/payments/refunds/${encodeURIComponent(req.body.resource.id)}`);
      const captureLink = refund.links?.find(l => l.rel === 'up')?.href;
      const captureId = captureLink ? new URL(captureLink).pathname.split('/').pop() : null;
      if (captureId) {
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          const {
            rows
          } = await client.query('SELECT p.* FROM payments p JOIN orders o ON o.id=p.order_id WHERE p.paypal_capture_id=$1 FOR UPDATE OF o', [captureId]);
          if (rows.length) {
            const payment = rows[0];
            const {
              rows: existing
            } = await client.query('SELECT request_id FROM paypal_refund_requests WHERE provider_id=$1 OR request_id=$2', [refund.id, refund.custom_id || '']);
            if (existing.length) await client.query('UPDATE paypal_refund_requests SET provider_id=$1,status=$2 WHERE request_id=$3', [refund.id, refund.status, existing[0].request_id]);else await client.query(`INSERT INTO paypal_refund_requests(request_id,payment_id,amount_cents,reason,note,provider_id,status) VALUES($1,$2,$3,'requested_by_customer','Refund issued through PayPal',$4,$5) ON CONFLICT(provider_id) DO UPDATE SET status=EXCLUDED.status`, ['external-' + refund.id, payment.id, Math.round(Number(refund.amount.value) * 100), refund.id, refund.status]);
            const updated = await paypal.snapshot(client, payment);
            if (updated.amount > 0 && updated.completed >= updated.amount) {
              const {
                rows: changed
              } = await client.query("UPDATE orders SET status='refunded',updated_at=NOW() WHERE id=$1 AND status<>'refunded' RETURNING id", [payment.order_id]);
              if (changed.length) await client.query("INSERT INTO order_status_history(order_id,to_status,note) VALUES($1,'refunded','Full refund confirmed by PayPal')", [payment.order_id]);
            }
          }
          await client.query('COMMIT');
        } catch (err) {
          await client.query('ROLLBACK');
          throw err;
        } finally {
          client.release();
        }
      }
    }
    const orderId = req.body.resource?.supplementary_data?.related_ids?.order_id;
    if (orderId && ['PAYMENT.CAPTURE.COMPLETED', 'PAYMENT.CAPTURE.PENDING', 'PAYMENT.CAPTURE.DENIED'].includes(req.body.event_type)) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const {
          rows
        } = await client.query('SELECT p.* FROM payments p JOIN orders o ON o.id=p.order_id WHERE p.paypal_order_id=$1 FOR UPDATE OF o', [orderId]);
        if (rows.length) await paypal.captureOrder(client, rows[0]);
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    }
    res.json({
      received: true
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Webhook processing failed.'
    });
  }
});
module.exports = router;
