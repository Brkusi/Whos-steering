import {applyReferenceFinishes} from '../lib/referenceFinishes';
import {addUrusPaddlesToCanvas} from '../lib/urusPaddleOverlay';
import {fitPreviewCanvas} from '../lib/previewFraming';
import PreviewZoom from './PreviewZoom';
import {useEffect,useRef} from 'react';
import {createLedArtwork,drawLedDisplay} from '../lib/ledDisplay';
// Trace the exposed stock paddle tips in the two front photographs.
const stockPaddleTips = {
  r8: [
    [[88,151],[105,128],[127,126],[130,139],[115,158],[105,188],[74,199],[65,190]],
    [[76,252],[93,252],[106,270],[111,290],[107,301],[93,297],[76,280]],
  ],
  lci: [
    [[112,221],[124,192],[136,176],[145,176],[148,190],[141,218]],
    [[103,296],[127,300],[139,313],[134,328],[120,328],[110,317]],
  ],
};

function clearStockPaddles(ctx, photo) {
  const {width,height}=ctx.canvas;
  const referenceHeight=photo==='r8'?415:460;
  for(const sign of [-1,1]){
    for(const tip of stockPaddleTips[photo]){
      ctx.beginPath();
      tip.forEach(([x,y],i)=>{
        const px=width*(.5+sign*(x/460-.5));
        const py=height*y/referenceHeight;
        if(i===0)ctx.moveTo(px,py);
        else ctx.lineTo(px,py);
      });
      ctx.closePath();
      ctx.save();
      ctx.clip();
      ctx.clearRect(0,0,width,height);
      ctx.restore();
    }
  }
}

export default function ReferenceWheelPreview({src,alt,style,led,config}) {
  const ref=useRef(null);
  const gripColor=config?.topBottomCustomColor || (config?.topBottomMat?.includes('Carbon') ? config?.topBottomCarbonCol : config?.topBottomCol);
  const coverColor=config?.airbagCompat && (config.airbagCustomColor || config.airbagCol);
  useEffect(()=>{
    let active=true;const image=new Image();
    image.onload=async()=>{if(!active)return;const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
      const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);
      if(src.includes('audi-r8-front') || src.includes('configure-g-series-lci')){
        applyReferenceFinishes(ctx,src.includes('audi-r8-front')?'r8':'lci',gripColor,coverColor);
      }
      if(led){const texture=createLedArtwork(),w=image.width,h=image.height;
        const placements=(src.includes('audi-r8-front')||src.includes('configure-g-series-lci')) ? [[.27,.092,.46,.04,.035]] : src.includes('r8')
          ? [[.27,.166,.21,.039,.027],[.81,.558,.122,.017,.034]]
          : [[.27,.184,.21,.047,.018],[.554,.609,.137,.019,.034],[.801,.598,.13,.019,.035]];
        placements.forEach(([x,y,width,height,rise])=>drawLedDisplay(ctx,texture,{x:x*w,y:y*h,width:width*w,height:height*h,rise:rise*h}));
      }
      if(['Urus Style','Magnetic'].includes(config?.paddleShifters)){
        const photo=src.includes('audi-r8-front')?'r8':'lci';
        clearStockPaddles(ctx,photo);
        if(config.paddleShifters==='Magnetic'){
          const pair=new Image();pair.src=config.paddleLength==='Long'?'/magnetic-long.svg':'/magnetic-short.svg';
          await pair.decode().catch(()=>{});ctx.globalCompositeOperation='destination-over';
          if(pair.naturalWidth)ctx.drawImage(pair,0,0,canvas.width,canvas.height);
        }else await addUrusPaddlesToCanvas(canvas,config,{y:.52,spread:.25}).catch(()=>{});
      }
      if(active&&ref.current)fitPreviewCanvas(canvas,ref.current);
    };image.src=src;return()=>{active=false;};
  },[src,led,gripColor,coverColor,config?.paddleShifters,config?.urusPaddleColor,config?.paddleLength]);
  return <PreviewZoom style={{...style,position:style?.position,aspectRatio:style?.height==='auto'?'3 / 2':undefined}}><canvas ref={ref} role="img" aria-label={alt} style={{width:'100%',height:'100%',objectFit:'contain'}}/></PreviewZoom>;
}
