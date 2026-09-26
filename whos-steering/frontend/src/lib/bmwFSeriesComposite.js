import { carbonCoordinates } from './bmwFSeriesCarbonUV';
import CALIBRATION from './bmwFSeriesCalibration.json';
import { SourceMaterialRenderer } from './bmwFSeriesSourceRenderer';
import { sourceMaterial } from './bmwFSeriesConfiguration';

const ROOT = `${process.env.PUBLIC_URL || ''}/models/bmw-fseries`;
const SIZE = 1024;
const canvas = (size=SIZE) => {const c=document.createElement('canvas');c.width=c.height=size;return c;};
const rgb = hex => [1,3,5].map(start=>parseInt(hex.slice(start,start+2),16));

export function createFSeriesCompositor() {
  const assets=new Map(), layers=new Map(), materialRenderer=new SourceMaterialRenderer(12);
  let disposed=false;
  function image(path) {
    if(!assets.has(path))assets.set(path,new Promise((resolve,reject)=>{
      const img=new Image();img.decoding='async';img.onload=()=>resolve(img);img.onerror=()=>{assets.delete(path);reject(new Error(`Wheel image unavailable: ${path}`));};img.src=path;
    }));
    return assets.get(path);
  }
  const source = path => image(`${ROOT}/source/${path}.webp`);
  async function wrap(key,color,stitch) {
    const result=await materialRenderer.render(key,`${ROOT}/source/grips/${key}-map.webp`,SIZE,CALIBRATION[key],color,stitch).catch(error=>{materialRenderer.invalidate();throw error;});
    // Bound retained source pixel buffers as well as the rendered color cache.
    while(materialRenderer.sources.size>8)materialRenderer.sources.delete(materialRenderer.sources.keys().next().value);
    return result;
  }
  async function carbon(a) {
    const type=a.top.material==='Forged Carbon'?'forged':a.top.material==='Matte Carbon'?'matte':'glossy';
    const key=JSON.stringify([a.shape,a.top]);if(layers.has(key))return layers.get(key);
    const [mask,texture]=await Promise.all([wrap(`${a.shape}-${a.topZone}-smooth`,'#ffffff','#ffffff'),image(a.top.material==='Honeycomb Carbon'?`${process.env.PUBLIC_URL || ''}/HoneyComb.jpeg`:`${ROOT}/${type==='forged'?'forged':'classic'}.webp`)]);
    const out=canvas(),ctx=out.getContext('2d',{willReadFrequently:true});ctx.drawImage(mask,0,0,SIZE,SIZE);
    const pixels=ctx.getImageData(0,0,SIZE,SIZE);
    // Use the original rim mask and lighting: carbon reference overlays can
    // have different edges from the underlying wheel photograph.
    const coordinates=carbonCoordinates(pixels.data,SIZE);
    const light=canvas(),lc=light.getContext('2d',{willReadFrequently:true});lc.filter='blur(3px)';lc.drawImage(mask,0,0,SIZE,SIZE);
    const lighting=lc.getImageData(0,0,SIZE,SIZE).data;
    const tile=canvas(512),tc=tile.getContext('2d',{willReadFrequently:true});tc.drawImage(texture,0,0,512,512);const pattern=tc.getImageData(0,0,512,512).data;
    const tint=rgb(a.top.color);const max=Math.max(...tint),min=Math.min(...tint);
    const multiplier=max-min<12||max<4?[1,1,1]:tint.map(v=>v/max);
    for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){
      const i=(y*SIZE+x)*4;if(!pixels.data[i+3])continue;
      const [along,across]=coordinates(x,y);
      const u=((Math.floor(along*.75)%512)+512)%512,v=((Math.floor(across*.75)%512)+512)%512,j=(v*512+u)*4;
      const luminance=(lighting[i]*.2126+lighting[i+1]*.7152+lighting[i+2]*.0722)/255;
      for(let c=0;c<3;c++)pixels.data[i+c]=Math.min(255,pattern[j+c]*(.5+luminance*2.2)*multiplier[c]+Math.max(0,luminance-.48)*170);
    }
    ctx.putImageData(pixels,0,0);layers.set(key,out);if(layers.size>8)layers.delete(layers.keys().next().value);return out;
  }
  async function marker(a) {
    const original=await source(`marker/${a.shape}`),out=canvas(),ctx=out.getContext('2d',{willReadFrequently:true});ctx.drawImage(original,0,0,SIZE,SIZE);
    const data=ctx.getImageData(0,0,SIZE,SIZE),p=data.data;
    let left=SIZE,right=0;
    for(let i=0;i<p.length;i+=4)if(p[i+3]>20){const x=(i/4)%SIZE;left=Math.min(left,x);right=Math.max(right,x);}
    const colors=a.stripes.map(rgb);
    for(let i=0;i<p.length;i+=4){if(!p[i+3])continue;
      const m=(p[i]*.2126+p[i+1]*.7152+p[i+2]*.0722)/255, gain=Math.min(1.15,.38+m*1.35),highlight=Math.max(0,(m-.58)/.42)*.22;
      const color=colors[Math.min(colors.length-1,Math.floor(((i/4)%SIZE-left)/(right-left+1)*colors.length))];
      for(let c=0;c<3;c++)p[i+c]=Math.min(255,color[c]*gain+255*highlight);
    }
    ctx.putImageData(data,0,0);return out;
  }
  async function render(a) {
    const [base,paddles,side,top,trim,cover,logo,ring,led]=await Promise.all([
      source(a.shape),a.paddle?source(`paddles/${a.paddle}`):null,
      wrap(`${a.shape}-side-${sourceMaterial(a.side.material)}`,a.side.color,a.stitch),
      a.top.material.includes('Carbon')?carbon(a):wrap(`${a.shape}-${a.topZone}-${sourceMaterial(a.top.material)}`,a.top.color,a.stitch),
      a.lowerTrim?source(`trims/${a.lowerTrim}`):null,
      a.cover?wrap(`airbag-${sourceMaterial(a.airbag.material)}`,a.airbag.color,a.airbagStitch):null,
      a.cover?source(`neutral/airbag-${sourceMaterial(a.airbag.material)}-logo`):null,
      a.stripes.length?marker(a):null,a.led?source('led/flat-round'):null,
    ]);
    if(disposed)return null;
    const out=canvas(),ctx=out.getContext('2d');
    ctx.drawImage(base,0,0,SIZE,SIZE);
    // This is the reference's exact composition order. Lighten places the
    // paddles behind the wheel while retaining the source's black background.
    if(paddles){ctx.globalCompositeOperation='lighten';ctx.drawImage(paddles,0,0,SIZE,SIZE);ctx.globalCompositeOperation='source-over';}
    [side,top,trim,cover,logo,ring,led].filter(Boolean).forEach(layer=>ctx.drawImage(layer,0,0,SIZE,SIZE));
    return out;
  }
  return {render,dispose(){disposed=true;assets.clear();layers.clear();materialRenderer.invalidate();}};
}
