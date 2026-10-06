import { carbonCoordinates } from './bmwFSeriesCarbonUV';
import F_CALIBRATION from './bmwFSeriesCalibration.json';
import G_CALIBRATION from './bmwGSeriesCalibration.json';
import AUDI_RS_CALIBRATION from './audiRS2020Calibration.json';
import SUPRA_CALIBRATION from './sourceCalibrationSupraGr.json';
import MERCEDES_AMG_CALIBRATION from './sourceCalibrationMercedesAmg.json';
import MERCEDES_2015_CALIBRATION from './sourceCalibrationMercedes2015.json';
import MERCEDES_2010_CALIBRATION from './sourceCalibrationMercedes2010.json';
import PORSCHE_991_CALIBRATION from './sourceCalibrationPorsche991.json';
import PORSCHE_992_CALIBRATION from './sourceCalibrationPorsche992.json';
import DODGE_SRT_CALIBRATION from './sourceCalibrationDodgeSrt.json';
import { SourceMaterialRenderer } from './bmwFSeriesSourceRenderer';
import { sourceMaterial } from './bmwFSeriesConfiguration';


const SIZE = 1024;
const canvas = (size=SIZE) => {const c=document.createElement('canvas');c.width=c.height=size;return c;};
export const stripeColorIndex = (x, left, right, count) => Math.max(0, Math.min(count - 1, Math.floor((x - left) / Math.max(1, right - left + 1) * count)));
const rgb = hex => [1,3,5].map(start=>parseInt(hex.slice(start,start+2),16));
export function wheelSilhouetteOpacity(red,green,blue,alpha,opaqueBlackBackground) {
  if (!opaqueBlackBackground) return alpha;
  const brightness=Math.max(red,green,blue);
  return Math.round(alpha*Math.max(0,Math.min(1,(brightness-5)/18)));
}
const SOURCE_CALIBRATIONS = {'audi-rs-2020':AUDI_RS_CALIBRATION,'supra-gr':SUPRA_CALIBRATION,
  'mercedes-amg':MERCEDES_AMG_CALIBRATION,'mercedes-2015':MERCEDES_2015_CALIBRATION,'mercedes-2010':MERCEDES_2010_CALIBRATION,
  'porsche-991':PORSCHE_991_CALIBRATION,'porsche-992':PORSCHE_992_CALIBRATION,'dodge-srt':DODGE_SRT_CALIBRATION,
  'bmw-gseries':G_CALIBRATION,'bmw-fseries':F_CALIBRATION};
// These four maps are absent on the source server. Use the closest map from
// the same shape and grip zone so every advertised option can still preview.
const SOURCE_MAP_FALLBACKS = {
  'mercedes-amg:round-tb-alcantara':'round-tb-smooth',
  'mercedes-2015:flat-round-side-perforated':'flat-round-side-smooth',
  'mercedes-2010:round-side-smooth':'round-side-perforated',
  'mercedes-2010:round-tb-perforated':'round-tb-smooth',
};

export function createFSeriesCompositor(family = 'bmw-fseries') {
  const ROOT = `${process.env.PUBLIC_URL || ''}/models/${family}`;
  const CALIBRATION = SOURCE_CALIBRATIONS[family] || F_CALIBRATION;
  const assets=new Map(), layers=new Map(), silhouettes=new Map(), materialRenderer=new SourceMaterialRenderer(12);
  let disposed=false;
  function image(path) {
    if(!assets.has(path))assets.set(path,new Promise((resolve,reject)=>{
      const img=new Image();img.decoding='async';img.onload=()=>resolve(img);img.onerror=()=>{assets.delete(path);reject(new Error(`Wheel image unavailable: ${path}`));};img.src=path;
    }));
    return assets.get(path);
  }
  const source = path => image(`${ROOT}/source/${path}.webp`);
  function silhouette(shape,base,guide) {
    if(silhouettes.has(shape))return silhouettes.get(shape);
    const mask=canvas(),ctx=mask.getContext('2d',{willReadFrequently:true});
    ctx.drawImage(base,0,0,SIZE,SIZE);
    const pixels=ctx.getImageData(0,0,SIZE,SIZE),p=pixels.data;
    const opaqueBlackBackground=p[3]>250&&Math.max(p[0],p[1],p[2])<10;
    for(let i=0;i<p.length;i+=4){
      const opacity=wheelSilhouetteOpacity(p[i],p[i+1],p[i+2],p[i+3],opaqueBlackBackground);
      p[i]=p[i+1]=p[i+2]=255;
      p[i+3]=opacity;
    }
    ctx.putImageData(pixels,0,0);
    // The Porsche full-top grip is a separate source layer. The 992 base
    // photograph has no upper arc, so its mask must include that layer.
    if(guide)ctx.drawImage(guide,0,0,SIZE,SIZE);
    silhouettes.set(shape,mask);return mask;
  }
  async function dodgePreWrap(key,color) {
    const original=await source(`pre/${key}-9800`),out=canvas(),ctx=out.getContext('2d',{willReadFrequently:true});
    ctx.drawImage(original,0,0,SIZE,SIZE);
    if(color && !['#292929','#111111'].includes(color.toLowerCase())) {
      const data=ctx.getImageData(0,0,SIZE,SIZE),p=data.data,tint=rgb(color);
      for(let i=0;i<p.length;i+=4){
        if(p[i+3]<8)continue;
        // Keep the neutral backing and highlights from the source photograph.
        const chroma=Math.max(p[i],p[i+1],p[i+2])-Math.min(p[i],p[i+1],p[i+2]);
        if(chroma<3)continue;
        const lum=(p[i]*.2126+p[i+1]*.7152+p[i+2]*.0722)/255;
        for(let c=0;c<3;c++)p[i+c]=Math.min(255,tint[c]*(.25+lum*1.15));
      }
      ctx.putImageData(data,0,0);
    }
    return out;
  }
  async function wrap(key,color,stitch,carbonFinish=false) {
    if(family==='dodge-srt' && /^(?:round-tb|yoke-bottom)-(?:smooth|alcantara|perforated)$/.test(key)) return dodgePreWrap(key,color);
    const mapKey=SOURCE_MAP_FALLBACKS[`${family}:${key}`] || key;
    const carbonCalibration=family.startsWith('bmw-') ? G_CALIBRATION : CALIBRATION;
    const result=await materialRenderer.render(`${carbonFinish ? 'carbon:' : ''}${mapKey}`,`${ROOT}/source/grips/${mapKey}-map.webp`,SIZE,(carbonFinish ? carbonCalibration : CALIBRATION)[mapKey],color,stitch).catch(error=>{materialRenderer.invalidate();throw error;});
    // Bound retained source pixel buffers as well as the rendered color cache.
    while(materialRenderer.sources.size>8)materialRenderer.sources.delete(materialRenderer.sources.keys().next().value);
    return result;
  }
  async function carbon(a) {
    const key=JSON.stringify([a.shape,a.top,a.carbonSwatch,a.carbonCustomTint]);if(layers.has(key))return layers.get(key);
    const finish=a.top.material==='Forged Carbon'?'forged':a.top.material==='Matte Carbon'?'matte':'glossy';
    const reference=await source(`cf/${a.shape}-${finish}`).catch(()=>null);
    const neutral=a.carbonSwatch===(finish==='forged'?'/forged/forged-classic.jpeg':'/classic/classic-black.png')&&!a.carbonCustomTint;
    // Use the photographed carbon layer for its real weave, flake scale,
    // edge highlights and gloss. The F-Series keeps its requested G-Series
    // print, and colored swatches still need the mapped texture below.
    if(reference&&neutral&&family!=='bmw-fseries')return reference;
    const [mask,texture]=await Promise.all([reference || wrap(`${a.shape}-${a.topZone}-smooth`,'#ffffff','#ffffff',true),image(`${process.env.PUBLIC_URL || ''}${a.carbonSwatch}`)]);
    const out=canvas(),ctx=out.getContext('2d',{willReadFrequently:true});ctx.drawImage(mask,0,0,SIZE,SIZE);
    const pixels=ctx.getImageData(0,0,SIZE,SIZE);
    const coordinates=carbonCoordinates(pixels.data,SIZE);
    // Small copies of the actual selection swatch keep the weave/flakes fine.
    const tileSize=96, tile=canvas(tileSize),tc=tile.getContext('2d',{willReadFrequently:true});
    tc.drawImage(texture,0,0,tileSize,tileSize);const pattern=tc.getImageData(0,0,tileSize,tileSize).data;
    const tint=rgb(a.top.color);const max=Math.max(...tint),min=Math.min(...tint);
    const multiplier=!a.carbonCustomTint||max-min<12||max<4?[1,1,1]:tint.map(v=>v/max);
    for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){
      const i=(y*SIZE+x)*4;if(!pixels.data[i+3])continue;
      const [along,across]=coordinates(x,y);
      const u=((Math.floor(along)%tileSize)+tileSize)%tileSize,v=((Math.floor(across)%tileSize)+tileSize)%tileSize,j=(v*tileSize+u)*4;
      const luminance=(pixels.data[i]*.2126+pixels.data[i+1]*.7152+pixels.data[i+2]*.0722)/255;
      const shine=reference?Math.pow(Math.max(0,(luminance-.27)/.73),2)*(finish==='matte'?105:210):0;
      for(let c=0;c<3;c++)pixels.data[i+c]=Math.min(255,pattern[j+c]*(.53+luminance*.75)*multiplier[c]+shine);
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
      // Faint antialiased pixels extend past the solid marker bounds.
      const color=colors[stripeColorIndex((i/4)%SIZE,left,right,colors.length)];
      for(let c=0;c<3;c++)p[i+c]=Math.min(255,color[c]*gain+255*highlight);
    }
    ctx.putImageData(data,0,0);return out;
  }
  async function render(a) {
    const [base,paddles,side,top,trim,cover,logo,dodgeTrim,dodgeLogo,ring,led,guide]=await Promise.all([
      source(a.shape),a.paddle?source(`paddles/${a.paddle}`):null,
      wrap(`${a.shape}-side-${sourceMaterial(a.side.material)}`,a.side.color,a.stitch),
      a.top.material.includes('Carbon')?carbon(a):wrap(`${a.shape}-${a.topZone}-${sourceMaterial(a.top.material)}`,a.top.color,a.stitch),
      a.lowerTrim?source(`trims/${a.lowerTrim}`):null,
      a.cover?wrap(`airbag-${sourceMaterial(a.airbag.material)}`,a.airbag.color,a.airbagStitch):null,
      a.cover && family!=='dodge-srt'?source(`neutral/airbag-${sourceMaterial(a.airbag.material)}-logo`):null,
      a.cover && family==='dodge-srt'?wrap('airbag-trim',a.dodgeAirbagTrim,a.airbagStitch):null,
      a.cover && family==='dodge-srt'?wrap('srt-logo',a.dodgeLogo,a.airbagStitch):null,
      a.stripes.length?marker(a):null,a.led?source(`led/${a.shape}`):null,
      family.startsWith('porsche-')&&a.shape!=='yoke'?source(`cf/${a.shape}-glossy`):null,
    ]);
    if(disposed)return null;
    const out=canvas(),ctx=out.getContext('2d');
    ctx.drawImage(base,0,0,SIZE,SIZE);
    // The 991 base contains its original carbon top at a different outline
    // from the selectable grip layers. Clear that rim before repainting it;
    // this also removes the small exposed carbon fragments on the 992.
    if(guide){ctx.clearRect(0,0,SIZE,SIZE*.28);ctx.clearRect(0,SIZE*.91,SIZE,SIZE*.09);}
    // This is the reference's exact composition order. Lighten places the
    // paddles behind the wheel while retaining the source's black background.
    if(paddles){ctx.globalCompositeOperation='lighten';ctx.drawImage(paddles,0,0,SIZE,SIZE);ctx.globalCompositeOperation='source-over';}
    const materials=canvas(),mc=materials.getContext('2d');
    [side,top,trim,cover,logo,dodgeTrim,dodgeLogo].filter(Boolean).forEach(layer=>mc.drawImage(layer,0,0,SIZE,SIZE));
    mc.globalCompositeOperation='destination-in';mc.drawImage(silhouette(a.shape,base,guide),0,0,SIZE,SIZE);
    ctx.drawImage(materials,0,0,SIZE,SIZE);
    if(ring)ctx.drawImage(ring,0,0,SIZE,SIZE);
    if(led)ctx.drawImage(led,0,0,SIZE,SIZE);
    return out;
  }
  return {render,dispose(){disposed=true;assets.clear();layers.clear();silhouettes.clear();materialRenderer.invalidate();}};
}
