import { hasVehicleCatalog, vehicleInquiryPath, vehicleModels, vehicleYears } from './vehicleCatalog';

test('published year limits match the requested makes', () => {
  expect(vehicleYears('BMW')).toEqual(Array.from({length:16},(_,i)=>String(2025-i)));
  expect(vehicleYears('AUDI')).toContain('2026');
  expect(vehicleYears('AUDI')).toContain('2010');
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
  expect(vehicleModels('AUDI','2010')).toContain('A3');
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

test('Audi A, S and RS families remain selectable throughout 2010 and later',()=>{
 for(const year of vehicleYears('AUDI')) for(const model of ['A1','A2','A3','A4','A5','A6','A7','A8','S1','S2','S3','S4','S5','S6','S7','S8','RS 2','RS 3','RS 4','RS 5','RS 6','RS 7','RS Q3','RS Q8','RS e-tron GT']) expect(vehicleModels('AUDI',year)).toContain(model);
 expect(vehicleModels('AUDI','2009')).toEqual([]);
});
