const FINISH_EXTRAS = Object.freeze({'Regular Color':0,'Classic Carbon':1999,'Forged Carbon':1999,'Carbon color':1999,LED:7999});
const FITMENTS = {'infiniti-g37':['G37',''], 'infiniti-q50-2014-2017':['Q50','2014–2017'], 'infiniti-q60-2017-q50-2018':['Q60 / Q50','Q60 2017+ / Q50 2018+']};
function airbagPriceCents(cfg) {
  const fitment = FITMENTS[cfg.airbagProductId];
  if (cfg.productType !== 'airbag-cover' || !fitment || cfg.brand !== 'INFINITI' || cfg.vehicleModel !== fitment[0] || cfg.vehicleYear !== fitment[1] || cfg.isPreset || cfg.productId) throw new Error('Please select a supported Infiniti airbag cover fitment again.');
  if (!Object.hasOwn(FINISH_EXTRAS,cfg.infinitiLogoFinish) || !['Smooth Leather','Alcantara'].includes(cfg.airbagMat)) throw new Error('Please review your airbag material and emblem finish.');
  if (![cfg.airbagCol,cfg.airbagStitchColor,cfg.infinitiLogoCol].every(value=>typeof value==='string' && /^#[0-9a-f]{6}$/i.test(value))) throw new Error('Please choose all airbag color options.');
  return 16999 + FINISH_EXTRAS[cfg.infinitiLogoFinish];
}
module.exports = {airbagPriceCents};
