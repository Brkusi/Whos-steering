// Preserve the photographed grain while shifting its diffuse color.
export function tintPreviewPixels(pixels, hex) {
  const channels = hex.match(/[\da-f]{2}/gi).map(channel => parseInt(channel, 16));
  for (let i = 0; i < pixels.length; i += 4) {
    if (!pixels[i + 3]) continue;
    const light = .2126 * pixels[i] + .7152 * pixels[i + 1] + .0722 * pixels[i + 2];
    for (let channel = 0; channel < 3; channel++) {
      const target = channels[channel];
      pixels[i + channel] = target * Math.min(light / 44, 1) + Math.max(light - 44, 0) * (255 - target) / 211;
    }
  }
}

export function resolvePreviewColor(value) {
  if (!value || !CSS.supports('color', value)) return null;
  const context = document.createElement('canvas').getContext('2d');
  context.fillStyle = value;
  if (/^#[\da-f]{6}$/i.test(context.fillStyle)) return context.fillStyle;
  context.fillRect(0, 0, 1, 1);
  return '#' + [...context.getImageData(0, 0, 1, 1).data.slice(0, 3)]
    .map(channel => channel.toString(16).padStart(2, '0')).join('');
}
