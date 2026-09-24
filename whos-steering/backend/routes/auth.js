const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../db/pool');
const { sanitizeText } = require('../lib/security');
const { sendEmail, escapeHtml } = require('../lib/email');

const PASSWORD_ROUNDS = Math.min(12, Math.max(10, Number(process.env.BCRYPT_ROUNDS) || 10));
const DUMMY_PASSWORD_HASH = '$2a$10$G7mLQTpQ8Vh4sT4E0O8TROiYK7.YQ8E1n6a2vI1s80QfLw1D0Jp5K';
const RESET_TTL_MINUTES = 10;
const RESET_MAX_ATTEMPTS = 5;

function validPassword(password) {
  return typeof password === 'string' && password.length >= 12 && password.length <= 128 &&
    Buffer.byteLength(password, 'utf8') <= 72 &&
    /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password);
}

function hashResetCode(customerId, code) {
  const secret = process.env.PASSWORD_RESET_SECRET || process.env.JWT_SECRET;
  return crypto.createHmac('sha256', secret).update(`${customerId}:${code}`).digest('hex');
}

function signToken(user, rememberMe = false) {
  return jwt.sign(
    { id: user.id, email: user.email, isAdmin: user.is_admin, sessionVersion: user.session_version },
    process.env.JWT_SECRET,
    { expiresIn: rememberMe ? '30d' : '12h' }
  );
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const password = req.body?.password;
  const firstName = sanitizeText(req.body?.firstName, 80);
  const lastName = sanitizeText(req.body?.lastName, 80);
  const email = sanitizeText(req.body?.email, 254).toLowerCase();
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email address' });
  if (!validPassword(password)) return res.status(400).json({ error: 'Use 12–128 characters (72 UTF-8 bytes maximum) with uppercase, lowercase, and a number' });

  try {
    const exists = await pool.query('SELECT id FROM customers WHERE email = $1', [email]);
    if (exists.rows.length) return res.status(409).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, PASSWORD_ROUNDS);
    const { rows } = await pool.query(
      `INSERT INTO customers (email, first_name, last_name, password_hash)
       VALUES ($1, $2, $3, $4) RETURNING id, email, first_name, last_name, is_admin, session_version`,
      [email, firstName, lastName, hash]
    );
    res.status(201).json({ token: signToken(rows[0]), user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

async function issuePasswordReset(email) {
  const client = await pool.connect();
  let resetId;
  let user;
  let code;
  try {
    await client.query('BEGIN');
    // Serializing by customer also makes the per-account cooldown reliable for
    // simultaneous requests arriving through different server instances.
    const found = await client.query(
      'SELECT id, first_name, email FROM customers WHERE email=$1 AND password_hash IS NOT NULL FOR UPDATE',
      [email]
    );
    user = found.rows[0];
    if (!user) {
      await client.query('COMMIT');
      return;
    }
    const recent = await client.query(
      `SELECT 1 FROM password_reset_codes WHERE customer_id=$1 AND used_at IS NULL
       AND created_at > NOW()-INTERVAL '60 seconds' LIMIT 1`, [user.id]
    );
    if (recent.rows.length) {
      await client.query('COMMIT');
      return;
    }
    code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
    const created = await client.query(
      `INSERT INTO password_reset_codes(customer_id,code_hash,expires_at)
       VALUES($1,$2,NOW()+($3*INTERVAL '1 minute')) RETURNING id`,
      [user.id, hashResetCode(user.id, code), RESET_TTL_MINUTES]
    );
    resetId = created.rows[0].id;
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }

  try {
    const delivered = await sendEmail({
      to: user.email,
      subject: "Your Who's Steering verification code",
      idempotencyKey: `password-reset-${resetId}`,
      html: `<h1>Reset your password</h1><p>Hi ${escapeHtml(user.first_name || 'there')},</p><p>Use this verification code to reset your password:</p><p style="font-size:30px;font-weight:800;letter-spacing:8px">${code}</p><p>This code expires in ${RESET_TTL_MINUTES} minutes and can only be used once. If you did not request this, you can safely ignore this email.</p>`,
    });
    if (!delivered) throw new Error('Email service is not configured');
  } catch (err) {
    await pool.query('DELETE FROM password_reset_codes WHERE id=$1', [resetId]).catch(() => {});
    throw err;
  }
  // Earlier codes remain usable if delivery fails; retire them only after
  // the replacement is accepted by the email provider.
  await pool.query('UPDATE password_reset_codes SET used_at=NOW() WHERE customer_id=$1 AND id<>$2 AND used_at IS NULL', [user.id, resetId]);
}

// Reply before looking up the account or contacting the mail provider so
// response timing does not reveal whether an address is registered.
router.post('/password-reset/request', (req, res) => {
  const email = sanitizeText(req.body?.email, 254).toLowerCase();
  res.json({ message: 'If an account matches that email, a verification code is on its way.' });
  if (/^\S+@\S+\.\S+$/.test(email)) {
    void issuePasswordReset(email).catch(err => console.error('Password reset request failed:', err.message));
  }
});

// POST /api/auth/password-reset/confirm
router.post('/password-reset/confirm', async (req, res) => {
  const email = sanitizeText(req.body?.email, 254).toLowerCase();
  const code = String(req.body?.code || '').trim();
  const password = req.body?.password;
  if (!/^\S+@\S+\.\S+$/.test(email) || !/^\d{6}$/.test(code)) {
    return res.status(400).json({ error: 'Enter the email address and six-digit verification code.' });
  }
  if (!validPassword(password)) {
    return res.status(400).json({ error: 'Use 12–128 characters (72 UTF-8 bytes maximum) with uppercase, lowercase, and a number.' });
  }

  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');
    const { rows } = await client.query(
      `SELECT pr.id,pr.customer_id,pr.code_hash,pr.attempts
       FROM password_reset_codes pr JOIN customers c ON c.id=pr.customer_id
       WHERE c.email=$1 AND pr.used_at IS NULL AND pr.expires_at>NOW()
       ORDER BY pr.created_at DESC LIMIT 1 FOR UPDATE OF pr`,
      [email]
    );
    if (!rows.length || rows[0].attempts >= RESET_MAX_ATTEMPTS) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'That code is invalid or expired. Request a new code.' });
    }
    const reset = rows[0];
    const supplied = Buffer.from(hashResetCode(reset.customer_id, code), 'hex');
    const expected = Buffer.from(reset.code_hash, 'hex');
    if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) {
      await client.query('UPDATE password_reset_codes SET attempts=attempts+1 WHERE id=$1', [reset.id]);
      await client.query('COMMIT');
      return res.status(400).json({ error: 'That code is invalid or expired. Request a new code.' });
    }
    const hash = await bcrypt.hash(password, PASSWORD_ROUNDS);
    await client.query('UPDATE customers SET password_hash=$1,session_version=session_version+1,updated_at=NOW() WHERE id=$2', [hash, reset.customer_id]);
    await client.query('UPDATE password_reset_codes SET used_at=NOW() WHERE customer_id=$1 AND used_at IS NULL', [reset.customer_id]);
    await client.query('COMMIT');
    res.json({ message: 'Password updated. You can now sign in.' });
  } catch (err) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    console.error('Password reset confirmation failed:', err.message);
    res.status(500).json({ error: 'Unable to reset the password right now.' });
  } finally {
    client?.release();
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const password = req.body?.password;
  const email = sanitizeText(req.body?.email, 254).toLowerCase();
  const rememberMe = req.body?.rememberMe === true;
  if (!email || typeof password !== 'string' || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    const { rows } = await pool.query(
      'SELECT id, email, first_name, last_name, password_hash, is_admin, session_version FROM customers WHERE email = $1', [email]
    );
    const user = rows[0];
    const valid = await bcrypt.compare(password, user?.password_hash || DUMMY_PASSWORD_HASH);
    if (!user || !valid) return res.status(401).json({ error: 'Invalid credentials' });

    res.json({ token: signToken(user, rememberMe), user: { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name, isAdmin: user.is_admin } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/auth/me
router.get('/me', require('../middleware/auth').authRequired, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, first_name, last_name, is_admin, created_at FROM customers WHERE id = $1',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Account lookup failed:', err.message);
    res.status(500).json({ error: 'Unable to load account right now.' });
  }
});

module.exports = router;
