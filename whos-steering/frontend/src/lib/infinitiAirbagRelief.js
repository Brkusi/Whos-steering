// Apply after material tinting so dark dyes cannot erase the molded lettering.
// Depth preserves the selected channel ratios; the narrow lip is reflected light.
export function applyEmbossLighting(value, depth, lip) {
  const recessed = value * (1 - Math.max(0, Math.min(1, depth)) * .72);
  return recessed + (255 - recessed) * Math.max(0, Math.min(1, lip)) * .12;
}
