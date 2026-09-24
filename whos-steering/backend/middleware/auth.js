const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

async function currentAccount(token, database = pool) {
  const claims = jwt.verify(token, process.env.JWT_SECRET);
  if (!claims.id) return null;
  const { rows } = await database.query(
    'SELECT id, email, is_admin, session_version FROM customers WHERE id=$1',
    [claims.id]
  );
  const account = rows[0];
  if (!account || (claims.sessionVersion ?? 0) !== account.session_version) return null;
  return { id: account.id, email: account.email, isAdmin: account.is_admin };
}

async function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    req.user = await currentAccount(token);
    if (!req.user) return res.status(401).json({ error: 'Invalid or expired token' });
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError || err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    next(err);
  }
}

function adminRequired(req, res, next) {
  return authRequired(req, res, (err) => {
    if (err) return next(err);
    if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin access required' });
    next();
  });
}

module.exports = { authRequired, adminRequired, currentAccount };
