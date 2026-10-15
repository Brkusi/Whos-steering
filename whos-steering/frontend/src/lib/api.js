import { hasCarbonPaddles, usesBmw2D } from './bmwFSeriesConfiguration';

// ─── API helper ──────────────────────────────────────────────────────────────
const BASE = process.env.REACT_APP_API_URL || '';

export function authToken() {
  return localStorage.getItem('ws_token') || sessionStorage.getItem('ws_token');
}

export async function apiFetch(path, opts = {}) {
  const token = authToken();
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...opts.headers,
      },
      ...opts,
    });
  } catch (cause) {
    const error = new Error('The account service is temporarily unavailable. Please try again shortly.');
    error.code = 'NETWORK_ERROR';
    throw error;
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(res.status >= 500
      ? 'The account service is temporarily unavailable. Please try again shortly.'
      : data.error || `Request failed (${res.status})`);
    error.status = res.status;
    throw error;
  }
  return data;
}

// ─── Pricing (mirrors server logic, uses live rules) ─────────────────────────
export function calcPrice(config, rules = {}) {
  let price;
  const isCarbonTop = config.topBottomMat && config.topBottomMat.toLowerCase().includes('carbon');
  const isBmwFSeries = config.brand === 'BMW' && config.wheelStyleType === 'F-Series';
  const isBmw2010 = config.brand === 'BMW' && config.wheelStyleType === 'BMW 2010–2019';
  if (isBmw2010) {
    let total = 899;
    if (config.topBottomMat === 'Forged Carbon') total += 175;
    if (['Glossy Carbon','Matte Carbon','Forged Carbon'].includes(config.bmwLowerTrim)) total += 50;
    if (config.airbagCompat) total += 200;
    if (['Glossy Carbon','Matte Carbon','Forged Carbon'].includes(config.paddleShifters)) total += 200;
    if (['Magnetic','Urus Style'].includes(config.paddleShifters)) total += (rules.paddle_magnetic ?? 25);
    if (config.heated) total += 125;
    if (config.ledDisplay) total += (rules.rpm_gauge_bmw ?? 100);
    return total;
  }

  if (config.brand === 'AUDI') {
    // Audi base varies by wheel family; +$40 if carbon top.
    if (config.wheelStyleType === 'R8') price = (rules.base_audi_r8 ?? 799.99) + (isCarbonTop ? 40 : 0);
    else if (config.wheelStyleType === 'RS 2020+') price = (rules.base_audi_b95 ?? 799.99) + (isCarbonTop ? 40 : 0);
    else price = (rules.base_audi_b9 ?? 699.99) + (isCarbonTop ? 40 : 0);
  } else if (config.brand === 'MERCEDES') {
    price = (config.wheelStyleType === 'Mercedes 2010–2015'
      ? (rules.base_mercedes_2010 ?? 699.99)
      : (rules.base_mercedes_modern ?? 799.99)) + (isCarbonTop ? 40 : 0);
  } else if (config.brand === 'TOYOTA') {
    price = (rules.base_toyota_gr ?? 699.99) + (isCarbonTop ? 40 : 0);
  } else if (config.brand === 'PORSCHE' || config.brand === 'DODGE_SRT') {
    price = (config.brand === 'PORSCHE' ? (rules.base_porsche_911 ?? 899.99) : (rules.base_dodge_srt ?? 699.99)) + (isCarbonTop ? 40 : 0);
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

  // Carbon paddle shifters: +$25 for the source 2D wheels and magnetic paddles.
  if (['Magnetic','Urus Style'].includes(config.paddleShifters) || hasCarbonPaddles(config) || (config.brand === 'AUDI' && config.wheelStyleType === 'B8.5' && ['Racing Style 1','Racing Style 2'].includes(config.paddleShifters))) price += (rules.paddle_magnetic ?? 25);

  if (usesBmw2D(config) && ['Glossy Carbon','Matte Carbon','Forged Carbon'].includes(config.bmwLowerTrim)) price += (rules.bmw_lower_trim ?? 50);

  // Non-Audi option prices are shared across the supported wheel families.
  if (['BMW','MERCEDES','TOYOTA','PORSCHE','DODGE_SRT'].includes(config.brand)) {
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
