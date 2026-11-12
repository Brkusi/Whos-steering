import { COLORS, STITCH_COLORS, CLASSIC_CARBON_COLORS, FORGED_CARBON_COLORS, HONEYCOMB_CARBON_COLORS } from './data';

export const INFINITI_AIRBAG_PRODUCTS = {
  'infiniti-q50-2014-2017': {id:'infiniti-q50-2014-2017', title:'INFINITI Q50', fitment:'2014–2017', label:'Infiniti Q50 · 2014–2017', model:'Q50', years:'2014–2017', route:'/configure/infiniti-q50-airbag', artwork:'infiniti-q50-airbag'},
  'infiniti-q60-2017-q50-2018': {id:'infiniti-q60-2017-q50-2018', title:'INFINITI Q60 / Q50', fitment:'Q60 2017+ / Q50 2018+', label:'Infiniti Q60 2017+ / Q50 2018+', model:'Q60 / Q50', years:'Q60 2017+ / Q50 2018+', route:'/configure/infiniti-q60-q50-airbag', artwork:'infiniti-q60-q50-airbag'},
  'infiniti-g37': {id:'infiniti-g37', title:'INFINITI', fitment:'G37', label:'Infiniti G37', model:'G37', years:'', route:'/configure/infiniti-g37-airbag', artwork:'infiniti-g37-airbag'},
};
export const infinitiAirbagProduct = id => INFINITI_AIRBAG_PRODUCTS[id] || INFINITI_AIRBAG_PRODUCTS['infiniti-q50-2014-2017'];
export const INFINITI_LED_NOTICE = 'RGB LED colors are controlled via Bluetooth. The LED emblem must be wired properly upon installation.';
export const INFINITI_AIRBAG_DEFAULTS = {
  airbagMat: 'Smooth Leather', airbagCol: '#111111', airbagStitchColor: '#0A1F6E',
  infinitiLogoFinish: 'Regular Color', infinitiLogoCol: '#111111',
};
export const INFINITI_LOGO_FINISHES = ['Classic', 'Classic Carbon', 'Honeycomb Carbon', 'Forged Carbon', 'Regular Color', 'Carbon color', 'LED'];
export const INFINITI_CHROME_COLORS = [{n:'Chrome',h:'#C0C0C0'}];
export const INFINITI_LED_COLORS = [{n:'Blue / Purple / Pink',h:'#A020F0'}];
export const INFINITI_AIRBAG_BASE_CENTS = 15999;
export const infinitiEmblemExtraCents = finish => finish === 'LED' ? 7999 : ['Classic Carbon', 'Honeycomb Carbon', 'Forged Carbon', 'Carbon color'].includes(finish) ? 1999 : 0;
export const infinitiAirbagPrice = config => { const base = INFINITI_AIRBAG_BASE_CENTS, emblem = infinitiEmblemExtraCents(normalizeInfinitiAirbag(config).infinitiLogoFinish); return {base,emblem,total:base+emblem}; };
export const airbagMoney = cents => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(cents/100);
export const infinitiLogoPalette = finish => finish === 'Honeycomb Carbon' ? HONEYCOMB_CARBON_COLORS : finish === 'Classic' ? INFINITI_CHROME_COLORS : finish === 'LED' ? INFINITI_LED_COLORS : finish === 'Forged Carbon' ? FORGED_CARBON_COLORS : ['Regular Color', 'Carbon color'].includes(finish) ? COLORS : CLASSIC_CARBON_COLORS;
export function normalizeInfinitiAirbag(config = {}) {
  const finish = INFINITI_LOGO_FINISHES.includes(config.infinitiLogoFinish) ? config.infinitiLogoFinish : INFINITI_AIRBAG_DEFAULTS.infinitiLogoFinish;
  const palette = infinitiLogoPalette(finish);
  const select = (list, value, fallback) => list.some(c => c.h === value) ? value : fallback;
  return {
    airbagMat: config.airbagMat === 'Alcantara' ? 'Alcantara' : 'Smooth Leather',
    airbagCol: select(COLORS, config.airbagCol, '#111111'),
    airbagStitchColor: select(STITCH_COLORS, config.airbagStitchColor, '#0A1F6E'),
    infinitiLogoFinish: finish,
    infinitiLogoCol: select(palette, config.infinitiLogoCol, palette[0].h),
  };
}
export const isInfinitiQ50Airbag = config => config.brand === 'INFINITI' && /^Q50(?:\s|$)/i.test(config.vehicleModel || '') && Number(config.vehicleYear) >= 2014 && Number(config.vehicleYear) <= 2017;
export function infinitiAirbagSummary(config) {
  const c = normalizeInfinitiAirbag(config);
  return { material: c.airbagMat === 'Alcantara' ? 'Alcantara / Suede' : 'Leather',
    color: COLORS.find(v => v.h === c.airbagCol).n,
    stitching: STITCH_COLORS.find(v => v.h === c.airbagStitchColor).n,
    logoFinish: c.infinitiLogoFinish,
    logoColor: infinitiLogoPalette(c.infinitiLogoFinish).find(v => v.h === c.infinitiLogoCol).n };
}

export function infinitiAirbagCartItem(config, productId) {
  const product = infinitiAirbagProduct(productId);
  const cfg = normalizeInfinitiAirbag(config), summary = infinitiAirbagSummary(cfg);
  return {
    name: `${product.label} Custom Airbag Cover`,
    detail: `${summary.color} ${summary.material} · ${summary.stitching} stitching · ${summary.logoFinish} · ${summary.logoColor}`,
    price: infinitiAirbagPrice(cfg).total / 100,
    config: {...cfg, productType:'airbag-cover', airbagProductId:product.id, brand:'INFINITI', vehicleModel:product.model, vehicleYear:product.years, wheelStyle:'Airbag cover', airbagSummary:summary, readyToShip:false, airbagCompat:false, heated:false, laneAssist:false},
  };
}
