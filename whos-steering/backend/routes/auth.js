const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const { sanitizeText } = require('../lib/security');

const PASSWORD_ROUNDS = Math.min(12, Math.max(10, Number(process.env.BCRYPT_ROUNDS) || 10));

function signToken(user, rememberMe = false) {
  return jwt.sign(
    { id: user.id, email: user.email, isAdmin: user.is_admin },
    process.env.JWT_SECRET,
    { expiresIn: rememberMe ? '30d' : '12h' }
  );
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { password } = req.body;
  const firstName = sanitizeText(req.body.firstName, 80);
  const lastName = sanitizeText(req.body.lastName, 80);
  const email = sanitizeText(req.body.email, 254).toLowerCase();
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

  try {
    const exists = await pool.query('SELECT id FROM customers WHERE email = $1', [email]);
    if (exists.rows.length) return res.status(409).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, PASSWORD_ROUNDS);
    const { rows } = await pool.query(
      `INSERT INTO customers (email, first_name, last_name, password_hash)
       VALUES ($1, $2, $3, $4) RETURNING id, email, first_name, last_name, is_admin`,
      [email, firstName, lastName, hash]
    );
    res.status(201).json({ token: signToken(rows[0]), user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { password } = req.body;
  const email = sanitizeText(req.body.email, 254).toLowerCase();
  const rememberMe = req.body.rememberMe === true;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    const { rows } = await pool.query(
      'SELECT id, email, first_name, last_name, password_hash, is_admin FROM customers WHERE email = $1', [email]
    );
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash || '');
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    res.json({ token: signToken(user, rememberMe), user: { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name, isAdmin: user.is_admin } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/auth/me
router.get('/me', require('../middleware/auth').authRequired, async (req, res) => {
  const { rows } = await pool.query(
    'SELECT id, email, first_name, last_name, is_admin, created_at FROM customers WHERE id = $1',
    [req.user.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'User not found' });
  res.json(rows[0]);
});

module.exports = router;
