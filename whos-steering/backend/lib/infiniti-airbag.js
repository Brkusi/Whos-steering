const FINISH_EXTRAS = Object.freeze({'Regular Color':0,'Classic Carbon':1999,'Forged Carbon':1999,'Carbon color':1999,LED:7999});
function airbagPriceCents(cfg) {
  if (cfg.productType !== 'airbag-cover' || cfg.airbagProductId !== 'infiniti-q50-2014-2017' || cfg.brand !== 'INFINITI' || cfg.vehicleModel !== 'Q50' || cfg.vehicleYear !== '2014–2017' || cfg.isPreset || cfg.productId) throw new Error('Please select the Infiniti Q50 2014–2017 airbag cover again.');
  if (!Object.hasOwn(FINISH_EXTRAS,cfg.infinitiLogoFinish) || !['Smooth Leather','Alcantara'].includes(cfg.airbagMat)) throw new Error('Please review your airbag material and emblem finish.');
  if (![cfg.airbagCol,cfg.airbagStitchColor,cfg.infinitiLogoCol].every(value=>typeof value==='string' && /^#[0-9a-f]{6}$/i.test(value))) throw new Error('Please choose all airbag color options.');
  return 16999 + FINISH_EXTRAS[cfg.infinitiLogoFinish];
}
module.exports = {airbagPriceCents};
