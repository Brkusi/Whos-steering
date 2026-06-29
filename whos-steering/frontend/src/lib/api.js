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

  if (config.brand === 'AUDI') {
    price = config.wheelStyleType === 'R8'
      ? (rules.base_audi_r8 ?? 864.99)
      : (rules.base_audi_rs ?? 799.99);
  } else {
    price = rules.base_bmw ?? 849.99;
  }

  if (config.airbagCompat !== false) price += (rules.airbag_compat ?? 50);
  if (config.airbagUpgrade === true) price += (rules.airbag_upgrade ?? 75);
  if (config.paddleShifters === 'Magnetic') price += (rules.paddle_magnetic ?? 0);
  if (config.startStopButtons === true) price += 40;
  if (config.ledDisplay === true) price += 50;

  return price;
}