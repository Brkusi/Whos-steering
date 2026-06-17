require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// ── Security headers ─────────────────────────────────────────
app.use(helmet());

// ── CORS ─────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));

// ── Stripe webhook needs RAW body — mount BEFORE json parser ─
app.post(
  '/api/checkout/webhook',
  express.raw({ type: 'application/json' }),
  (req, res, next) => { req.rawBody = req.body; next(); },
  require('./routes/checkout').webhook // see note below
);

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
