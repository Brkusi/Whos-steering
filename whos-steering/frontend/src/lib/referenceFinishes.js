import {resolvePreviewColor, tintPreviewPixels} from './previewColor';

// Coordinates follow the front product photographs, normalized to their
// original 460px-wide reference views. Clip before copying any tinted pixels.
export function applyReferenceFinishes(ctx, model, gripColor, coverColor) {
  const r8=model==='r8', rs=model==='rs';
  const w=rs?400:460,h=r8?415:w;
  const {width,height}=ctx.canvas;
  const top=r8?'M0 0 H224 V90 H236 V0 H460 V121 L358 121 L339 137 H119 L99 122 H0 Z':'M0 0 H224 V90 H242 V0 H460 V169 L405 169 L355 161 H106 L55 168 H0 Z';
  const bottom=r8?'M0 410 V350 L93 326 L121 353 Q231 398 341 353 L366 326 L460 350 V415 H0 Z':'M0 460 V380 L95 350 L117 347 Q220 433 343 347 L366 353 L460 380 V460 Z';
  const cover=r8?'M229 163 C279 161 310 204 306 243 C305 287 273 317 230 317 C185 317 153 285 153 241 C152 201 180 165 229 163 Z M196 230 H264 V254 H196 Z':
    rs?'M132 176 Q142 158 194 159 Q254 157 268 177 Q276 203 266 246 Q260 272 240 275 L159 275 Q137 273 131 250 Q122 215 132 176 Z M158 196 Q197 187 242 196 L233 239 Q198 248 166 239 Z':
    'M229 179 C279 178 306 212 306 251 C306 296 272 325 230 325 C185 325 154 294 154 251 C154 211 186 179 229 179 Z M208 231 H252 V273 H208 Z';
  function tint(path, selection) {
    const color=resolvePreviewColor(selection);
    if(!path||!color)return;
    const layer=document.createElement('canvas');layer.width=width;layer.height=height;
    const lc=layer.getContext('2d');lc.drawImage(ctx.canvas,0,0);
    const pixels=lc.getImageData(0,0,width,height);
    tintPreviewPixels(pixels.data,color);lc.putImageData(pixels,0,0);
    ctx.save();ctx.scale(width/w,height/h);ctx.clip(new Path2D(path),'evenodd');
    ctx.drawImage(layer,0,0,w,h);ctx.restore();
  }
  if(!rs && gripColor)tint(top+' '+bottom,gripColor);
  tint(cover,coverColor);
}
