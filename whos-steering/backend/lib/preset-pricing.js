const presets = require('./preset-prices.json');
function presetPrice(config) {
  const preset = presets[config.presetId];
  if (!preset || preset.brand !== config.brand) throw new Error('This preset is unavailable. Please select it again from the catalog.');
  if (preset.fixed) return preset.option && config[preset.option.key] === true ? preset.option.price : preset.base;
  return preset.base + (preset.brand === 'AUDI' && config.airbagCompat ? 2500 : 0)
    + (config.airbagUpgrade ? 7500 : 0)
    + (preset.brand === 'BMW' && config.heated ? 7500 : 0)
    + (preset.brand === 'BMW' && config.laneAssist ? 3000 : 0)
    + (preset.brand === 'BMW' && config.m1m2Buttons ? 4000 : 0);
}
module.exports = { presetPrice };
