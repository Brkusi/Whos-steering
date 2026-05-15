const router = require('express').Router();
const pool = require('../db/pool');
const { authRequired, adminRequired } = require('../middleware/auth');

// GET /api/orders/my  — customer's own orders
router.get('/my', authRequired, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT o.*, 
              json_agg(json_build_object(
                'id', oi.id,
                'item_name', oi.item_name,
                'item_detail', oi.item_detail,
                'unit_price', oi.unit_price,
                'quantity', oi.quantity,
                'line_total', oi.line_total,
                'config', row_to_json(wc)
              )) AS items
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN wheel_configurations wc ON wc.id = oi.wheel_config_id
       WHERE o.customer_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/:id  — single order (customer or admin)
router.get('/:id', authRequired, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT o.*,
              p.stripe_payment_intent, p.stripe_charge_id, p.receipt_url, p.status AS payment_status,
              json_agg(DISTINCT jsonb_build_object(
                'id', oi.id,
                'item_name', oi.item_name,
                'item_detail', oi.item_detail,
                'unit_price', oi.unit_price,
                'quantity', oi.quantity,
                'line_total', oi.line_total,
                'config', row_to_json(wc)
              )) AS items,
              json_agg(DISTINCT jsonb_build_object(
                'to_status', sh.to_status,
                'note', sh.note,
                'created_at', sh.created_at
              ) ORDER BY sh.created_at) AS status_history
       FROM orders o
       LEFT JOIN payments p ON p.order_id = o.id
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN wheel_configurations wc ON wc.id = oi.wheel_config_id
       LEFT JOIN order_status_history sh ON sh.order_id = o.id
       WHERE o.id = $1
       GROUP BY o.id, p.stripe_payment_intent, p.stripe_charge_id, p.receipt_url, p.status`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Order not found' });
    const order = rows[0];
    // Customers can only view their own orders
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

// PATCH /api/orders/:id/status  — update order status (admin)
router.patch('/:id/status', adminRequired, async (req, res) => {
  const { status, note } = req.body;
  const validStatuses = ['pending','payment_processing','paid','in_build','quality_check','shipped','delivered','cancelled','refunded'];
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );
    if (!rows.length) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Order not found' }); }

    await client.query(
      `INSERT INTO order_status_history (order_id, from_status, to_status, note, changed_by)
       VALUES ($1,$2,$3,$4,$5)`,
      [req.params.id, rows[0].status, status, note || null, req.user.id]
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

// GET /api/orders/admin/stats  — dashboard stats
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

module.exports = router;
