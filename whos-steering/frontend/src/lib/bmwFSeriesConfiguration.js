import { wheelAppearance } from './wheelAppearance';

export const F_SERIES_SHAPES = ['Round', 'Yoke', 'Flat top & bottom', 'Flat bottom'];
export const F_SERIES_SHAPE_IDS = {Round:'round', Yoke:'yoke', 'Flat top & bottom':'flat-flat', 'Flat bottom':'flat-round'};
export const F_SERIES_PADDLES = ['Standard', 'None', 'Glossy Carbon', 'Matte Carbon', 'Forged Carbon'];
export const isFSeries = cfg => cfg.brand === 'BMW' && cfg.wheelStyleType === 'F-Series';
export const hasCarbonPaddles = cfg => isFSeries(cfg) && ['Glossy Carbon', 'Matte Carbon', 'Forged Carbon'].includes(cfg.paddleShifters);
export const sourceMaterial = material => ({'Smooth Leather':'smooth',Leather:'smooth',Alcantara:'alcantara','Perforated Leather':'perforated'}[material] || 'smooth');

export function bmwFSeriesConfiguration(cfg, parseColor) {
  const appearance=wheelAppearance(cfg,parseColor);
  const shape=F_SERIES_SHAPE_IDS[cfg.bmwShape] || 'round';
  const paddle=({'Glossy Carbon':'glossy','Matte Carbon':'matte','Forged Carbon':'forged',Magnetic:'glossy'})[cfg.paddleShifters] || null;
  return {
    ...appearance, shape, paddle,
    topZone:shape==='yoke'?'bottom':'tb',
    // The source only supplies an LED layer for the flat-bottom shape.
    led:appearance.led && shape==='flat-round',
    stripes:shape==='yoke'?[]:appearance.stripes,
    cover:!!cfg.airbagCompat,
    lowerTrim:({'Glossy Carbon':'glossy','Matte Carbon':'matte','Forged Carbon':'forged'})[cfg.bmwLowerTrim] || null,
  };
}
