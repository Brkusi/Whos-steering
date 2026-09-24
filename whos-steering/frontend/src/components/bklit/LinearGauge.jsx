// Adapted from Bklit UI's GaugeLinearInner and GaugeNotchSvg (MIT).
// Source: https://github.com/bklit/bklit-ui/blob/main/packages/ui/src/charts/gauge.tsx
// The linear, uniform-notch variant is ported to JS + scoped CSS for this app.
// See LICENSE and README.md in this directory for attribution and modifications.
import { motion, useReducedMotion } from 'motion/react';

export default function LinearGauge({ value, color = 'var(--y)', label }) {
  const reducedMotion = useReducedMotion();
  const width = 320, height = 20, totalNotches = 40, spacing = 25;
  const bounded = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
  const activeNotches = Math.round((bounded / 100) * totalNotches);
  const availableWidth = width * (1 - spacing / 100);
  const slotWidth = availableWidth / totalNotches;
  const gapWidth = (width * (spacing / 100)) / (totalNotches - 1);
  const notches = Array.from({ length: totalNotches }, (_, index) => {
    const xCenter = index * (slotWidth + gapWidth) + slotWidth / 2;
    const halfWidth = slotWidth * .8 / 2;
    return {
      index, xCenter,
      path: `M ${xCenter - halfWidth} 0 L ${xCenter + halfWidth} 0 L ${xCenter + halfWidth} ${height} L ${xCenter - halfWidth} ${height} Z`,
    };
  });

  return <svg className="bklit-linear-gauge" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
    {notches.map(notch => <path key={`bg-${notch.index}`} d={notch.path} fill="#34373e" />)}
    {notches.filter(notch => notch.index < activeNotches).map(notch => <motion.path
      key={`active-${notch.index}`} d={notch.path} fill={color}
      initial={reducedMotion ? false : { opacity: 0, scaleY: 0 }}
      animate={{ opacity: 1, scaleY: 1 }}
      style={{ transformOrigin: `${notch.xCenter}px ${height / 2}px` }}
      transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 20, delay: notch.index * .012 }}
    />)}
  </svg>;
}
