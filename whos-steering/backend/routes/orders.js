const router = require('express').Router();
const pool = require('../db/pool');
const { authRequired, adminRequired } = require('../middleware/auth');

// GET /api/orders/my  — customer's own orders
router.get('/my', authRequired, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT o.*,
              (
                SELECT json_agg(row_to_json(item_data))
                FROM (
                  SELECT oi.id, oi.item_name, oi.item_detail, oi.unit_price, oi.quantity, oi.line_total,
                         row_to_json(wc) AS config
                  FROM order_items oi
                  LEFT JOIN wheel_configurations wc ON wc.id = oi.wheel_config_id
                  WHERE oi.order_id = o.id
                ) item_data
              ) AS items
       FROM orders o
       WHERE o.customer_id = $1
         AND o.status IN (
           'paid',
           'in_build',
           'quality_check',
           'shipped',
           'delivered',
           'cancelled',
           'refunded'
         )
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/admin/stats  — dashboard stats (must be before /:id)
router.get('/admin/stats', adminRequired, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status NOT IN ('cancelled','refunded')) AS total_orders,
        COUNT(*) FILTER (WHERE status = 'paid') AS paid,
        COUNT(*) FILTER (WHERE status = 'in_build') AS in_build,
        COUNT(*) FILTER (WHERE status = 'shipped') AS shipped,
        COALESCE(SUM(total) FILTER (WHERE status NOT IN ('cancelled','refunded','pending')), 0) AS total_revenue,
        COALESCE(SUM(total) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days' AND status NOT IN ('cancelled','refunded')), 0) AS revenue_30d
      FROM orders
    `);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});


// POST /api/orders/:id/cancel
// Customer cancellation is allowed ONLY while the order is paid and has not
// entered production. Cancellation is paired to a Stripe refund.
router.post('/:id/cancel', authRequired, async (req, res) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Lock the order row so an admin cannot move it into production while a
    // customer cancellation/refund is being processed.
    const { rows } = await client.query(
      `SELECT
         o.id,
         o.customer_id,
         o.guest_email,
         o.status,
         o.total,
         p.stripe_payment_intent,
         p.status AS payment_status
       FROM orders o
       LEFT JOIN payments p ON p.order_id = o.id
       WHERE o.id = $1
       FOR UPDATE OF o`,
      [req.params.id]
    );

    if (!rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = rows[0];

    const ownsOrder =
      order.customer_id === req.user.id ||
      order.guest_email === req.user.email;

    if (!ownsOrder && !req.user.is_admin && !req.user.isAdmin) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Access denied' });
    }

    // "paid" is the cancellation window. Once admin changes status to
    // in_build, quality_check, shipped, etc. cancellation is closed.
    if (order.status !== 'paid') {
      await client.query('ROLLBACK');

      if (['in_build', 'quality_check', 'shipped', 'delivered'].includes(order.status)) {
        return res.status(409).json({
          error: 'This order can no longer be canceled because order processing has started.',
          cancellationClosed: true,
        });
      }

      if (order.status === 'cancelled' || order.status === 'refunded') {
        return res.status(409).json({
          error: 'This order has already been canceled or refunded.',
          alreadyCancelled: true,
        });
      }

      return res.status(409).json({
        error: 'This order is not currently eligible for cancellation.',
      });
    }

    if (!order.stripe_payment_intent) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        error: 'No completed Stripe payment is attached to this order.',
      });
    }

    // The idempotency key protects against accidental double-refunds from
    // repeated clicks/retries for the same order.
    const refund = await stripe.refunds.create(
      {
        payment_intent: order.stripe_payment_intent,
        reason: 'requested_by_customer',
        metadata: {
          orderId: order.id,
          cancelledBy: req.user.id || req.user.email || 'customer',
        },
      },
      {
        idempotencyKey: `customer-cancel-${order.id}`,
      }
    );

    await client.query(
      `UPDATE orders
       SET status = 'cancelled', updated_at = NOW()
       WHERE id = $1`,
      [order.id]
    );

    await client.query(
      `UPDATE payments
       SET refunded_amount = GREATEST(
             COALESCE(refunded_amount, 0),
             $2::numeric
           ),
           refund_reason = 'requested_by_customer',
           updated_at = NOW()
       WHERE order_id = $1`,
      [order.id, (refund.amount / 100).toFixed(2)]
    );

    await client.query(
      `INSERT INTO order_status_history
        (order_id, from_status, to_status, note, changed_by)
       VALUES ($1, 'paid', 'cancelled', $2, $3)`,
      [
        order.id,
        `Customer canceled before processing. Stripe refund ${refund.id} initiated.`,
        req.user.id || null,
      ]
    );

    await client.query('COMMIT');

    res.json({
      ok: true,
      orderId: order.id,
      status: 'cancelled',
      refundId: refund.id,
      refundStatus: refund.status,
      message: 'Order canceled. Refund initiated to the original payment method.',
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Customer cancel error:', err);

    const message =
      err?.type === 'StripeInvalidRequestError'
        ? 'This payment could not be refunded automatically. Please contact support.'
        : 'Unable to cancel this order right now. Please try again or contact support.';

    res.status(500).json({ error: message });
  } finally {
    client.release();
  }
});

// GET /api/orders/:id  — single order (customer or admin)
router.get('/:id', authRequired, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT o.*,
              p.stripe_payment_intent, p.stripe_charge_id, p.receipt_url, p.status AS payment_status,
              (
                SELECT json_agg(row_to_json(item_data))
                FROM (
                  SELECT oi.id, oi.item_name, oi.item_detail, oi.unit_price, oi.quantity, oi.line_total,
                         row_to_json(wc) AS config
                  FROM order_items oi
                  LEFT JOIN wheel_configurations wc ON wc.id = oi.wheel_config_id
                  WHERE oi.order_id = o.id
                ) item_data
              ) AS items,
              (
                SELECT json_agg(row_to_json(hist_data) ORDER BY hist_data.created_at)
                FROM (
                  SELECT sh.to_status, sh.note, sh.created_at
                  FROM order_status_history sh
                  WHERE sh.order_id = o.id
                ) hist_data
              ) AS status_history
       FROM orders o
       LEFT JOIN payments p ON p.order_id = o.id
       WHERE o.id = $1
       GROUP BY o.id, p.stripe_payment_intent, p.stripe_charge_id, p.receipt_url, p.status`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Order not found' });
    const order = rows[0];
    if (!req.user.isAdmin && order.customer_id !== req.user.id && order.guest_email !== req.user.email) {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// ── ADMIN ─────────────────────────────────────────────────────────────────

// GET /api/orders  — all orders (admin)
router.get('/', adminRequired, async (req, res) => {
  const { status, page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;
  let whereClause = '';
  const vals = [limit, offset];
  if (status) { whereClause = 'WHERE o.status = $3'; vals.push(status); }

  try {
    const { rows } = await pool.query(
      `SELECT o.*, c.email AS customer_email, c.first_name, c.last_name,
              p.stripe_payment_intent, p.status AS payment_status,
              COUNT(oi.id) AS item_count
       FROM orders o
       LEFT JOIN customers c ON c.id = o.customer_id
       LEFT JOIN payments p ON p.order_id = o.id
       LEFT JOIN order_items oi ON oi.order_id = o.id
       ${whereClause}
       GROUP BY o.id, c.email, c.first_name, c.last_name, p.stripe_payment_intent, p.status
       ORDER BY o.created_at DESC
       LIMIT $1 OFFSET $2`,
      vals
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// PATCH /api/orders/:id/status  — update order status + tracking (admin)
router.patch('/:id/status', adminRequired, async (req, res) => {
  const { status, note, tracking } = req.body;
  const validStatuses = ['pending','payment_processing','paid','in_build','quality_check','shipped','delivered','cancelled','refunded'];
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: beforeRows } = await client.query(
      `SELECT status FROM orders WHERE id = $1 FOR UPDATE`,
      [req.params.id]
    );
    if (!beforeRows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Order not found' });
    }
    const previousStatus = beforeRows[0].status;

    let updateQuery, updateVals;
    if (tracking && (tracking.number || tracking.carrier || tracking.url)) {
      updateQuery = `UPDATE orders SET status=$1, updated_at=NOW(), tracking_carrier=$3, tracking_number=$4, tracking_url=$5 WHERE id=$2 RETURNING *`;
      updateVals  = [status, req.params.id, tracking.carrier||null, tracking.number||null, tracking.url||null];
    } else {
      updateQuery = `UPDATE orders SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *`;
      updateVals  = [status, req.params.id];
    }
    const { rows } = await client.query(updateQuery, updateVals);
    if (!rows.length) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Order not found' }); }
    await client.query(
      `INSERT INTO order_status_history (order_id, from_status, to_status, note, changed_by) VALUES ($1,$2,$3,$4,$5)`,
      [req.params.id, previousStatus, status, note||null, req.user.id]
    );
    await client.query('COMMIT');
    res.json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to update order status' });
  } finally {
    client.release();
  }
});

module.exports = router;