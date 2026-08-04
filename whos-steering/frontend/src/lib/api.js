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
  const isBmwFSeries = config.brand === 'BMW' && config.wheelStyleType === 'F-Series';

  if (config.brand === 'AUDI') {
    // Audi base: B9 $699.99, R8 $799.99; +$40 if carbon top
    if (config.wheelStyleType === 'R8') price = (rules.base_audi_r8 ?? 799.99) + (isCarbonTop ? 40 : 0);
    else price = (rules.base_audi_b9 ?? 699.99) + (isCarbonTop ? 40 : 0);
  } else {
    // BMW base: G-Series $549.99, F-Series $449.99; +$40 if carbon top
    if (config.wheelStyleType === 'F-Series') {
      price = rules.base_bmw_f ?? 449.99;
      if (isCarbonTop) price += 40;
    } else {
      price = rules.base_bmw_g ?? 549.99;
      if (isCarbonTop) price += 40;
    }
  }

  // Airbag cover is free on BMW F-Series, otherwise it's a paid add-on
  if (config.airbagCompat !== false && !isBmwFSeries) price += (rules.airbag_compat ?? 25);
  if (config.airbagUpgrade === true) price += (rules.airbag_upgrade ?? 75);

  // Magnetic paddle shifters: +$25 for all brands/styles
  if (config.paddleShifters === 'Magnetic') price += (rules.paddle_magnetic ?? 25);

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