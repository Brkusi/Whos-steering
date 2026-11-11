import { applyEmbossLighting, blurAirbagLuminance } from './infinitiAirbagRelief';
import { normalizeInfinitiAirbag, infinitiLogoPalette, infinitiAirbagProduct } from './infinitiAirbagConfiguration';
export const AIRBAG_WIDTH = 1442;
export const AIRBAG_HEIGHT = 1091;
// Surface of the emblem, with the two upholstery openings explicitly subtracted.
// Coordinates are registered to leather.png; no bounding-box recoloring is used.
export const LOGO_PATH = 'M 492 337 C 497 274 595 229 711 229 C 833 226 935 274 943 331 C 958 392 891 438 778 449 L 716 307 L 654 448 C 552 435 486 396 492 337 Z M 551 325 C 552 288 618 257 709 256 C 805 253 878 285 885 323 C 889 347 863 363 818 368 L 715 271 L 617 367 C 575 364 548 350 551 325 Z';
const NEW_LOGO_PATH = 'M 440 399 C 434 322 550 269 696 269 C 841 269 956 318 962 395 C 970 466 885 519 771 535 L 704 385 L 635 535 C 524 520 440 466 440 399 Z M 495 389 C 495 344 584 305 696 305 C 807 305 899 342 905 387 C 909 416 869 439 823 444 L 703 319 L 582 444 C 530 438 493 419 495 389 Z';
const NEW_SEAMS = [[53,424,446,961,982],[80,373,408,996,1034],[125,323,358,1044,1080],[175,280,311,1093,1126],[225,235,268,1134,1173],[275,193,228,1170,1210],[325,166,201,1200,1240],[375,147,184,1217,1258],[425,140,179,1221,1263],[475,144,189,1212,1256],[525,160,209,1194,1240],[575,184,237,1170,1219],[625,210,264,1145,1193],[675,238,292,1111,1165],[725,266,322,1082,1136],[775,301,350,1050,1106],[825,330,386,1016,1073],[875,363,421,974,1035],[925,401,458,923,994],[950,426,498,888,975],[975,454,935,454,935],[995,480,910,480,910],[1015,535,840,535,840],[1028,610,760,610,760]];
function geometry(productId) {
  const newer = infinitiAirbagProduct(productId).id === 'infiniti-q60-2017-q50-2018';
  return newer ? {width:1409,height:1116,path:NEW_LOGO_PATH,region:[431,262,540,280],emboss:[585,665,816,892],seams:NEW_SEAMS,rim:[701,400,267,139]} : {width:AIRBAG_WIDTH,height:AIRBAG_HEIGHT,path:LOGO_PATH,region:[485,225,470,230],emboss:[605,593,839,794],rim:[716,340,238,116]};
}
const clamp = x => Math.max(0, Math.min(1, x));
const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
const surface = (g) => { const c = document.createElement('canvas'); c.width = g.width; c.height = g.height; return c; };
const images = new Map();
function load(src) {
  if (!images.has(src)) images.set(src, new Promise((resolve, reject) => {
    const im = new Image(); im.onload = () => resolve(im); im.onerror = () => { images.delete(src); reject(new Error('Unable to load airbag artwork. Please retry.')); }; im.src = `${process.env.PUBLIC_URL || ''}${src}`;
  }));
  return images.get(src);
}
const masters = new Map(), ledReliefs = new Map();
// A rounded, lit edge registered to the exact emblem mask. No photographed
// carbon texture is used for the LED face or its highlights.
function buildLedRelief(mask, g) {
  const [left, top, width, height] = g.region;
  const distances = new Float32Array(width * height);
  const at = (x, y) => ((y + top) * g.width + x + left) * 4;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) distances[y * width + x] = mask[at(x,y) + 3] > 127 ? 999 : 0;
  for (let y = 1; y < height - 1; y++) for (let x = 1; x < width - 1; x++) {
    const n = y * width + x;
    distances[n] = Math.min(distances[n], distances[n-1]+1, distances[n-width]+1, distances[n-width-1]+1.414, distances[n-width+1]+1.414);
  }
  for (let y = height - 2; y > 0; y--) for (let x = width - 2; x > 0; x--) {
    const n = y * width + x;
    distances[n] = Math.min(distances[n], distances[n+1]+1, distances[n+width]+1, distances[n+width-1]+1.414, distances[n+width+1]+1.414);
  }
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d'), pixels = ctx.createImageData(width,height);
  for (let y = 1; y < height - 1; y++) for (let x = 1; x < width - 1; x++) {
    const n = y * width + x, d = distances[n], i = n * 4;
    if (!d) continue;
    const dx = distances[n+1] - distances[n-1], dy = distances[n+width] - distances[n-width];
    const length = Math.hypot(dx,dy) || 1;
    const facing = (dx * .5 + dy * .866) / length;
    const bevel = Math.pow(clamp(1 - (d-1) / 9), .7);
    // Upper/left surfaces catch the softbox; the underside has a seated edge.
    const light = facing * bevel * .48 - .09 * y / height;
    const rim = d < 1.5 ? .22 : 0;
    const shade = light - rim;
    const color = shade > 0 ? 255 : 0;
    pixels.data[i] = pixels.data[i+1] = pixels.data[i+2] = color;
    pixels.data[i+3] = Math.round(Math.abs(shade) * mask[at(x,y)+3]);
  }
  ctx.putImageData(pixels,0,0); return canvas;
}
async function master(productId) {
  const product = infinitiAirbagProduct(productId), g = geometry(product.id);
  if (!masters.has(product.id)) masters.set(product.id, (async () => {
    const [base, suede] = await Promise.all([load(`/models/${product.artwork}/leather.png`), load(`/models/${product.artwork}/suede-surface.png`)]);
    const c = surface(g), ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(base, 0, 0, c.width, c.height); const original = ctx.getImageData(0, 0, c.width, c.height).data;
    const logoLighting = blurAirbagLuminance(original, c.width, c.height, 7);
    const embossFine = blurAirbagLuminance(original, c.width, c.height, 1, 1);
    const embossBroad = blurAirbagLuminance(original, c.width, c.height, 22);
    ctx.clearRect(0, 0, c.width, c.height); ctx.fillStyle = '#fff'; ctx.fill(new Path2D(g.path), 'evenodd');
    const logo = ctx.getImageData(0, 0, c.width, c.height).data;
    ledReliefs.set(product.id, buildLedRelief(logo, g));
    // Measured seam positions at regular rows in the neutral master. The
    // corridor includes both rows; luminance selects only raised thread.
    const seamRows = g.seams || [[125,185,202,1236,1256],[150,173,195,1242,1264],[200,162,191,1244,1274],[250,164,196,1240,1271],[300,172,201,1234,1265],[350,180,211,1225,1256],[400,192,222,1215,1245],[450,205,235,1202,1231],[500,220,249,1189,1218],[550,236,265,1173,1203],[600,253,282,1158,1187],[650,270,299,1141,1170],[700,288,318,1124,1153],[750,307,337,1106,1135],[800,328,357,1086,1116],[850,348,378,1067,1096],[900,369,398,1046,1075],[950,390,419,1023,1053],[1000,413,440,1000,1029],[1045,440,463,982,1009]];
    const stitch = new Float32Array(c.width * c.height);
    for (let y = seamRows[0][0]; y <= seamRows[seamRows.length-1][0]; y++) {
      const row = Math.max(0, seamRows.findIndex(r => r[0] >= y) - 1);
      const lo = seamRows[row], hi = seamRows[row + 1], t = clamp((y - lo[0]) / (hi[0] - lo[0]));
      const v = lo.map((n, i) => n + (hi[i] - n) * t);
      for (let x = 0; x < c.width; x++) {
        if (!((x >= v[1] - 7 && x <= v[2] + 7) || (x >= v[3] - 7 && x <= v[4] + 7))) continue;
        const i = (y * c.width + x) * 4;
        stitch[i / 4] = g.seams ? clamp((original[i] - 125) / 55) : clamp((original[i] - 92) / 43);
      }
    }
    // Use the material reference only for texture. Geometry, seams and embossed
    // markings always come from the single master so they cannot drift.
    ctx.clearRect(0, 0, c.width, c.height); ctx.drawImage(suede, 0, 0, c.width, c.height);
    const texture = ctx.getImageData(0, 0, c.width, c.height).data;
    // Isolate the photographed glyph relief, not a retyped font or a dark
    // rectangular patch. A separate light pass stays legible after body tinting.
    const emboss = new Float32Array(c.width * c.height);
    const [ex0,ey0,ex1,ey1] = g.emboss;
    for (let y = ey0; y < ey1; y++) for (let x = ex0; x < ex1; x++) {
      const n = y * c.width + x;
      const feather = clamp(Math.min(x-ex0,ex1-x,y-ey0,ey1-y)/18);
      emboss[n] = clamp((embossBroad[n] - embossFine[n] - 2) / 13) * feather;
    }
    const depthSource = new Float32Array(emboss);
    for (let y = ey0; y < ey1; y++) for (let x = ex0; x < ex1; x++) {
      const n = y * c.width + x, w = c.width;
      emboss[n] = (depthSource[n]*4 + (depthSource[n-1]+depthSource[n+1]+depthSource[n-w]+depthSource[n+w])*2 + depthSource[n-w-1]+depthSource[n-w+1]+depthSource[n+w-1]+depthSource[n+w+1])/16;
    }
    return { original, logoLighting, logo, stitch, texture, emboss };
  })().catch(error => { masters.delete(product.id); throw error; }));
  return masters.get(product.id);
}
export async function renderInfinitiAirbag(target, config, productId) {
  const g = geometry(productId), cfg = normalizeInfinitiAirbag(config), m = await master(productId);
  const swatch = infinitiLogoPalette(cfg.infinitiLogoFinish).find(v => v.h === cfg.infinitiLogoCol);
  let carbon;
  const textureSize = cfg.infinitiLogoFinish === 'Forged Carbon' ? 160 : 256;
  if (swatch.img) {
    const im = await load(swatch.img), tile = document.createElement('canvas'); tile.width = tile.height = textureSize;
    const tc = tile.getContext('2d', { willReadFrequently: true }); tc.drawImage(im, 0, 0, textureSize, textureSize); carbon = tc.getImageData(0, 0, textureSize, textureSize).data;
  }
  const out = surface(g), ctx = out.getContext('2d'), pixels = ctx.createImageData(out.width, out.height), p = pixels.data;
  // The neutral photograph is the lighter charcoal surface. Reserve it for
  // Dark Gray; Black uses the darker dyed shade previously shown as charcoal.
  const body = rgb(cfg.airbagCol === '#111111' ? '#2A2A2A' : cfg.airbagCol), thread = rgb(cfg.airbagStitchColor), emblem = rgb(cfg.infinitiLogoCol);
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
      // Retain the dark molded recess immediately around the emblem.
      const rim = clamp(1 - Math.abs(Math.hypot((x - g.rim[0]) / g.rim[2], (y - g.rim[1]) / g.rim[3]) - 1) / .12);
      lum *= 1 - rim * clamp((60 - m.original[i]) / 60) * .7;
    }
    const n = i / 4, depth = m.emboss[n];
    // Recessed lower/right walls catch light; the dark interior retains the
    // chosen hue. Three source pixels produce a visible lip at preview scale.
    const lip = Math.max(0, (m.emboss[n - out.width * 3 - 3] || 0) - (m.emboss[n + out.width * 3 + 3] || 0));
    const tx = ((x - 490 + textureSize * 10) % textureSize), ty = ((y - 230 + textureSize * 10) % textureSize), ci = (ty * textureSize + tx) * 4;
    const ledPosition = clamp((x - 490) / 455 + (y - 330) / 1800);
    const ledStops = [[20,65,255],[180,0,255],[255,0,145]];
    const ledSegment = ledPosition < .5 ? 0 : 1, ledMix = ledPosition < .5 ? ledPosition * 2 : (ledPosition - .5) * 2;
    for (let ch = 0; ch < 3; ch++) {
      // Dye the existing material with the selected swatch rather than adding
      // neutral gray to RGB channels, which desaturates every colored finish.
      const dyeShade = Math.min(1.05, .82 * Math.pow(Math.max(0, lum) / 55, .62));
      const dyed = body[ch] * dyeShade;
      let value = cfg.airbagCol === '#2A2A2A' ? lum : cfg.airbagCol === '#111111' ? Math.min(lum * .78, dyed) : dyed;
      const t = thread[ch] * Math.min(.95, .45 + m.original[i] / 350);
      value = value * (1 - stitch) + t * stitch;
      if (cfg.airbagMat === 'Alcantara') value = applyEmbossLighting(value, depth, lip);
      // Preserve the photographed specular highlights, without the original
      // carbon weave leaking into solid or forged finishes.
      const highlight = clamp((m.logoLighting[n] - 135) / 100);
      const emblemLight = cfg.infinitiLogoFinish === 'Carbon color' ? m.original[i] : m.logoLighting[n];
      const reflect = carbon ? carbon[ci + ch] : emblem[ch] * Math.min(1, .58 + emblemLight / 500);
      const lit = ledStops[ledSegment][ch] * (1 - ledMix) + ledStops[ledSegment + 1][ch] * ledMix;
      const finish = cfg.infinitiLogoFinish === 'Carbon color' ? reflect : cfg.infinitiLogoFinish === 'LED'
        ? lit
        : reflect * (1 - highlight * .28) + 250 * highlight * .28;
      p[i + ch] = value * (1 - logo) + finish * logo;
    }
  }
  ctx.putImageData(pixels, 0, 0);
  target.width = out.width; target.height = out.height;
  target.getContext('2d').drawImage(out, 0, 0);
  return target;
}

// Animate only the emblem region; upholstery and embossed markings stay fixed.
export function drawInfinitiLedFrame(target, base, elapsed = 0, productId) {
  const g = geometry(productId), [left,top,width,height] = g.region, ledRelief = ledReliefs.get(infinitiAirbagProduct(productId).id);
  const ctx = target.getContext('2d');
  ctx.clearRect(left,top,width,height);
  ctx.drawImage(base,left,top,width,height,left,top,width,height);
  ctx.save();
  ctx.clip(new Path2D(g.path), 'evenodd');
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
  ctx.fillRect(left,top,width,height);
  if (ledRelief) ctx.drawImage(ledRelief,left,top);
  // A broad reflection across the polished diffuser adds a curved face,
  // while the flowing color and the upholstery openings remain fully masked.
  const sheen = ctx.createLinearGradient(0, top, 0, top+height);
  sheen.addColorStop(0, 'rgba(255,255,255,.24)');
  sheen.addColorStop(.28, 'rgba(255,255,255,.07)');
  sheen.addColorStop(.45, 'rgba(255,255,255,0)');
  sheen.addColorStop(1, 'rgba(0,0,0,.08)');
  ctx.fillStyle = sheen; ctx.fillRect(left,top,width,height);
  ctx.restore();
}
