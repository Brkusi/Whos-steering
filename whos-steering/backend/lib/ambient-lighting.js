const variants=require('../../frontend/src/lib/ambientLightingVariants.json');
function lightingPriceCents(cfg){
 const variant=variants.find(v=>v.id===cfg.lightingVariant);
 if(cfg.productType!=='ambient-lighting'||!variant||cfg.productId||cfg.isPreset)throw new Error('Please choose a supported ambient lighting kit.');
 return variant.priceCents;
}
function validLightingQuantities(items){
 const lighting=items.filter(i=>i.config?.productType==='ambient-lighting');
 return lighting.every(i=>Number.isInteger(i.quantity??1)&&(i.quantity??1)>=1&&(i.quantity??1)<=100)&&lighting.reduce((n,i)=>n+(i.quantity??1),0)<=100;
}
module.exports={lightingPriceCents,validLightingQuantities};
