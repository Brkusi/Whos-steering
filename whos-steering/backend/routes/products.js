const router = require('express').Router();
const pool = require('../db/pool');
const { adminRequired } = require('../middleware/auth');

// GET /api/products  — public
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*, i.qty_on_hand, i.qty_reserved
       FROM products p
       LEFT JOIN inventory i ON i.product_id = p.id
       WHERE p.is_active = TRUE
       ORDER BY p.created_at`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/:id — public
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*, i.qty_on_hand, i.qty_reserved
       FROM products p
       LEFT JOIN inventory i ON i.product_id = p.id
       WHERE p.id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Product not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// GET /api/products/pricing/rules — public
router.get('/pricing/rules', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT rule_key, description, amount FROM pricing_rules WHERE is_active = TRUE'
    );
    // Return as a keyed object for easy frontend lookup
    const rules = {};
    rows.forEach(r => { rules[r.rule_key] = parseFloat(r.amount); });
    res.json(rules);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pricing' });
  }
});

// ── ADMIN ─────────────────────────────────────────────────────

// POST /api/products — admin
router.post('/', adminRequired, async (req, res) => {
  const { sku, brand, name, description, base_price, stripe_color, features } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO products (sku, brand, name, description, base_price, stripe_color, features)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [sku, brand, name, description, base_price, stripe_color, JSON.stringify(features || [])]
    );
    // Create inventory row
    await pool.query('INSERT INTO inventory (product_id, qty_on_hand) VALUES ($1, 0)', [rows[0].id]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PATCH /api/products/:id — admin
router.patch('/:id', adminRequired, async (req, res) => {
  const fields = ['name','description','base_price','stripe_color','features','is_active'];
  const updates = [];
  const vals = [];
  let i = 1;
  fields.forEach(f => {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = $${i++}`);
      vals.push(f === 'features' ? JSON.stringify(req.body[f]) : req.body[f]);
    }
  });
  if (!updates.length) return res.status(400).json({ error: 'Nothing to update' });
  vals.push(req.params.id);
  try {
    const { rows } = await pool.query(
      `UPDATE products SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`,
      vals
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// PATCH /api/products/:id/inventory — admin
router.patch('/:id/inventory', adminRequired, async (req, res) => {
  const { qty_on_hand } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE inventory SET qty_on_hand = $1 WHERE product_id = $2 RETURNING *`,
      [qty_on_hand, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update inventory' });
  }
});

module.exports = router;
