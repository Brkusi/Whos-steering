import { COLORS, STITCH_COLORS, CLASSIC_CARBON_COLORS, FORGED_CARBON_COLORS } from './data';

export const INFINITI_AIRBAG_DEFAULTS = {
  airbagMat: 'Smooth Leather', airbagCol: '#111111', airbagStitchColor: '#0A1F6E',
  infinitiLogoFinish: 'Classic Carbon', infinitiLogoCol: '#0A1F6E',
};
export const INFINITI_LOGO_FINISHES = ['Classic Carbon', 'Forged Carbon', 'Regular Color'];
export const infinitiLogoPalette = finish => finish === 'Forged Carbon' ? FORGED_CARBON_COLORS : finish === 'Regular Color' ? COLORS : CLASSIC_CARBON_COLORS;
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
  return { material: c.airbagMat === 'Alcantara' ? 'Alcantara / suede' : 'Leather',
    color: COLORS.find(v => v.h === c.airbagCol).n,
    stitching: STITCH_COLORS.find(v => v.h === c.airbagStitchColor).n,
    logoFinish: c.infinitiLogoFinish,
    logoColor: infinitiLogoPalette(c.infinitiLogoFinish).find(v => v.h === c.infinitiLogoCol).n };
}
