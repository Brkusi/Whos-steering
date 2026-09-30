import { vehicleYears } from './vehicleCatalog';

export const VEHICLE_MAKES = [
  { value: 'AUDI', label: 'Audi', available: true },
  { value: 'BMW', label: 'BMW', available: true },
  { value: 'DODGE_SRT', label: 'Dodge', available: true },
  { value: 'MERCEDES', label: 'Mercedes', available: true },
  { value: 'TOYOTA', label: 'Toyota', available: true },
  { value: 'PORSCHE', label: 'Porsche', available: true },
];

export const isConfigurableMake = make => VEHICLE_MAKES.some(item => item.value === make && item.available);

// The label reflects the published make/year coverage; the customer's photo
// still receives final fitment review before production.
export function wheelMatchesVehicle(config, style) {
  const year = Number(config.vehicleYear);
  if (!Number.isInteger(year) || !vehicleYears(config.brand).includes(String(year)) || !String(config.vehicleModel || '').trim()) return false;
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
  if (config.brand === 'TOYOTA') return style === 'Supra GR' && year >= 2020 && /\bSupra\b/i.test(config.vehicleModel);
  if (config.brand === 'PORSCHE') {
    if (!/^911\b/i.test(config.vehicleModel.trim())) return false;
    if (style === '911 Performance (991)') return year >= 2012 && year <= 2019;
    if (style === '911 Performance (992)') return year >= 2019;
  }
  // The SRT source does not specify a year/model fitment range. The wheel
  // remains configurable, with final compatibility confirmed from the photo.
  if (config.brand === 'MERCEDES') {
    const model = config.vehicleModel.trim();
    if (style === 'AMG Performance') return year >= 2019 && year <= 2024 && /\bAMG\b/i.test(model);
    if (style === 'Mercedes 2015–2023') return year >= 2015 && year <= 2023 && /^(?:C|E|S|G|CLS|GLC|GLE|GLS)(?:-Class|\b)/i.test(model);
    if (style === 'Mercedes 2010–2015') return year >= 2010 && year <= 2015 && /^(?:C|E|S|GLK|ML|GL|CLS)(?:-Class|\b)/i.test(model);
  }
  return false;
}
