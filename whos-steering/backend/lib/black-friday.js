const presets=require('./preset-prices.json');
const active=(now=Date.now())=>now>=Date.parse('2026-11-11T00:00:00-05:00')&&now<Date.parse('2026-11-29T00:00:00-05:00');
function customWheelPrice(cents,cfg,now=Date.now()) {
 if(!active(now)||cfg.productType==='airbag-cover'||cfg.airbagProductId||cfg.productId||!cfg.brand)return cents;
 if(cfg.isPreset && (!presets[cfg.presetId]||presets[cfg.presetId].fixed))return cents;
 return Math.round(cents*.9);
}
module.exports={active,customWheelPrice};
