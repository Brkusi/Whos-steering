import { vehicleYears } from './vehicleCatalog';
import { bmwVehicleFamilies } from './bmwVehicleFamilies';

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
    return year >= 2011 && ['B9', 'RS 2020+', 'R8'].includes(style);
  }
  if (config.brand === 'BMW') {
    const families = bmwVehicleFamilies(year, config.vehicleModel);
    if (style === 'F-Series') return families.includes('F') || families.includes('E90');
    if (style === 'G-Series' || style === 'G-Series Pre LCI') return families.includes('F') || families.includes('G');
  }
  if (config.brand === 'TOYOTA') return style === 'Supra GR' && year >= 2020 && /^(?:GR\s+)?Supra(?:\s+GR)?$/i.test(config.vehicleModel.trim());
  if (config.brand === 'PORSCHE') {
    if (!/^911\b/i.test(config.vehicleModel.trim())) return false;
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
