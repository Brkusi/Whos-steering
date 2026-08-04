// ─── API helper ──────────────────────────────────────────────────────────────
const BASE = process.env.REACT_APP_API_URL || '';

export async function apiFetch(path, opts = {}) {
  const token = localStorage.getItem('ws_token');
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts.headers,
    },
    ...opts,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// ─── Pricing (mirrors server logic, uses live rules) ─────────────────────────
export function calcPrice(config, rules = {}) {
  let price;
  const isCarbonTop = config.topBottomMat && config.topBottomMat.toLowerCase().includes('carbon');

  if (config.brand === 'AUDI') {
    // Audi base: $729.99, +$50 if carbon top
    price = rules.base_audi ?? 729.99;
    if (isCarbonTop) price += 50;
    if (config.wheelStyleType === 'R8') price = (rules.base_audi_r8 ?? 864.99) + (isCarbonTop ? 50 : 0);
    else if (config.wheelStyleType === 'B9') price = (rules.base_audi_b9 ?? rules.base_audi_rs ?? 729.99) + (isCarbonTop ? 50 : 0);
  } else {
    // BMW base: G-Series $549.99, F-Series $449.99; G-Series +$50 if carbon top
    if (config.wheelStyleType === 'F-Series') {
      price = rules.base_bmw_f ?? 449.99;
    } else {
      price = rules.base_bmw_g ?? 549.99;
      if (isCarbonTop) price += 50;
    }
  }

  if (config.airbagCompat !== false) price += (rules.airbag_compat ?? 25);
  if (config.airbagUpgrade === true) price += (rules.airbag_upgrade ?? 75);

  // $40 discount when Top & Bottom material is not any type of carbon
  if (!isCarbonTop) price -= (rules.non_carbon_discount ?? 40);

  // Magnetic paddle shifters: +$25, except Audi B9 style which includes them at no extra cost
  const isAudiB9 = config.brand === 'AUDI' && config.wheelStyleType === 'B9';
  if (config.paddleShifters === 'Magnetic' && !isAudiB9) price += (rules.paddle_magnetic ?? 25);

  // BMW-only add-ons
  if (config.brand === 'BMW') {
    if (config.heated !== false)   price += (rules.heated_bmw ?? 75);
    if (config.laneAssist !== false) price += (rules.lane_assist_bmw ?? 30);
    if (config.ledDisplay === true) price += (rules.rpm_gauge_bmw ?? 100);
  }
  // Audi-only add-ons
  if (config.brand === 'AUDI') {
    if (config.startStopButtons === true) price += 40;
    if (config.ledDisplay === true) price += 50;
  }

  return price;
}