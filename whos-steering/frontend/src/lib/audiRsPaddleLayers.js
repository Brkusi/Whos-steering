// Registered to the square Audi RS source photographs at 400 × 400.
const standardTip = [[78,185],[85,170],[91,166],[109,164],[112,168],[110,178],[92,182]];
const flatBottomTip = [[85,190],[93,169],[98,166],[115,164],[118,168],[116,183],[100,186]];
const spoke = [[55,230],[56,217],[68,199],[81,185],[131,173],[147,165],[153,230]];
const flatBottomSpoke = [[59,234],[62,220],[72,204],[85,190],[134,180],[148,175],[154,235]];

function traceAudiRsPair(ctx, points) {
  const {width, height} = ctx.canvas;
  ctx.beginPath();
  for (const mirror of [false, true]) {
    points.forEach(([x,y], index) => {
      const px = width * (mirror ? 400-x : x)/400;
      const py = height * y/400;
      if (index === 0) ctx.moveTo(px,py);
      else ctx.lineTo(px,py);
    });
    ctx.closePath();
  }
}

export function removeAudiRsStockPaddles(ctx, shape) {
  ctx.save();
  ctx.fillStyle = '#000';
  traceAudiRsPair(ctx, shape === 'flat-round' ? flatBottomTip : standardTip);
  ctx.fill();
  ctx.restore();
}

export function coverAudiRsSpokes(ctx, shape) {
  traceAudiRsPair(ctx, shape === 'flat-round' ? flatBottomSpoke : spoke);
  ctx.fill();
}
