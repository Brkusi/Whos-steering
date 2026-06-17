const router = require('express').Router();
const pool = require('../db/pool');

// ── Server-side price calculation for CUSTOM builds only ─────────────────────
async function calcServerPrice(config) {
  const { rows } = await pool.query(
    'SELECT rule_key, amount FROM pricing_rules WHERE is_active = TRUE'
  );
  const rules = {};
  rows.forEach(r => { rules[r.rule_key] = parseFloat(r.amount); });

  let price = config.brand === 'AUDI'
    ? (rules.base_audi || 750)
    : (rules.base_bmw || 849.99);

  if (config.airbagCompat !== false) price += (rules.airbag_compat || 50);
  if (config.airbagUpgrade === true) price += (rules.airbag_upgrade || 25);
  if (config.brand === 'AUDI' && config.heated !== false) price += (rules.heated_audi || 25);
  if (config.paddleShifters === 'Magnetic' || config.paddle_shifters === 'Magnetic') price += (rules.paddle_magnetic || 0);

  return Math.round(price * 100); // cents
}

// POST /api/checkout/create-intent
router.post('/create-intent', async (req, res) => {
  const { config, customer, shippingAddress, cartItems } = req.body;

  if (!customer?.email) {
    return res.status(400).json({ error: 'Missing required checkout data' });
  }

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let customerId = null;
    if (req.headers.authorization) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(
          req.headers.authorization.replace('Bearer ', ''),
          process.env.JWT_SECRET
        );
        customerId = decoded.id;
      } catch {}
    }

    let totalCents = 0;
    const savedConfigs = [];

    for (const item of cartItems) {
      const cfg = item.config || config || {};

      let amountCents;

      // PRESET items: trust the price the frontend calculated
      // CUSTOM builds: recalculate server-side for security
      if (cfg.isPreset) {
        amountCents = Math.round((item.price || 0) * 100);
      } else if (cfg.brand) {
        amountCents = await calcServerPrice(cfg);
      } else {
        amountCents = Math.round((item.price || 0) * 100);
      }

      totalCents += amountCents * (item.quantity || 1);

      const { rows: cfgRows } = await client.query(
        `INSERT INTO wheel_configurations
          (brand, vehicle_year, vehicle_model, wheel_style, paddle_shifters,
           top_bottom_mat, top_bottom_col, side_mat, side_col,
           stripe_mode, stripe_color, tri_key,
           airbag_compat, heated, lane_assist,
           audi_badge, outer_trim_col, inner_trim_col, photo_url, calculated_price)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
         RETURNING id`,
        [
          cfg.brand || 'AUDI',
          cfg.vehicleYear || cfg.vehicle_year || '',
          cfg.vehicleModel || cfg.vehicle_model || '',
          cfg.wheelStyle || cfg.wheel_style || 'Standard',
          cfg.paddleShifters || cfg.paddle_shifters || 'Standard',
          cfg.topBottomMat || cfg.top_bottom_mat || 'Alcantara',
          cfg.topBottomCol || cfg.top_bottom_col || null,
          cfg.sideMat || cfg.side_mat || 'Alcantara',
          cfg.sideCol || cfg.side_col || null,
          cfg.stripeConceptId || cfg.stripe_mode || 'none',
          cfg.stripeColor || cfg.stripe_color || null,
          cfg.triKey || cfg.tri_key || null,
          cfg.airbagCompat !== false,
          cfg.heated !== false,
          cfg.laneAssist !== false,
          cfg.audiBadge || cfg.audi_badge || null,
          cfg.outerTrimCol || cfg.outer_trim_col || null,
          cfg.innerTrimCol || cfg.inner_trim_col || null,
          cfg.photoUrl || cfg.photo_url || null,
          (amountCents / 100).toFixed(2),
        ]
      );

      savedConfigs.push({
        configId: cfgRows[0].id,
        amountCents,
        quantity: item.quantity || 1,
        // Use the preset name from config if available, otherwise item name
        name: cfg.presetName || item.name,
        detail: item.detail,
      });
    }

    const totalDollars = (totalCents / 100).toFixed(2);

    const { rows: orderRows } = await client.query(
      `INSERT INTO orders
        (customer_id, guest_email, status, subtotal, total,
         shipping_name, shipping_address1, shipping_city, shipping_state, shipping_zip, shipping_country)
       VALUES ($1,$2,'pending',$3,$3,$4,$5,$6,$7,$8,$9)
       RETURNING id`,
      [
        customerId,
        customer.email,
        totalDollars,
        shippingAddress?.name || customer.name || '',
        shippingAddress?.address1 || '',
        shippingAddress?.city || '',
        shippingAddress?.state || '',
        shippingAddress?.zip || '',
        shippingAddress?.country || 'US',
      ]
    );
    const orderId = orderRows[0].id;

    for (const sc of savedConfigs) {
      await client.query(
        `INSERT INTO order_items (order_id, wheel_config_id, item_name, item_detail, unit_price, quantity, line_total)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [
          orderId, sc.configId, sc.name, sc.detail,
          (sc.amountCents / 100).toFixed(2), sc.quantity,
          ((sc.amountCents * sc.quantity) / 100).toFixed(2),
        ]
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: 'usd',
      receipt_email: customer.email,
      metadata: { orderId, customerEmail: customer.email },
      automatic_payment_methods: { enabled: true },
    });

    await client.query(
      `INSERT INTO payments (order_id, stripe_payment_intent, amount, status)
       VALUES ($1,$2,$3,$4)`,
      [orderId, paymentIntent.id, totalDollars, paymentIntent.status]
    );

    await client.query(
      `INSERT INTO order_status_history (order_id, to_status, note)
       VALUES ($1,'pending','Order created at checkout')`,
      [orderId]
    );

    await client.query('COMMIT');

    res.json({
      clientSecret: paymentIntent.client_secret,
      orderId,
      amount: totalDollars,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Checkout error:', err);
    res.status(500).json({ error: 'Checkout failed. Please try again.' });
  } finally {
    client.release();
  }
});

module.exports = router;
