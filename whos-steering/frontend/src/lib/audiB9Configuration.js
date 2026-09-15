import { wheelAppearance } from './wheelAppearance';

// Translate existing order values. Never rename or mutate fields in the order.
export function audiB9Configuration(config, parseColor) {
  const appearance = wheelAppearance(config, parseColor);
  return {
    ...appearance,
    style: config.wheelStyle === 'Sport' ? 'Sport' : 'Comfort',
    topColorSelected: Boolean(config.topBottomCustomColor || (appearance.top.material.includes('Carbon') ? config.topBottomCarbonCol : config.topBottomCol)),
    sideColorSelected: Boolean(config.sideCustomColor || (appearance.side.material.includes('Carbon') ? config.sideCarbonCol : config.sideCol)),
    coverColorSelected: Boolean(config.airbagCompat && (config.airbagCol || config.airbagCustomColor)),
    trimColorSelected: Boolean(config.plasticTrimCol || config.plasticTrimCustomColor),
    innerColorSelected: Boolean(config.innerTrimCol || config.innerTrimCustomColor),
    stitchColorSelected: Boolean(config.stitchColor || config.stitchCustomColor),
    coverStitchSelected: Boolean(config.airbagCompat && (config.airbagStitchColor || config.airbagStitchCustomColor)),
    logoColorSelected: Boolean(config.airbagCompat && (config.audiLogoCol || config.audiLogoCustomColor)),
    germanStripe: config.stripeConceptId === 'C-13' && !config.stripeCustomColor,
  };
}

const TOP = {
  'Smooth Leather': [3,17], Leather: [3,17],
  'Classic Carbon': [1,15], 'Forged Carbon': [2,16],
  'Honeycomb Carbon': [1,15], Alcantara: [0,14],
  'Perforated Leather': [4,18],
};
const SIDE = {
  'Smooth Leather': [8,37], Leather: [8,37], 'Perforated Leather': [9,33],
  Alcantara: [5,36], 'Classic Carbon': [6,37], 'Forged Carbon': [7,37],
  'Honeycomb Carbon': [6,37],
};
export function audiB9Parts(appearance) {
  const sport = appearance.style === 'Sport', index = sport ? 1 : 0;
  const top = (TOP[appearance.top.material] || TOP['Smooth Leather'])[index];
  const side = (SIDE[appearance.side.material] || SIDE.Alcantara)[index];
  const cover = appearance.airbag.material === 'Alcantara' ? 44 : 42;
  const stripe = appearance.stripes.length ? appearance.germanStripe ? 20 : 19 : null;
  const badge = appearance.badge === 'RS' ? 22 : appearance.badge === 'S' ? 23 : null;
  const visible = new Set([12,13,24,25,26,27,28,29,30,31,38,39,40,41,43,top,side,cover]);
  if (sport) visible.add(34);
  else if (!appearance.top.material.includes('Carbon') && !appearance.side.material.includes('Carbon')) visible.add(10);
  if (stripe !== null) visible.add(stripe);
  if (badge !== null) visible.add(badge);
  return { visible, top, side, cover, stripe, badge };
}
