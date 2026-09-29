export const VEHICLE_MAKES = [
  { value: 'AUDI', label: 'Audi', available: true },
  { value: 'BMW', label: 'BMW', available: true },
  { value: 'DODGE_SRT', label: 'Dodge SRT', available: false },
  { value: 'MERCEDES', label: 'Mercedes', available: false },
  { value: 'TOYOTA', label: 'Toyota', available: false },
  { value: 'PORSCHE', label: 'Porsche', available: false },
];

export const isConfigurableMake = make => VEHICLE_MAKES.some(item => item.value === make && item.available);

// The label reflects the published make/year coverage; the customer's photo
// still receives final fitment review before production.
export function wheelMatchesVehicle(config, style) {
  const year = Number(config.vehicleYear);
  if (!Number.isInteger(year) || year < 1900 || year > 2100 || !String(config.vehicleModel || '').trim()) return false;
  if (config.brand === 'AUDI') {
    if (style === 'RS 2020+') return year >= 2020 && /^RS\s?\d+/i.test(config.vehicleModel.trim());
    if (style === 'B9') return year >= 2011;
    return false;
  }
  if (config.brand === 'BMW') {
    const model = config.vehicleModel.trim().toUpperCase();
    if (style === 'F-Series') return /\b(?:F10|F30|F80|E90)\b/.test(model);
    if (style === 'G-Series' || style === 'G-Series Pre LCI') return /\b(?:G20|G30|G22|G42|G80|G82|G87)\b/.test(model);
  }
  return false;
}
