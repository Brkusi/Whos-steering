import { createLedArtwork, drawLedDisplay, rimLedPlacement } from './ledDisplay';
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
export function wheelSilhouetteOpacity(red,green,blue,alpha,opaqueBlackBackground,rimAlpha=0) {
  if (!opaqueBlackBackground) return Math.max(alpha,rimAlpha);
  const brightness=Math.max(red,green,blue);
  return Math.max(rimAlpha,Math.round(alpha*Math.max(0,Math.min(1,(brightness-5)/18))));
}
const smoothEdge = (start,end,value) => Math.max(0,Math.min(1,(value-start)/(end-start)));
export function gripZoneOpacity(x,y,zone,shape='round') {
  const dx=Math.abs(x-.5),dy=y-.5;
  const rim=smoothEdge(.265,.305,Math.hypot(dx,dy));
  if(zone==='side')return rim*smoothEdge(.22,.275,dx);
  if(shape==='yoke')return rim*smoothEdge(.69,.75,y);
  return rim*Math.max(1-smoothEdge(.28,.34,y),smoothEdge(.67,.74,y));
}
const SOURCE_CALIBRATIONS = {'audi-rs-2020':AUDI_RS_CALIBRATION,'supra-gr':SUPRA_CALIBRATION,
  'mercedes-amg':MERCEDES_AMG_CALIBRATION,'mercedes-2015':MERCEDES_2015_CALIBRATION,'mercedes-2010':MERCEDES_2010_CALIBRATION,
  'porsche-991':PORSCHE_991_CALIBRATION,'porsche-992':PORSCHE_992_CALIBRATION,'dodge-srt':DODGE_SRT_CALIBRATION,
  'bmw-gseries':G_CALIBRATION,'bmw-fseries':F_CALIBRATION};
// Their map files are absent, but the source publishes the actual materials
// as photographs. Preserve those textures instead of substituting leather types.
const SOURCE_PRE_MATERIALS = new Set([
  'mercedes-amg:round-tb-alcantara',
  'mercedes-2015:flat-round-side-perforated',
  'mercedes-2010:round-side-smooth',
  'mercedes-2010:round-tb-perforated',
]);
export function recolorSourcePhotographs(dark,light,color) {
  const target=rgb(color),black=rgb('#17181b'),white=rgb('#dcded0');
  const mix=target.map((value,c)=>(value-black[c])/(white[c]-black[c]));
  for(let i=0;i<dark.length;i+=4) {
    if(!dark[i+3])continue;
    for(let c=0;c<3;c++)dark[i+c]=Math.max(0,Math.min(255,dark[i+c]+(light[i+c]-dark[i+c])*mix[c]));
  }
  return dark;
}

export function createFSeriesCompositor(family = 'bmw-fseries') {
  const ROOT = `${process.env.PUBLIC_URL || ''}/models/${family}`;
  const CALIBRATION = SOURCE_CALIBRATIONS[family] || F_CALIBRATION;
  const assets=new Map(), layers=new Map(), silhouettes=new Map(), gripMasks=new WeakMap(), materialRenderer=new SourceMaterialRenderer(12);
  let disposed=false;
  const ledArtwork=createLedArtwork();
  function image(path) {
    if(!assets.has(path))assets.set(path,new Promise((resolve,reject)=>{
      const img=new Image();img.decoding='async';img.onload=()=>resolve(img);img.onerror=()=>{assets.delete(path);reject(new Error(`Wheel image unavailable: ${path}`));};img.src=path;
    }));
    return assets.get(path);
  }
  const source = path => image(`${ROOT}/source/${path}.webp`);
  function gripLayer(original,zone,shape) {
    if(family === 'bmw-gseries'||family === 'bmw-2010')return original;
    const key=`${zone}:${shape}`;
    if(gripMasks.get(original)?.has(key))return gripMasks.get(original).get(key);
    const out=canvas(),ctx=out.getContext('2d',{willReadFrequently:true});
    ctx.drawImage(original,0,0,SIZE,SIZE);
    const pixels=ctx.getImageData(0,0,SIZE,SIZE),p=pixels.data;
    for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){
      const i=(y*SIZE+x)*4;
      if(p[i+3])p[i+3]=Math.round(p[i+3]*gripZoneOpacity(x/SIZE,y/SIZE,zone,shape));
    }
    ctx.putImageData(pixels,0,0);
    if(!gripMasks.has(original))gripMasks.set(original,new Map());
    gripMasks.get(original).set(key,out);
    return out;
  }
  function silhouette(shape,base,guide) {
    if(silhouettes.has(shape))return silhouettes.get(shape);
    const mask=canvas(),ctx=mask.getContext('2d',{willReadFrequently:true});
    let rimPixels=null;
    if(guide){ctx.drawImage(guide,0,0,SIZE,SIZE);rimPixels=ctx.getImageData(0,0,SIZE,SIZE).data;ctx.clearRect(0,0,SIZE,SIZE);}
    ctx.drawImage(base,0,0,SIZE,SIZE);
    const pixels=ctx.getImageData(0,0,SIZE,SIZE),p=pixels.data;
    const opaqueBlackBackground=p[3]>250&&Math.max(p[0],p[1],p[2])<10;
    for(let i=0;i<p.length;i+=4){
      const opacity=wheelSilhouetteOpacity(p[i],p[i+1],p[i+2],p[i+3],opaqueBlackBackground,rimPixels?.[i+3] || 0);
      p[i]=p[i+1]=p[i+2]=255;
      p[i+3]=opacity;
    }
    ctx.putImageData(pixels,0,0);
    // The source rim alpha defines physical coverage independently of its
    // dark carbon texture. Luminance alone punches holes in colored leather.
    // It also restores the Porsche 992 upper arc absent from the base photo.
    silhouettes.set(shape,mask);return mask;
  }
  async function photographedWrap(key,color,stitch) {
    const cacheKey=JSON.stringify(['photo',key,color,stitch]);
    if(layers.has(cacheKey))return layers.get(cacheKey);
    const [dark,light,seam]=await Promise.all([
      source(`pre/${key}-9800`),source(`pre/${key}-9801`),
      family==='dodge-srt'||family==='bmw-2010'?null:source(`stitch/${key.replace(/-(alcantara|smooth|perforated)$/,'')}`),
    ]);
    const out=canvas(),ctx=out.getContext('2d',{willReadFrequently:true});
    ctx.drawImage(light,0,0,SIZE,SIZE);const lightPixels=ctx.getImageData(0,0,SIZE,SIZE);
    ctx.clearRect(0,0,SIZE,SIZE);ctx.drawImage(dark,0,0,SIZE,SIZE);
    const pixels=ctx.getImageData(0,0,SIZE,SIZE);
    // The storefront black/white swatches use the reference photographs exactly.
    if((family==='bmw-gseries'||family==='bmw-2010') && ['#111111','#17181b'].includes(color.toLowerCase())) {}
    else if((family==='bmw-gseries'||family==='bmw-2010') && ['#f0f0f0','#dcded0'].includes(color.toLowerCase()))pixels.data.set(lightPixels.data);
    else recolorSourcePhotographs(pixels.data,lightPixels.data,color);
    ctx.putImageData(pixels,0,0);
    if(seam) {
      const stitchCanvas=canvas(),sc=stitchCanvas.getContext('2d',{willReadFrequently:true});
      sc.drawImage(seam,0,0,SIZE,SIZE);const threads=sc.getImageData(0,0,SIZE,SIZE),tint=rgb(stitch);
      for(let i=0;i<threads.data.length;i+=4) {
        if(!threads.data[i+3])continue;
        const gain=.22+.78*(threads.data[i]*.2126+threads.data[i+1]*.7152+threads.data[i+2]*.0722)/255;
        for(let c=0;c<3;c++)threads.data[i+c]=tint[c]*gain;
      }
      sc.putImageData(threads,0,0);ctx.drawImage(stitchCanvas,0,0);
    }
    layers.set(cacheKey,out);if(layers.size>8)layers.delete(layers.keys().next().value);
    return out;
  }
  async function wrap(key,color,stitch,carbonFinish=false) {
    if((family==='bmw-gseries'||family==='bmw-2010') && /^(round|flat-round|flat-flat|yoke)-(side|tb|bottom)-(smooth|perforated|alcantara)$/.test(key))return photographedWrap(key,color,stitch);
    if(family==='dodge-srt' && /^(?:round-tb|yoke-bottom)-(?:smooth|alcantara|perforated)$/.test(key)) return photographedWrap(key,color,stitch);
    if(SOURCE_PRE_MATERIALS.has(`${family}:${key}`))return photographedWrap(key,color,stitch);
    const mapKey=key;
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
    const neutral=finish==='matte'||a.carbonSwatch===(finish==='forged'?'/forged/forged-classic.jpeg':'/classic/classic-black.png')&&!a.carbonCustomTint;
    // Use the photographed carbon layer for its real weave, flake scale,
    // edge highlights and gloss. The F-Series keeps its requested G-Series
    // print, and colored swatches still need the mapped texture below.
    if(reference&&neutral&&(family!=='bmw-fseries'||finish==='matte'))return reference;
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
    const [base,paddles,side,top,trim,cover,logo,dodgeTrim,dodgeLogo,ring,guide]=await Promise.all([
      source(a.shape),a.magnetic?image(`${process.env.PUBLIC_URL || ''}/models/audi-b85/source/paddles-magnetic.png`):a.paddle?source(`paddles/${a.paddle}`):null,
      wrap(`${a.shape}-side-${sourceMaterial(a.side.material)}`,a.side.color,a.stitch).then(layer=>gripLayer(layer,'side',a.shape)),
      (a.top.material.includes('Carbon')?carbon(a):wrap(`${a.shape}-${a.topZone}-${sourceMaterial(a.top.material)}`,a.top.color,a.stitch)).then(layer=>gripLayer(layer,'top',a.shape)),
      a.lowerTrim?source(`trims/${a.lowerTrim}`):null,
      a.cover?wrap(`airbag-${sourceMaterial(a.airbag.material)}`,a.airbag.color,a.airbagStitch):null,
      a.cover && family!=='dodge-srt'?source(`neutral/airbag-${sourceMaterial(a.airbag.material)}-logo`):null,
      a.cover && family==='dodge-srt'?wrap('airbag-trim',a.dodgeAirbagTrim,a.airbagStitch):null,
      a.cover && family==='dodge-srt'?wrap('srt-logo',a.dodgeLogo,a.airbagStitch):null,
      (!a.led||family==='bmw-2010') && a.stripes.length?marker(a):null,
      // Only verified cutout layers can supplement the base silhouette; some
      // other families' carbon sources include opaque rectangular backing.
      family.startsWith('porsche-')&&a.shape!=='yoke'?source(`cf/${a.shape}-glossy`)
        :((family==='audi-rs-2020'&&a.shape==='flat-flat')
          ||(family==='mercedes-2015'&&['flat-flat','yoke'].includes(a.shape)))
          ?source(`cf/${a.shape}-glossy`).then(layer=>gripLayer(layer,'top',a.shape)):null,
    ]);
    if(disposed)return null;
    const out=canvas(),ctx=out.getContext('2d');
    ctx.drawImage(base,0,0,SIZE,SIZE);
    // The 991 base contains its original carbon top at a different outline
    // from the selectable grip layers. Clear that rim before repainting it;
    // this also removes the small exposed carbon fragments on the 992.
    const porsche991FlatBottom=family==='porsche-991'&&a.shape==='flat-round';
    if(guide&&family.startsWith('porsche-')&&a.shape!=='yoke'&&!porsche991FlatBottom){ctx.clearRect(0,0,SIZE,SIZE*.28);ctx.clearRect(0,SIZE*.91,SIZE,SIZE*.09);}
    if(porsche991FlatBottom){
      // The source photograph carries a second marker at six o'clock. Fill
      // that narrow strip from the adjacent rim before applying the finish.
      ctx.drawImage(out,SIZE*.452,SIZE*.86,SIZE*.038,SIZE*.095,SIZE*.49,SIZE*.86,SIZE*.038,SIZE*.095);
    }
    // This is the reference's exact composition order. Lighten places the
    // paddles behind the wheel while retaining the source's black background.
    if(paddles){
      const paddleLayer=canvas(),pc=paddleLayer.getContext('2d');
      const height=a.magnetic&&a.longPaddles?SIZE*1.22:SIZE;
      pc.drawImage(paddles,0,(SIZE-height)/2,SIZE,height);
      if(a.magnetic){
        pc.globalCompositeOperation='destination-out';
        pc.drawImage(silhouette(a.shape,base,guide),0,0,SIZE,SIZE);
      }
      ctx.globalCompositeOperation='lighten';ctx.drawImage(paddleLayer,0,0);
      ctx.globalCompositeOperation='source-over';
    }
    const materials=canvas(),mc=materials.getContext('2d');
    if(porsche991FlatBottom){
      mc.drawImage(top,0,0,SIZE,SIZE);
      // Fit the finish to the photographed round top and flat bottom. Keep
      // the base silhouette as the final outline instead of the flatter map.
      mc.save();mc.beginPath();mc.rect(0,0,SIZE,SIZE*.32);mc.clip();
      mc.translate(0,SIZE*.32);mc.scale(1,1.14);mc.translate(0,-SIZE*.32);
      mc.drawImage(top,0,0,SIZE,SIZE);mc.restore();
      mc.save();mc.beginPath();mc.rect(0,SIZE*.76,SIZE,SIZE*.24);mc.clip();
      mc.translate(0,SIZE*.76);mc.scale(1,1.10);mc.translate(0,-SIZE*.76);
      mc.drawImage(top,0,0,SIZE,SIZE);mc.restore();
      mc.drawImage(side,0,0,SIZE,SIZE);
      [trim,cover,logo,dodgeTrim,dodgeLogo].filter(Boolean).forEach(layer=>mc.drawImage(layer,0,0,SIZE,SIZE));
    }else{
      [side,top,trim,cover,logo,dodgeTrim,dodgeLogo].filter(Boolean).forEach(layer=>mc.drawImage(layer,0,0,SIZE,SIZE));
    }
    if(family!=='bmw-gseries'&&family!=='bmw-2010'){mc.globalCompositeOperation='destination-in';mc.drawImage(silhouette(a.shape,base,porsche991FlatBottom?null:guide),0,0,SIZE,SIZE);}
    ctx.drawImage(materials,0,0,SIZE,SIZE);
    if(ring)ctx.drawImage(ring,0,0,SIZE,SIZE);
    if(a.led)drawLedDisplay(ctx,ledArtwork,rimLedPlacement(silhouette(a.shape,base,guide)));
    return out;
  }
  return {render,dispose(){disposed=true;assets.clear();layers.clear();silhouettes.clear();materialRenderer.invalidate();}};
}
