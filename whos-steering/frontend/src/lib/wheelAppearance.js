import { COLORS, STITCH_COLORS, STRIPE_CONCEPTS } from './data';

// Free-text production instructions (e.g. dual colors) must never silently
// pretend to have an exact visual match. Return them for the preview notice.
export function wheelAppearance(cfg, parseColor) {
  const unresolved = [];
  function color(value, fallback) {
    if (!value) return fallback;
    const known = [...COLORS, ...STITCH_COLORS].find(c => c.n.toLowerCase() === value.trim().toLowerCase());
    const resolved = known?.h || parseColor(value);
    if (!resolved) unresolved.push(value);
    return resolved || fallback;
  }
  const topMat = cfg.topBottomMat || 'Smooth Leather';
  const sideMat = cfg.sideMat || 'Alcantara';
  const top = { material: topMat, color: color(cfg.topBottomCustomColor || (topMat.includes('Carbon') ? cfg.topBottomCarbonCol : cfg.topBottomCol), '#292929') };
  const side = { material: sideMat, color: color(cfg.sideCustomColor || (sideMat.includes('Carbon') ? cfg.sideCarbonCol : cfg.sideCol), '#292929') };
  const stripe = STRIPE_CONCEPTS.find(s => s.id === cfg.stripeConceptId);
  const stripes = cfg.stripeCustomColor ? [color(cfg.stripeCustomColor, stripe?.stripes[0] || '#222222')] : stripe?.stripes || [];
  return {
    top, side, stripes,
    stitch: color(cfg.stitchCustomColor || cfg.stitchColor, '#696969'),
    trim: color(cfg.plasticTrimCustomColor || cfg.plasticTrimCol, '#252525'),
    innerTrim: color(cfg.innerTrimCustomColor || cfg.innerTrimCol, '#81868c'),
    innerCarbon: false,
    // No cover upgrade means an OEM-looking cover in the visualization.
    // A visual cover does not imply inclusion of the airbag module in an order.
    airbag: { material: cfg.airbagCompat ? cfg.airbagMat || 'Smooth Leather' : 'Smooth Leather', color: cfg.airbagCompat ? color(cfg.airbagCustomColor || cfg.airbagCol, '#292929') : '#292929' },
    airbagStitch: cfg.airbagCompat ? color(cfg.airbagStitchCustomColor || cfg.airbagStitchColor, '#555555') : '#555555',
    logo: cfg.airbagCompat ? color(cfg.audiLogoCustomColor || cfg.audiLogoCol, '#c5c9ce') : '#c5c9ce',
    badge: cfg.audiBadge === 'R8' && cfg.wheelStyleType !== 'R8' ? 'RS' : cfg.audiBadge || 'RS', led: !!cfg.ledDisplay,
    magnetic: cfg.paddleShifters === 'Magnetic', longPaddles: cfg.paddleLength === 'Long',
    unresolved: [...new Set(unresolved)],
  };
}
