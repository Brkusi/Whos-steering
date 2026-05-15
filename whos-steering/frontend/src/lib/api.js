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
  let price = config.brand === 'AUDI'
    ? (rules.base_audi ?? 750)
    : (rules.base_bmw ?? 849.99);
  if (config.airbagCompat !== false) price += (rules.airbag_compat ?? 75);
  if (config.brand === 'AUDI' && config.heated !== false) price += (rules.heated_audi ?? 25);
  if (config.paddleShifters === 'Magnetic') price += (rules.paddle_magnetic ?? 0);
  return price;
}
