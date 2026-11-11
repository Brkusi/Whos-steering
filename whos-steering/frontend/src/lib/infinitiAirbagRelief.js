// Apply after material tinting so dark dyes cannot erase the molded lettering.
// Depth preserves the selected channel ratios; the narrow lip is reflected light.
// Do not use CanvasRenderingContext2D.filter here: browsers without canvas
// filter support silently draw the unblurred image, erasing the relief mask.
export function blurAirbagLuminance(rgba, width, height, radius, passes = 3) {
  let source = Float32Array.from({length: width * height}, (_, n) => rgba[n * 4]);
  let horizontal = new Float32Array(source.length);
  let result = new Float32Array(source.length);
  const size = radius * 2 + 1;
  for (let pass = 0; pass < passes; pass++) {
    for (let y = 0; y < height; y++) {
      const row = y * width;
      let sum = 0;
      for (let x = -radius; x <= radius; x++) sum += source[row + Math.max(0, Math.min(width - 1, x))];
      for (let x = 0; x < width; x++) {
        horizontal[row + x] = sum / size;
        sum += source[row + Math.min(width - 1, x + radius + 1)] - source[row + Math.max(0, x - radius)];
      }
    }
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let y = -radius; y <= radius; y++) sum += horizontal[Math.max(0, Math.min(height - 1, y)) * width + x];
      for (let y = 0; y < height; y++) {
        result[y * width + x] = sum / size;
        sum += horizontal[Math.min(height - 1, y + radius + 1) * width + x] - horizontal[Math.max(0, y - radius) * width + x];
      }
    }
    [source, result] = [result, source];
  }
  return source;
}

export function applyEmbossLighting(value, depth, lip) {
  const recessed = value * (1 - Math.max(0, Math.min(1, depth)) * .72);
  return recessed + (255 - recessed) * Math.max(0, Math.min(1, lip)) * .12;
}
