const router = require('express').Router();
const crypto = require('crypto');
const pool = require('../db/pool');
const { adminRequired } = require('../middleware/auth');
const mail = require('../lib/mail');
const { recordPaidCustomOrder } = require('../lib/custom-order-payment');
const stripeClient = () => require('stripe')(process.env.STRIPE_SECRET_KEY);
const siteUrl = () => (process.env.FRONTEND_URL || 'https://whossteering.com').split(',')[0].trim().replace(/\/$/, '');
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char]);
const uuid = value => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value || '');

function amountCents(value) {
  const text = String(value ?? '').trim();
  if (!/^(?:\d{1,6})(?:\.\d{1,2})?$/.test(text)) return null;
  const [dollars, fraction = ''] = text.split('.');
  const cents = Number(dollars) * 100 + Number(fraction.padEnd(2, '0'));
  return cents >= 50 && cents <= 99999999 ? cents : null;
}

function orderFields(row) {
  return {
    orderId: row.order_id,
    email: row.guest_email,
    title: row.title,
    description: row.description,
    amount: Number(row.total).toFixed(2),
    status: row.status,
    checkoutUrl: row.checkout_url,
    expiresAt: row.checkout_expires_at,
    emailSentAt: row.email_sent_at,
    createdAt: row.created_at,
  };
}

const selectOrder = `SELECT c.*,o.guest_email,o.total,o.status
  FROM custom_orders c JOIN orders o ON o.id=c.order_id`;

async function createSession(stripe, orderId, email, title, description, cents, idempotencyKey) {
  return stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: email,
    client_reference_id: orderId,
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: { name: title, ...(description ? { description } : {}) },
        unit_amount: cents,
      },
      quantity: 1,
    }],
    metadata: { orderId, customOrder: 'true' },
    payment_intent_data: { metadata: { orderId, customOrder: 'true' } },
    success_url: `${siteUrl()}/custom-order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl()}/custom-order-confirmation?cancelled=1`,
  }, { idempotencyKey });
}

async function sendOrderEmail(order) {
  const attempt = Number(order.email_attempts) + 1;
  // Increment before sending so an uncertain provider response cannot reuse
  // the same idempotency key for a later, intentional resend.
  await pool.query('UPDATE custom_orders SET email_attempts=$2 WHERE order_id=$1', [order.order_id, attempt]);
  if (!mail.mailReady()) return false;
  try {
    const amount = Number(order.total).toFixed(2);
    await mail.sendEmail({
      to: order.guest_email,
      subject: `Your custom order payment link · Who's Steering`,
      idempotencyKey: `custom-order-${order.order_id}-${attempt}`,
      html: `<h1>Your custom order is ready</h1><p>${escape(order.title)}</p>${order.description ? `<p>${escape(order.description).replace(/\n/g, '<br>')}</p>` : ''}<p>Total due: <strong>$${amount} USD</strong></p><p><a href="${escape(order.checkout_url)}">Pay securely with Stripe</a></p><p>This private payment link expires ${escape(new Date(order.checkout_expires_at).toUTCString())}. If it expires, please contact Who's Steering for a new link.</p><p>Order #${escape(order.order_id.slice(0, 8).toUpperCase())}</p>`,
    });
    await pool.query('UPDATE custom_orders SET email_sent_at=NOW() WHERE order_id=$1', [order.order_id]);
    return true;
  } catch (err) {
    console.error('Custom order email failed:', err);
    return false;
  }
}

// A Stripe Checkout Session ID is unguessable. Stripe still verifies the
// payment and its amount before the public receipt changes order state.
router.get('/confirm', async (req, res) => {
  const sessionId = req.query.sessionId;
  if (typeof sessionId !== 'string' || !/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) return res.status(400).json({ error: 'Invalid payment session.' });
  try {
    const { rows } = await pool.query(`${selectOrder} WHERE c.stripe_session_id=$1`, [sessionId]);
    if (!rows.length) return res.status(404).json({ error: 'Custom order not found.' });
    const order = rows[0];
    const session = await stripeClient().checkout.sessions.retrieve(sessionId);
    if (session.client_reference_id !== order.order_id || session.amount_total !== Math.round(Number(order.total) * 100) || session.currency !== 'usd') {
      return res.status(409).json({ error: 'Payment does not match this order.' });
    }
    let paid = false;
    if (session.payment_status === 'paid' && session.payment_intent) {
      const pi = await stripeClient().paymentIntents.retrieve(session.payment_intent);
      paid = await recordPaidCustomOrder(pi, 'Stripe return');
    }
    res.json({ orderId: order.order_id.slice(0, 8).toUpperCase(), title: order.title, amount: Number(order.total).toFixed(2), paid });
  } catch (err) {
    console.error('Custom order confirmation failed:', err);
    res.status(502).json({ error: 'Unable to verify payment with Stripe. Please try again.' });
  }
});

router.use(adminRequired);

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`${selectOrder} ORDER BY c.created_at DESC LIMIT 100`);
    res.json({ orders: rows.map(orderFields) });
  } catch (err) {
    console.error('Custom orders list failed:', err);
    res.status(500).json({ error: 'Unable to load custom orders.' });
  }
});

router.post('/', async (req, res) => {
  const { email, title, description = '', price, requestId } = req.body || {};
  const cents = amountCents(price);
  if (!uuid(requestId) || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || email.length > 254 ||
      typeof title !== 'string' || !title.trim() || title.trim().length > 120 ||
      typeof description !== 'string' || description.length > 2000 || cents === null) {
    return res.status(400).json({ error: 'Enter a valid email, title, and price of at least $0.50.' });
  }
  const cleanEmail = email.trim().toLowerCase();
  const cleanTitle = title.trim();
  const cleanDescription = description.trim();
  let client;
  let order;
  let existing = false;
  try {
    client = await pool.connect();
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [requestId]);
    const previous = await client.query(`${selectOrder} WHERE c.order_id=$1`, [requestId]);
    if (previous.rows.length) {
      order = previous.rows[0];
      existing = true;
      if (order.guest_email !== cleanEmail || order.title !== cleanTitle || order.description !== cleanDescription || Math.round(Number(order.total) * 100) !== cents) {
        await client.query('ROLLBACK');
        return res.status(409).json({ error: 'This request ID was already used for a different order.' });
      }
    } else {
      const stripe = stripeClient();
      const session = await createSession(stripe, requestId, cleanEmail, cleanTitle, cleanDescription, cents, `custom-order-${requestId}`);
      const amount = (cents / 100).toFixed(2);
      await client.query(`INSERT INTO orders(id,guest_email,status,subtotal,total) VALUES($1,$2,'pending',$3,$3)`, [requestId, cleanEmail, amount]);
      await client.query(`INSERT INTO order_items(order_id,item_name,item_detail,unit_price,quantity,line_total) VALUES($1,$2,$3,$4,1,$4)`, [requestId, cleanTitle, cleanDescription, amount]);
      await client.query(`INSERT INTO custom_orders(order_id,title,description,stripe_session_id,checkout_url,checkout_expires_at,created_by) VALUES($1,$2,$3,$4,$5,to_timestamp($6),$7)`, [requestId, cleanTitle, cleanDescription, session.id, session.url, session.expires_at, req.user.id]);
      await client.query(`INSERT INTO order_status_history(order_id,to_status,note,changed_by) VALUES($1,'pending','Custom order created',$2)`, [requestId, req.user.id]);
      const current = await client.query(`${selectOrder} WHERE c.order_id=$1`, [requestId]);
      order = current.rows[0];
    }
    await client.query('COMMIT');
    client.release();
    client = null;
    const sent = existing ? Boolean(order.email_sent_at) : await sendOrderEmail(order);
    const fresh = await pool.query(`${selectOrder} WHERE c.order_id=$1`, [order.order_id]);
    res.status(existing ? 200 : 201).json({ order: orderFields(fresh.rows[0]), emailSent: sent });
  } catch (err) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    console.error('Custom order creation failed:', err);
    res.status(502).json({ error: 'Unable to create the payment link. Please retry.' });
  } finally {
    client?.release();
  }
});

router.post('/:orderId/send', async (req, res) => {
  if (!uuid(req.params.orderId)) return res.status(400).json({ error: 'Invalid order ID.' });
  let client;
  let order;
  try {
    client = await pool.connect();
    await client.query('BEGIN');
    const { rows } = await client.query(`${selectOrder} WHERE c.order_id=$1 FOR UPDATE OF o,c`, [req.params.orderId]);
    order = rows[0];
    if (!order) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Custom order not found.' }); }
    if (order.status !== 'pending') { await client.query('ROLLBACK'); return res.status(409).json({ error: 'This order is no longer awaiting payment.' }); }
    const stripe = stripeClient();
    const currentSession = await stripe.checkout.sessions.retrieve(order.stripe_session_id);
    if (currentSession.payment_status === 'paid' || currentSession.status === 'complete') {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Stripe already received this payment. Refresh the order status.' });
    }
    if (new Date(order.checkout_expires_at).getTime() < Date.now() + 10 * 60 * 1000 || currentSession.status === 'expired') {
      if (currentSession.status === 'open') await stripe.checkout.sessions.expire(order.stripe_session_id);
      const session = await createSession(stripe, order.order_id, order.guest_email, order.title, order.description, Math.round(Number(order.total) * 100), `custom-order-renew-${order.order_id}-${crypto.randomUUID()}`);
      await client.query(`UPDATE custom_orders SET stripe_session_id=$2,checkout_url=$3,checkout_expires_at=to_timestamp($4),email_sent_at=NULL WHERE order_id=$1`, [order.order_id, session.id, session.url, session.expires_at]);
      order = (await client.query(`${selectOrder} WHERE c.order_id=$1`, [order.order_id])).rows[0];
    }
    await client.query('COMMIT');
    client.release();
    client = null;
    const emailSent = await sendOrderEmail(order);
    const fresh = await pool.query(`${selectOrder} WHERE c.order_id=$1`, [order.order_id]);
    res.json({ order: orderFields(fresh.rows[0]), emailSent });
  } catch (err) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    console.error('Custom order send failed:', err);
    res.status(502).json({ error: 'Unable to prepare the payment link. Please retry.' });
  } finally {
    client?.release();
  }
});

module.exports = router;
module.exports.amountCents = amountCents;
