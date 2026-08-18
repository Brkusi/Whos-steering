onst router = require('express').Router();
const pool   = require('../db/pool');

const hasText = (value) => typeof value === 'string' && value.trim().length > 0;

const PROMO_CODES = Object.freeze({
  complaints: {
    code: 'complaints',
    percentOff: 10,
    label: '10% OFF',
  },
});

const normalizePromoCode = (value) =>
  typeof value === 'string' ? value.trim().toLowerCase() : '';

function getPromo(value) {
  const code = normalizePromoCode(value);
  return code ? PROMO_CODES[code] || null : null;
}


function validateRequiredColors(cfg) {
  // Presets and legacy product-only cart items do not use the full configurator.
  const isConfiguratorBuild = !cfg.isPreset && (
    cfg.vehicleYear !== undefined ||
    cfg.vehicleModel !== undefined ||
    cfg.topBottomMat !== undefined ||
    cfg.wheelStyleType !== undefined
  );

  if (!isConfiguratorBuild) return [];

  const missing = [];
  const topIsCarbon = hasText(cfg.topBottomMat) && cfg.topBottomMat.toLowerCase().includes('carbon');
  const sideIsCarbon = hasText(cfg.sideMat) && cfg.sideMat.toLowerCase().includes('carbon');

  if (!(topIsCarbon
    ? (cfg.topBottomCarbonCol || hasText(cfg.topBottomCustomColor))
    : (cfg.topBottomCol || hasText(cfg.topBottomCustomColor)))) {
    missing.push('Top & Bottom Color');
  }

  if (!(sideIsCarbon
    ? (cfg.sideCarbonCol || hasText(cfg.sideCustomColor))
    : (cfg.sideCol || hasText(cfg.sideCustomColor)))) {
    missing.push('Side Grip Color');
  }

  if (!(cfg.stitchColor || hasText(cfg.stitchCustomColor))) {
    missing.push('Stitch Color');
  }

  if (cfg.brand === 'AUDI') {
    if (!(cfg.plasticTrimCol || hasText(cfg.plasticTrimCustomColor))) {
      missing.push('Plastic Trim Color');
    }

    if (!cfg.innerTrimMatchCarbon && !(cfg.innerTrimCol || hasText(cfg.innerTrimCustomColor))) {
      missing.push('Inner Trim Color');
    }
  }

  if (cfg.airbagCompat === true) {
    if (!cfg.airbagMat) missing.push('Airbag Material');
    if (!(cfg.airbagCol || hasText(cfg.airbagCustomColor))) missing.push('Airbag Color');
    if (!(cfg.airbagStitchColor || hasText(cfg.airbagStitchCustomColor))) missing.push('Airbag Stitch Color');

    if (cfg.brand === 'AUDI' && !(cfg.audiLogoCol || hasText(cfg.audiLogoCustomColor))) {
      missing.push('Audi Logo Color');
    }
  }

  return missing;
}



// POST /api/checkout/validate-promo
// Promo rules live on the server so the browser cannot invent a discount.
router.post('/validate-promo', (req, res) => {
  const code = normalizePromoCode(req.body?.code);

  if (!code) {
    return res.json({ valid: false, error: 'Enter a promo code.' });
  }

  const promo = getPromo(code);

  if (!promo) {
    return res.json({ valid: false, error: 'Promo code not recognized.' });
  }

  res.json({
    valid: true,
    code: promo.code,
    percentOff: promo.percentOff,
    label: promo.label,
  });
});

// GET /api/checkout/verify-payment
// Used by the return/confirmation page. Stripe is the source of truth:
// the UI must never show ORDER PLACED until the PaymentIntent is succeeded.
router.get('/verify-payment', async (req, res) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const { orderId, paymentIntent } = req.query;

  if (!orderId || !paymentIntent) {
    return res.status(400).json({
      error: 'Missing orderId or paymentIntent.',
    });
  }

  try {
    const pi = await stripe.paymentIntents.retrieve(paymentIntent);

    if (pi.metadata?.orderId !== orderId) {
      return res.status(403).json({
        error: 'Payment does not match this order.',
      });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      await client.query(
        `UPDATE payments
         SET status = $1,
             stripe_charge_id = COALESCE($2, stripe_charge_id),
             updated_at = NOW()
         WHERE order_id = $3
           AND stripe_payment_intent = $4`,
        [pi.status, pi.latest_charge || null, orderId, pi.id]
      );

      // Only a Stripe "succeeded" PaymentIntent can promote the order to paid.
      if (pi.status === 'succeeded') {
        const { rows: changed } = await client.query(
          `UPDATE orders
           SET status = 'paid', updated_at = NOW()
           WHERE id = $1
             AND status IN ('pending', 'payment_processing')
           RETURNING id`,
          [orderId]
        );

        if (changed.length) {
          await client.query(
            `INSERT INTO order_status_history
              (order_id, from_status, to_status, note)
             VALUES ($1, 'pending', 'paid', 'Payment verified with Stripe')`,
            [orderId]
          );
        }
      }

      const { rows: orderRows } = await client.query(
        `SELECT id, status, total
         FROM orders
         WHERE id = $1`,
        [orderId]
      );

      await client.query('COMMIT');

      if (!orderRows.length) {
        return res.status(404).json({ error: 'Order not found.' });
      }

      res.json({
        orderId,
        paymentStatus: pi.status,
        orderStatus: orderRows[0].status,
        total: orderRows[0].total,
        paid: pi.status === 'succeeded',
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Payment verification error:', err);
    res.status(500).json({
      error: 'Unable to verify payment status.',
    });
  }
});

// POST /api/checkout/create-intent
router.post('/create-intent', async (req, res) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const { cartItems, customer, shippingAddress, promoCode } = req.body;

  if (!customer?.email) {
    return res.status(400).json({ error: 'Missing customer email' });
  }

  for (const item of cartItems || []) {
    const missingColors = validateRequiredColors(item.config || {});
    if (missingColors.length) {
      return res.status(400).json({
        error: `Please choose all required color options: ${missingColors.join(', ')}`,
        missingOptions: missingColors,
      });
    }
  }

  const normalizedPromoCode = normalizePromoCode(promoCode);
  const promo = getPromo(normalizedPromoCode);

  if (normalizedPromoCode && !promo) {
    return res.status(400).json({ error: 'Promo code is invalid.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Resolve customer ID from JWT if logged in
    let customerId = null;
    const authHeader = req.headers.authorization || '';
    if (authHeader.startsWith('Bearer ')) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET);
        customerId = decoded.id;
      } catch {}
    }

    let totalCents = 0;
    const savedConfigs = [];

    for (const item of cartItems) {
      const cfg = item.config || {};
      let amountCents;

      if (cfg.isPreset) {
        // Trust frontend price for preset items
        amountCents = Math.round((item.price || 0) * 100);
      } else if (cfg.brand) {
        // Recalculate server-side for custom builds
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
           audi_badge, outer_trim_col, inner_trim_col, photo_url, calculated_price, config_json)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
         RETURNING id`,
        [
          cfg.brand || 'BMW',
          cfg.vehicleYear   || cfg.vehicle_year   || '',
          cfg.vehicleModel  || cfg.vehicle_model  || '',
          cfg.wheelStyle    || cfg.wheel_style    || 'Standard',
          cfg.paddleShifters|| cfg.paddle_shifters|| 'Standard',
          cfg.topBottomMat  || cfg.top_bottom_mat || 'Alcantara',
          cfg.topBottomCol  || cfg.top_bottom_col || null,
          cfg.sideMat       || cfg.side_mat       || 'Alcantara',
          cfg.sideCol       || cfg.side_col       || null,
          cfg.stripeConceptId || cfg.stripe_mode  || 'none',
          cfg.stripeColor   || cfg.stripe_color   || null,
          cfg.triKey        || cfg.tri_key        || null,
          cfg.airbagCompat !== false,
          cfg.heated !== false,
          cfg.laneAssist !== false,
          cfg.audiBadge || cfg.audi_badge || null,
          cfg.plasticTrimCol || cfg.outerTrimCol || cfg.outer_trim_col || null,
          cfg.innerTrimMatchCarbon ? 'MATCH_CARBON' : (cfg.innerTrimCol || cfg.inner_trim_col || null),
          cfg.photoUrl || cfg.photo_url || null,
          (amountCents / 100).toFixed(2),
          cfg,
        ]
      );

      savedConfigs.push({
        configId: cfgRows[0].id,
        amountCents,
        quantity: item.quantity || 1,
        name: cfg.presetName || item.name,
        detail: item.detail,
      });
    }

    const subtotalCents = totalCents;
    const discountCents = promo
      ? Math.round(subtotalCents * (promo.percentOff / 100))
      : 0;

    totalCents = Math.max(0, subtotalCents - discountCents);

    const subtotalDollars = (subtotalCents / 100).toFixed(2);
    const discountDollars = (discountCents / 100).toFixed(2);
    const totalDollars = (totalCents / 100).toFixed(2);

    const { rows: orderRows } = await client.query(
      `INSERT INTO orders
        (customer_id, guest_email, status, subtotal, total,
         shipping_name, shipping_address1, shipping_address2,
         shipping_city, shipping_state, shipping_zip, shipping_country)
       VALUES ($1,$2,'pending',$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING id`,
      [
        customerId,
        customer.email,
        subtotalDollars,
        totalDollars,
        shippingAddress?.name     || customer.name || '',
        shippingAddress?.address1 || '',
        shippingAddress?.address2 || '',
        shippingAddress?.city     || '',
        shippingAddress?.state    || '',
        shippingAddress?.zip      || '',
        shippingAddress?.country  || 'US',
      ]
    );
    const orderId = orderRows[0].id;

    for (const sc of savedConfigs) {
      await client.query(
        `INSERT INTO order_items
          (order_id, wheel_config_id, item_name, item_detail, unit_price, quantity, line_total)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [
          orderId, sc.configId, sc.name, sc.detail,
          (sc.amountCents / 100).toFixed(2),
          sc.quantity,
          ((sc.amountCents * sc.quantity) / 100).toFixed(2),
        ]
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: 'usd',
      receipt_email: customer.email,
      metadata: {
        orderId,
        customerEmail: customer.email,
        promoCode: promo?.code || '',
        promoPercent: promo ? String(promo.percentOff) : '0',
        discountAmount: discountDollars,
      },
      automatic_payment_methods: { enabled: true },
    });

    await client.query(
      `INSERT INTO payments (order_id, stripe_payment_intent, amount, status)
       VALUES ($1,$2,$3,$4)`,
      [orderId, paymentIntent.id, totalDollars, paymentIntent.status]
    );

    await client.query(
      `INSERT INTO order_status_history (order_id, to_status, note)
       VALUES ($1,'pending',$2)`,
      [
        orderId,
        promo
          ? `Order created at checkout — promo ${promo.code} (${promo.percentOff}% off, -$${discountDollars})`
          : 'Order created at checkout',
      ]
    );

    await client.query('COMMIT');
    res.json({
      clientSecret: paymentIntent.client_secret,
      orderId,
      subtotal: subtotalDollars,
      discount: discountDollars,
      amount: totalDollars,
      promoCode: promo?.code || null,
      promoPercent: promo?.percentOff || 0,
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Checkout error:', err);
    res.status(500).json({ error: 'Checkout failed. Please try again.' });
  } finally {
    client.release();
  }
});

// Server-side price calculation for custom builds
async function calcServerPrice(cfg) {
  const { rows } = await pool.query(
    'SELECT rule_key, amount FROM pricing_rules WHERE is_active = TRUE'
  );
  const rules = {};
  rows.forEach(r => { rules[r.rule_key] = parseFloat(r.amount); });

  let price;
  const isCarbonTop = cfg.topBottomMat && cfg.topBottomMat.toLowerCase().includes('carbon');
  const isBmwFSeries = cfg.brand === 'BMW' && cfg.wheelStyleType === 'F-Series';

  if (cfg.brand === 'AUDI') {
    if (cfg.wheelStyleType === 'R8') price = (rules.base_audi_r8 || 799.99) + (isCarbonTop ? 40 : 0);
    else price = (rules.base_audi_b9 || 699.99) + (isCarbonTop ? 40 : 0);
  } else {
    if (cfg.wheelStyleType === 'F-Series') {
      price = rules.base_bmw_f || 449.99;
      if (isCarbonTop) price += 40;
    } else {
      price = rules.base_bmw_g || 549.99;
      if (isCarbonTop) price += 40;
    }
  }

  // Airbag cover is free on BMW F-Series, otherwise it's a paid add-on
  if (cfg.airbagCompat !== false && !isBmwFSeries) price += (rules.airbag_compat  || 25);
  if (cfg.airbagUpgrade === true)    price += (rules.airbag_upgrade  || 75);

  // Magnetic paddle shifters: +$25 for all brands/styles
  if (cfg.paddleShifters === 'Magnetic') price += (rules.paddle_magnetic || 25);

  if (cfg.brand === 'BMW') {
    if (cfg.heated !== false)            price += (rules.heated_bmw      || 75);
    if (cfg.laneAssist !== false)        price += (rules.lane_assist_bmw || 30);
    if (cfg.ledDisplay === true)         price += (rules.rpm_gauge_bmw   || 100);
  }
  if (cfg.brand === 'AUDI') {
    if (cfg.startStopButtons === true) price += 40;
    if (cfg.ledDisplay === true)       price += 50;
  }

  return Math.round(price * 100);
}

module.exports = router;