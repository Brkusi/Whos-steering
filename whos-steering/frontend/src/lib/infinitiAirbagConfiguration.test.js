import { COLORS, STITCH_COLORS, CLASSIC_CARBON_COLORS, FORGED_CARBON_COLORS } from './data';
import { normalizeInfinitiAirbag, infinitiLogoPalette, isInfinitiQ50Airbag, infinitiAirbagSummary } from './infinitiAirbagConfiguration';
test('emblem choices reuse exact production palettes', () => {
  expect(infinitiLogoPalette('Classic Carbon')).toBe(CLASSIC_CARBON_COLORS);
  expect(infinitiLogoPalette('Forged Carbon')).toBe(FORGED_CARBON_COLORS);
  expect(infinitiLogoPalette('Regular Color')).toBe(COLORS);
});
test('unsupported saved options cannot escape allowed choices', () => {
  const c = normalizeInfinitiAirbag({airbagMat:'Velvet',airbagCol:'hotpink',airbagStitchColor:'transparent',infinitiLogoFinish:'Honeycomb',infinitiLogoCol:'#abcdef'});
  expect(c.airbagMat).toBe('Smooth Leather');
  expect(COLORS.some(v => v.h === c.airbagCol)).toBe(true);
  expect(STITCH_COLORS.some(v => v.h === c.airbagStitchColor)).toBe(true);
  expect(CLASSIC_CARBON_COLORS.some(v => v.h === c.infinitiLogoCol)).toBe(true);
});
test('changing finish rejects unsupported color', () => {
  expect(normalizeInfinitiAirbag({infinitiLogoFinish:'Forged Carbon',infinitiLogoCol:'#E85500'}).infinitiLogoCol).toBe(FORGED_CARBON_COLORS[0].h);
});
test('all choices survive serialization and have readable summaries', () => {
  for (const finish of ['Classic Carbon','Forged Carbon','Regular Color']) for (const swatch of infinitiLogoPalette(finish)) {
    const c = normalizeInfinitiAirbag({infinitiLogoFinish:finish,infinitiLogoCol:swatch.h});
    expect(normalizeInfinitiAirbag(JSON.parse(JSON.stringify(c)))).toEqual(c);
    expect(infinitiAirbagSummary(c).logoColor).toBe(swatch.n);
  }
});
test('fitment is restricted to Q50 2014 through 2017', () => {
  for (const year of [2014,2015,2016,2017]) expect(isInfinitiQ50Airbag({brand:'INFINITI',vehicleModel:'Q50',vehicleYear:year})).toBe(true);
  for (const year of [2013,2018]) expect(isInfinitiQ50Airbag({brand:'INFINITI',vehicleModel:'Q50',vehicleYear:year})).toBe(false);
  expect(isInfinitiQ50Airbag({brand:'INFINITI',vehicleModel:'Q60',vehicleYear:2017})).toBe(false);
});
