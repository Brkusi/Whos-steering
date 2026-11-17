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

// Coordinates follow the inner grip edge in the registered B8.5 photograph.
const b85Seam = 'M85 116 Q131 58 200 57 Q269 58 315 116 M86 120 Q54 158 56 177 M314 120 Q346 158 344 177 M60 232 Q55 267 85 301 M340 232 Q345 267 315 301 M90 304 Q115 331 154 334 L246 334 Q285 331 310 304';

export function drawB85Stitch(ctx, color) {
  const ink = resolvePreviewColor(color);
  if (!ink) return;
  ctx.save();
  ctx.scale(ctx.canvas.width / 400, ctx.canvas.height / 400);
  ctx.strokeStyle = ink;
  ctx.lineWidth = .9;
  ctx.setLineDash([2, 1.8]);
  ctx.stroke(new Path2D(b85Seam));
  ctx.restore();
}
