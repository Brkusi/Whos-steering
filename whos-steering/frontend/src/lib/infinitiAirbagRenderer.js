import { normalizeInfinitiAirbag, infinitiLogoPalette } from './infinitiAirbagConfiguration';
export const AIRBAG_WIDTH = 1442;
export const AIRBAG_HEIGHT = 1091;
// Surface of the emblem, with the two upholstery openings explicitly subtracted.
// Coordinates are registered to leather.png; no bounding-box recoloring is used.
export const LOGO_PATH = 'M 492 337 C 497 274 595 229 711 229 C 833 226 935 274 943 331 C 958 392 891 438 778 449 L 716 307 L 654 448 C 552 435 486 396 492 337 Z M 551 325 C 552 288 618 257 709 256 C 805 253 878 285 885 323 C 889 347 863 363 818 368 L 715 271 L 617 367 C 575 364 548 350 551 325 Z';
const clamp = x => Math.max(0, Math.min(1, x));
const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
const surface = () => { const c = document.createElement('canvas'); c.width = AIRBAG_WIDTH; c.height = AIRBAG_HEIGHT; return c; };
const images = new Map();
function load(src) {
  if (!images.has(src)) images.set(src, new Promise((resolve, reject) => {
    const im = new Image(); im.onload = () => resolve(im); im.onerror = () => { images.delete(src); reject(new Error('Unable to load airbag artwork. Please retry.')); }; im.src = `${process.env.PUBLIC_URL || ''}${src}`;
  }));
  return images.get(src);
}
let masterPromise;
async function master() {
  if (!masterPromise) masterPromise = (async () => {
    const [base, suede] = await Promise.all([load('/models/infiniti-q50-airbag/leather.png'), load('/models/infiniti-q50-airbag/suede-surface.png')]);
    const c = surface(), ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(base, 0, 0, c.width, c.height); const original = ctx.getImageData(0, 0, c.width, c.height).data;
    ctx.clearRect(0, 0, c.width, c.height); ctx.filter = 'blur(7px)'; ctx.drawImage(base, 0, 0, c.width, c.height); ctx.filter = 'none';
    const logoLighting = ctx.getImageData(0, 0, c.width, c.height).data;
    ctx.clearRect(0, 0, c.width, c.height); ctx.filter = 'blur(1.2px)'; ctx.drawImage(base, 0, 0);
    const embossFine = ctx.getImageData(0, 0, c.width, c.height).data;
    ctx.clearRect(0, 0, c.width, c.height); ctx.filter = 'blur(22px)'; ctx.drawImage(base, 0, 0); ctx.filter = 'none';
    const embossBroad = ctx.getImageData(0, 0, c.width, c.height).data;
    ctx.clearRect(0, 0, c.width, c.height); ctx.fillStyle = '#fff'; ctx.fill(new Path2D(LOGO_PATH), 'evenodd');
    const logo = ctx.getImageData(0, 0, c.width, c.height).data;
    // Measured seam positions at regular rows in the neutral master. The
    // corridor includes both rows; luminance selects only raised thread.
    const seamRows = [[125,185,202,1236,1256],[150,173,195,1242,1264],[200,162,191,1244,1274],[250,164,196,1240,1271],[300,172,201,1234,1265],[350,180,211,1225,1256],[400,192,222,1215,1245],[450,205,235,1202,1231],[500,220,249,1189,1218],[550,236,265,1173,1203],[600,253,282,1158,1187],[650,270,299,1141,1170],[700,288,318,1124,1153],[750,307,337,1106,1135],[800,328,357,1086,1116],[850,348,378,1067,1096],[900,369,398,1046,1075],[950,390,419,1023,1053],[1000,413,440,1000,1029],[1045,440,463,982,1009]];
    const stitch = new Float32Array(c.width * c.height);
    for (let y = 125; y <= 1045; y++) {
      const row = Math.max(0, seamRows.findIndex(r => r[0] >= y) - 1);
      const lo = seamRows[row], hi = seamRows[row + 1], t = clamp((y - lo[0]) / (hi[0] - lo[0]));
      const v = lo.map((n, i) => n + (hi[i] - n) * t);
      for (let x = 0; x < c.width; x++) {
        if (!((x >= v[1] - 7 && x <= v[2] + 7) || (x >= v[3] - 7 && x <= v[4] + 7))) continue;
        const i = (y * c.width + x) * 4;
        stitch[i / 4] = clamp((original[i] - 92) / 43);
      }
    }
    // Use the material reference only for texture. Geometry, seams and embossed
    // markings always come from the single master so they cannot drift.
    ctx.clearRect(0, 0, c.width, c.height); ctx.drawImage(suede, 0, 0, c.width, c.height);
    const texture = ctx.getImageData(0, 0, c.width, c.height).data;
    return { original, logoLighting, logo, stitch, texture, embossFine, embossBroad };
  })().catch(error => { masterPromise = null; throw error; });
  return masterPromise;
}
export async function renderInfinitiAirbag(target, config) {
  const cfg = normalizeInfinitiAirbag(config), m = await master();
  const swatch = infinitiLogoPalette(cfg.infinitiLogoFinish).find(v => v.h === cfg.infinitiLogoCol);
  let carbon;
  const textureSize = cfg.infinitiLogoFinish === 'Forged Carbon' ? 160 : 256;
  if (swatch.img) {
    const im = await load(swatch.img), tile = document.createElement('canvas'); tile.width = tile.height = textureSize;
    const tc = tile.getContext('2d', { willReadFrequently: true }); tc.drawImage(im, 0, 0, textureSize, textureSize); carbon = tc.getImageData(0, 0, textureSize, textureSize).data;
  }
  const out = surface(), ctx = out.getContext('2d'), pixels = ctx.createImageData(out.width, out.height), p = pixels.data;
  const body = rgb(cfg.airbagCol), thread = rgb(cfg.airbagStitchColor), emblem = rgb(cfg.infinitiLogoCol);
  for (let y = 0; y < out.height; y++) for (let x = 0; x < out.width; x++) {
    const i = (y * out.width + x) * 4, a = m.original[i + 3];
    if (!a) continue;
    p[i + 3] = a;
    const logo = m.logo[i + 3] / 255, stitch = m.stitch[i / 4];
    let lum = m.original[i];
    if (cfg.airbagMat === 'Alcantara') {
      // One continuous full-size suede photograph: no modulo sampling,
      // tiled patches or rectangular restoration zones.
      lum = m.texture[i];
      const embossZone = clamp(Math.min(x - 605, 839 - x, y - 593, 794 - y) / 18);
      const detail = m.embossFine[i] - m.embossBroad[i];
      lum += detail * embossZone * 1.65;
      // Retain the dark molded recess immediately around the emblem.
      const rim = clamp(1 - Math.abs(Math.hypot((x - 716) / 238, (y - 340) / 116) - 1) / .12);
      lum *= 1 - rim * clamp((60 - m.original[i]) / 60) * .7;
    }
    const tx = ((x - 490 + textureSize * 10) % textureSize), ty = ((y - 230 + textureSize * 10) % textureSize), ci = (ty * textureSize + tx) * 4;
    const ledPosition = clamp((x - 490) / 455 + (y - 330) / 1800);
    const ledStops = [[20,65,255],[180,0,255],[255,0,145]];
    const ledSegment = ledPosition < .5 ? 0 : 1, ledMix = ledPosition < .5 ? ledPosition * 2 : (ledPosition - .5) * 2;
    for (let ch = 0; ch < 3; ch++) {
      let value = cfg.airbagCol === '#111111' ? lum : lum + (body[ch] - 17) * Math.pow(Math.max(0, lum) / 255, .55);
      const t = thread[ch] * (.45 + m.original[i] / 350);
      value = value * (1 - stitch) + t * stitch;
      // Preserve the photographed specular highlights, without the original
      // carbon weave leaking into solid or forged finishes.
      const highlight = clamp((m.logoLighting[i] - 135) / 100);
      const reflect = carbon ? carbon[ci + ch] : emblem[ch] * (.52 + m.logoLighting[i] / 290);
      const lit = ledStops[ledSegment][ch] * (1 - ledMix) + ledStops[ledSegment + 1][ch] * ledMix;
      const finish = cfg.infinitiLogoFinish === 'LED'
        ? lit
        : reflect * (1 - highlight * .92) + 250 * highlight * .92;
      p[i + ch] = value * (1 - logo) + finish * logo;
    }
  }
  ctx.putImageData(pixels, 0, 0);
  target.width = out.width; target.height = out.height;
  target.getContext('2d').drawImage(out, 0, 0);
  return target;
}

// Animate only the emblem region; upholstery and embossed markings stay fixed.
export function drawInfinitiLedFrame(target, base, elapsed = 0) {
  const ctx = target.getContext('2d');
  ctx.clearRect(485, 225, 470, 230);
  ctx.drawImage(base, 485, 225, 470, 230, 485, 225, 470, 230);
  ctx.save();
  ctx.clip(new Path2D(LOGO_PATH), 'evenodd');
  const shift = (elapsed % 6000) / 6000 * 600;
  const gradient = ctx.createLinearGradient(490 - 600 - shift, 240, 490 + 1800 - shift, 240);
  // Repeated stops give the gradient a seamless six-second flowing cycle.
  for (let cycle = -1; cycle <= 2; cycle++) {
    for (const [at, color] of [[0, '#1441ff'], [1/3, '#b400ff'], [2/3, '#ff0091']]) {
      const stop = (cycle + at + 1) / 4;
      gradient.addColorStop(stop, color);
    }
  }
  gradient.addColorStop(1, '#1441ff');
  ctx.fillStyle = gradient;
  ctx.fillRect(485, 225, 470, 230);
  ctx.restore();
}
