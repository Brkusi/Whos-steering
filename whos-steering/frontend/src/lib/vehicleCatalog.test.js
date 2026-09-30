import { hasVehicleCatalog, vehicleInquiryPath, vehicleModels, vehicleYears } from './vehicleCatalog';

test('published year limits match the requested makes', () => {
  expect(vehicleYears('BMW')).toEqual(Array.from({length:16},(_,i)=>String(2025-i)));
  expect(vehicleYears('AUDI')).toEqual(Array.from({length:15},(_,i)=>String(2025-i)));
  expect(vehicleYears('MERCEDES')).toEqual(Array.from({length:16},(_,i)=>String(2025-i)));
  expect(vehicleYears('TOYOTA')).toEqual(Array.from({length:7},(_,i)=>String(2026-i)));
  expect(vehicleYears('DODGE_SRT')).toEqual(Array.from({length:17},(_,i)=>String(2026-i)));
  expect(vehicleYears('PORSCHE')).toEqual(Array.from({length:15},(_,i)=>String(2026-i)));
  expect(hasVehicleCatalog('DODGE_SRT')).toBe(true);
  expect(hasVehicleCatalog('PORSCHE')).toBe(true);
});

test('year selection changes the available models', () => {
  expect(vehicleModels('BMW','2010')).toContain('328i');
  expect(vehicleModels('BMW','2025')).toContain('i5');
  expect(vehicleModels('AUDI','2011')).toContain('A4');
  expect(vehicleModels('AUDI','2025')).toContain('RS 6 Avant');
  expect(vehicleModels('MERCEDES','2010')).toContain('C-Class');
  expect(vehicleModels('MERCEDES','2025')).toContain('EQE-Class SUV');
  expect(vehicleModels('TOYOTA','2020')).toContain('Supra');
  expect(vehicleModels('TOYOTA','2026')).toContain('GR Corolla');
  expect(vehicleModels('TOYOTA','2019')).toEqual([]);
  expect(vehicleModels('PORSCHE','2019')).toContain('911');
  expect(vehicleModels('DODGE_SRT','2019')).toContain('Challenger');
});

test('fitment inquiry carries selected vehicle into the contact form', () => {
  expect(vehicleInquiryPath('TOYOTA','2026','GR Corolla')).toBe('/contact?brand=TOYOTA&year=2026&model=GR+Corolla');
});
