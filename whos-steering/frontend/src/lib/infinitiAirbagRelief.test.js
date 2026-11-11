import {applyEmbossLighting, blurAirbagLuminance} from './infinitiAirbagRelief';
import {COLORS} from './data';
test('embossed edges stay visible on every palette color, including dark dyes',()=>{
  for(const color of COLORS) {
    const channels=[1,3,5].map(i=>parseInt(color.h.slice(i,i+2),16)*.7);
    const surface=channels.reduce((a,b)=>a+b)/3;
    const shadow=channels.map(v=>applyEmbossLighting(v,1,0)).reduce((a,b)=>a+b)/3;
    const edge=channels.map(v=>applyEmbossLighting(v,0,1)).reduce((a,b)=>a+b)/3;
    expect(edge-shadow).toBeGreaterThan(30);
    expect(shadow).toBeLessThan(surface);
    expect(edge).toBeGreaterThan(surface);
    expect(edge-surface).toBeLessThanOrEqual(31);
    expect(channels.map(v=>applyEmbossLighting(v,0,0))).toEqual(channels);
  }
});

test('relief survives on browsers without canvas filter support', () => {
  // A dark molded stroke on a flat material must produce a depth mask even
  // when there is no canvas API available at all.
  const width = 81, height = 81;
  const rgba = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 4;
    rgba[i] = x >= 38 && x <= 42 && y >= 15 && y <= 65 ? 20 : 55;
    rgba[i + 3] = 255;
  }
  const fine = blurAirbagLuminance(rgba, width, height, 1, 1);
  const broad = blurAirbagLuminance(rgba, width, height, 22);
  expect(broad[40 * width + 40] - fine[40 * width + 40]).toBeGreaterThan(25);
  expect(fine[0]).toBe(55);
  expect(Array.from(broad).every(Number.isFinite)).toBe(true);
});
