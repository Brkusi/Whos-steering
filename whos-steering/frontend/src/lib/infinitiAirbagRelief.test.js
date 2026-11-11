import {applyEmbossLighting} from './infinitiAirbagRelief';
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
