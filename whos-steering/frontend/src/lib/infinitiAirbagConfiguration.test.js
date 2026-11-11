import { COLORS, STITCH_COLORS, CLASSIC_CARBON_COLORS, FORGED_CARBON_COLORS } from './data';
import { normalizeInfinitiAirbag, infinitiLogoPalette, isInfinitiQ50Airbag, infinitiAirbagSummary } from './infinitiAirbagConfiguration';
test('emblem choices reuse exact production palettes', () => {
  expect(infinitiLogoPalette('Classic Carbon')).toBe(CLASSIC_CARBON_COLORS);
  expect(infinitiLogoPalette('Forged Carbon')).toBe(FORGED_CARBON_COLORS);
  expect(infinitiLogoPalette('Regular Color')).toBe(COLORS);
  expect(infinitiLogoPalette('Carbon color')).toBe(COLORS);
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
  for (const finish of ['Classic Carbon','Forged Carbon','Regular Color','Carbon color']) for (const swatch of infinitiLogoPalette(finish)) {
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

test('airbag prices use exact cents and mutually exclusive emblem surcharges', () => {
  const {infinitiAirbagPrice} = require('./infinitiAirbagConfiguration');
  for (const airbagMat of ['Smooth Leather','Alcantara']) {
    expect(infinitiAirbagPrice({airbagMat,infinitiLogoFinish:'Regular Color'})).toEqual({base:16999,emblem:0,total:16999});
    for (const infinitiLogoFinish of ['Classic Carbon','Forged Carbon','Carbon color']) expect(infinitiAirbagPrice({airbagMat,infinitiLogoFinish})).toEqual({base:16999,emblem:1999,total:18998});
    expect(infinitiAirbagPrice({airbagMat,infinitiLogoFinish:'LED'})).toEqual({base:16999,emblem:7999,total:24998});
  }
});
test('LED configuration survives storage and uses reference illumination colors', () => {
  const c = normalizeInfinitiAirbag({infinitiLogoFinish:'LED',infinitiLogoCol:'#111111'});
  expect(normalizeInfinitiAirbag(JSON.parse(JSON.stringify(c)))).toEqual(c);
  expect(infinitiAirbagSummary(c)).toMatchObject({logoFinish:'LED',logoColor:'Blue / Purple / Pink'});
});

test('cart snapshots keep every airbag selection and exact finish price', () => {
 const {infinitiAirbagCartItem}=require('./infinitiAirbagConfiguration');
 for (const [infinitiLogoFinish,total] of [['Regular Color',169.99],['Carbon color',189.98],['LED',249.98]]) {
  const item=infinitiAirbagCartItem({airbagMat:'Alcantara',airbagCol:'#111111',airbagStitchColor:'#FFFFFF',infinitiLogoFinish,infinitiLogoCol:'#A020F0'});
  expect(item.price).toBe(total);
  expect(item.config).toMatchObject({productType:'airbag-cover',airbagProductId:'infiniti-q50-2014-2017',brand:'INFINITI',vehicleModel:'Q50',vehicleYear:'2014–2017',airbagMat:'Alcantara',infinitiLogoFinish});
  expect(item.detail).toContain(infinitiLogoFinish);
  expect(JSON.parse(JSON.stringify(item))).toEqual(item);
 }
});

test('newer cover stores its own fitment and keeps identical pricing across finishes', () => {
 const {infinitiAirbagCartItem} = require('./infinitiAirbagConfiguration');
 for (const infinitiLogoFinish of ['Regular Color','Carbon color','Classic Carbon','Forged Carbon','LED']) {
  const config = {infinitiLogoFinish};
  const newer = infinitiAirbagCartItem(config,'infiniti-q60-2017-q50-2018');
  expect(newer.price).toBe(infinitiAirbagCartItem(config).price);
  expect(newer.config).toMatchObject({airbagProductId:'infiniti-q60-2017-q50-2018',vehicleModel:'Q60 / Q50',vehicleYear:'Q60 2017+ / Q50 2018+'});
  expect(newer.name).toContain('Q60 2017+ / Q50 2018+');
 }
});

test('G37 cover keeps all finishes at shared prices and its own cart identity',()=>{
 const {infinitiAirbagCartItem}=require('./infinitiAirbagConfiguration');
 for (const infinitiLogoFinish of ['Regular Color','Carbon color','Classic Carbon','Forged Carbon','LED']) {
  const config={infinitiLogoFinish,airbagMat:'Alcantara'};
  const g37=infinitiAirbagCartItem(config,'infiniti-g37');
  expect(g37.price).toBe(infinitiAirbagCartItem(config).price);
  expect(g37.name).toBe('Infiniti G37 Custom Airbag Cover');
  expect(g37.config).toMatchObject({airbagProductId:'infiniti-g37',vehicleModel:'G37',vehicleYear:'',airbagMat:'Alcantara'});
 }
});
