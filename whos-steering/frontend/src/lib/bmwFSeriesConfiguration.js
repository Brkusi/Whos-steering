import { CLASSIC_CARBON_COLORS, FORGED_CARBON_COLORS, HONEYCOMB_CARBON_COLORS } from './data';
import { wheelAppearance } from './wheelAppearance';

export const F_SERIES_SHAPES = ['Round', 'Yoke', 'Flat top & bottom', 'Flat bottom'];
export const F_SERIES_SHAPE_IDS = {Round:'round', Yoke:'yoke', 'Flat top & bottom':'flat-flat', 'Flat bottom':'flat-round'};
export const F_SERIES_PADDLES = ['Standard', 'None', 'Glossy Carbon', 'Matte Carbon', 'Forged Carbon'];
export const SOURCE_WHEEL_STYLES = {
  TOYOTA: {'Supra GR': {family:'supra-gr', shapes:F_SERIES_SHAPES.filter(shape => shape !== 'Round'), led:['Flat top & bottom','Flat bottom'], paddles:true}},
  MERCEDES: {
    'AMG Performance': {family:'mercedes-amg', shapes:F_SERIES_SHAPES, led:['Flat bottom'], paddles:true},
    'Mercedes 2015–2023': {family:'mercedes-2015', shapes:F_SERIES_SHAPES, led:['Round','Flat top & bottom','Flat bottom'], paddles:false},
    'Mercedes 2010–2015': {family:'mercedes-2010', shapes:F_SERIES_SHAPES, led:['Round','Flat top & bottom','Flat bottom'], paddles:true},
  },
  PORSCHE: {
    '911 Performance (992)': {family:'porsche-992', shapes:['Yoke','Flat top & bottom','Flat bottom'], led:['Flat top & bottom','Flat bottom'], paddles:true, airbagStitch:false},
  },
  DODGE_SRT: {
    SRT: {family:'dodge-srt', shapes:F_SERIES_SHAPES, led:['Flat bottom'], paddles:false, carbonShapes:['Flat top & bottom','Flat bottom']},
  },
};
export const sourceWheelStyle = cfg => SOURCE_WHEEL_STYLES[cfg.brand]?.[cfg.wheelStyleType];
export const sourceWheelShapes = cfg => sourceWheelStyle(cfg)?.shapes || F_SERIES_SHAPES;
export const sourceWheelHasPaddles = cfg => sourceWheelStyle(cfg)?.paddles ?? !isAudiRS2020(cfg);
export const sourceWheelSupportsLed = cfg => sourceWheelStyle(cfg)
  ? sourceWheelStyle(cfg).led.includes(cfg.bmwShape || 'Round')
  : (cfg.bmwShape || 'Round') === 'Flat bottom';
export const bmwStyleLabel = style => style === 'G-Series' ? 'G-Series LCI' : style === 'RS 2020+' ? 'Audi B9.5' : style;
export const isFSeries = cfg => cfg.brand === 'BMW' && cfg.wheelStyleType === 'F-Series';
export const isGSeriesPreLCI = cfg => cfg.brand === 'BMW' && cfg.wheelStyleType === 'G-Series Pre LCI';
export const isAudiRS2020 = cfg => cfg.brand === 'AUDI' && cfg.wheelStyleType === 'RS 2020+';
export const usesSource2D = cfg => usesBmw2D(cfg) || isAudiRS2020(cfg) || !!sourceWheelStyle(cfg);
export const usesBmw2D = cfg => isFSeries(cfg) || isGSeriesPreLCI(cfg);
export const bmwAssetFamily = cfg => sourceWheelStyle(cfg)?.family || (isAudiRS2020(cfg) ? 'audi-rs-2020' : isGSeriesPreLCI(cfg) ? 'bmw-gseries' : 'bmw-fseries');
export const hasCarbonPaddles = cfg => (usesBmw2D(cfg) || (!!sourceWheelStyle(cfg) && sourceWheelHasPaddles(cfg))) && ['Glossy Carbon', 'Matte Carbon', 'Forged Carbon'].includes(cfg.paddleShifters);
export const sourceMaterial = material => ({'Smooth Leather':'smooth',Leather:'smooth',Alcantara:'alcantara','Perforated Leather':'perforated'}[material] || 'smooth');

export function bmwFSeriesConfiguration(cfg, parseColor) {
  const appearance=wheelAppearance(cfg,parseColor);
  const shape=F_SERIES_SHAPE_IDS[cfg.bmwShape] || 'round';
  const paddle=sourceWheelHasPaddles(cfg) ? ({'Glossy Carbon':'glossy','Matte Carbon':'matte','Forged Carbon':'forged',Magnetic:'glossy'})[cfg.paddleShifters] || null : null;
  const swatches = appearance.top.material === 'Forged Carbon' ? FORGED_CARBON_COLORS
    : appearance.top.material === 'Honeycomb Carbon' ? HONEYCOMB_CARBON_COLORS : CLASSIC_CARBON_COLORS;
  const swatch = swatches.find(c => c.h.toLowerCase() === (cfg.topBottomCarbonCol || '').toLowerCase() || c.n === cfg.topBottomCarbonCol) || swatches[0];
  return {
    ...appearance, shape, paddle,
    family: bmwAssetFamily(cfg),
    carbonSwatch: swatch.img,
    carbonCustomTint: !!cfg.topBottomCustomColor,
    topZone:shape==='yoke'?'bottom':'tb',
    led:appearance.led && sourceWheelSupportsLed(cfg),
    stripes:shape==='yoke'?[]:appearance.stripes,
    // The Audi B9.5 source set has no cover overlay. Keep its original center
    // visible while retaining the customer's cover and airbag-unit choices.
    cover:!isAudiRS2020(cfg) && !!cfg.airbagCompat,
    dodgeAirbagTrim:appearance.dodgeAirbagTrim,
    dodgeLogo:appearance.dodgeLogo,
    lowerTrim:usesBmw2D(cfg) ? ({'Glossy Carbon':'glossy','Matte Carbon':'matte','Forged Carbon':'forged'})[cfg.bmwLowerTrim] || null : null,
  };
}
