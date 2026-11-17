import {addUrusPaddlesToCanvas} from '../lib/urusPaddleOverlay';
import {fitPreviewCanvas} from '../lib/previewFraming';
import PreviewZoom from './PreviewZoom';
import {useEffect,useRef} from 'react';
import {createLedArtwork,drawLedDisplay} from '../lib/ledDisplay';
export default function ReferenceWheelPreview({src,alt,style,led,config}) {
  const ref=useRef(null);
  useEffect(()=>{
    let active=true;const image=new Image();
    image.onload=async()=>{if(!active)return;const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
      const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);
      if(led){const texture=createLedArtwork(),w=image.width,h=image.height;
        const placements=(src.includes('audi-r8-front')||src.includes('configure-g-series-lci')) ? [[.27,.092,.46,.04,.035]] : src.includes('r8')
          ? [[.27,.166,.21,.039,.027],[.81,.558,.122,.017,.034]]
          : [[.27,.184,.21,.047,.018],[.554,.609,.137,.019,.034],[.801,.598,.13,.019,.035]];
        placements.forEach(([x,y,width,height,rise])=>drawLedDisplay(ctx,texture,{x:x*w,y:y*h,width:width*w,height:height*h,rise:rise*h}));
      }
      if(config?.paddleShifters==='Urus Style'){
        if(src.includes('audi-r8-front')){
          for(const sign of [-1,1]){ctx.save();ctx.translate(canvas.width/2,0);ctx.scale(sign,1);ctx.beginPath();[[.21,.30],[.285,.30],[.285,.455],[.18,.455]].forEach(([x,y],i)=>i?ctx.lineTo((x-.5)*canvas.width,y*canvas.height):ctx.moveTo((x-.5)*canvas.width,y*canvas.height));ctx.closePath();ctx.clip();ctx.clearRect(-canvas.width,0,canvas.width*2,canvas.height);ctx.restore();}
        }
        await addUrusPaddlesToCanvas(canvas,config);
      }
      if(active&&ref.current)fitPreviewCanvas(canvas,ref.current);
    };image.src=src;return()=>{active=false;};
  },[src,led,config?.paddleShifters,config?.urusPaddleColor]);
  return <PreviewZoom style={{...style,position:style?.position,aspectRatio:style?.height==='auto'?'3 / 2':undefined}}><canvas ref={ref} role="img" aria-label={alt} style={{width:'100%',height:'100%',objectFit:'contain'}}/></PreviewZoom>;
}
