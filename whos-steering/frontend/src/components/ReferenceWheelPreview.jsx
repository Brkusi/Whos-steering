import {useEffect,useRef} from 'react';
import {createLedArtwork,drawLedDisplay} from '../lib/ledDisplay';
export default function ReferenceWheelPreview({src,alt,style,led,matte}) {
  const ref=useRef(null);
  useEffect(()=>{
    let active=true;const image=new Image();
    image.onload=async()=>{if(!active)return;const canvas=ref.current;canvas.width=image.width;canvas.height=image.height;
      const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);
      if(matte){
        const texture=new Image();
        await new Promise((resolve,reject)=>{texture.onload=resolve;texture.onerror=reject;texture.src='/matte-carbon-gseries.png';}).catch(()=>null);
        if(!texture.width)return;
        if(!active)return;
        // Show the complete wheel from the existing reference, with the matte
        // source weave applied only to its upper and lower grip surfaces.
        const crop=src.includes('r8')?[.752,.538,.242,.394]:[.501,.591,.236,.331];
        canvas.width=canvas.height=1024;
        ctx.drawImage(image,crop[0]*image.width,crop[1]*image.height,crop[2]*image.width,crop[3]*image.height,0,0,1024,1024);
        const tile=document.createElement('canvas');tile.width=tile.height=96;const tc=tile.getContext('2d');tc.drawImage(texture,0,0,96,96);
        const pattern=tc.getImageData(0,0,96,96).data,pixels=ctx.getImageData(0,0,1024,1024),p=pixels.data;
        for(let y=0;y<1024;y++)for(let x=0;x<1024;x++){
          const nx=x/1024,ny=y/1024;
          if(!((ny<.23&&nx>.18&&nx<.82)||(ny>.84&&nx>.22&&nx<.78)))continue;
          const i=(y*1024+x)*4,luma=(p[i]+p[i+1]+p[i+2])/3;
          if(luma<12)continue;
          const j=((y%96)*96+x%96)*4,gain=.55+Math.min(luma,150)/180;
          for(let k=0;k<3;k++)p[i+k]=Math.min(170,pattern[j+k]*gain);
        }
        ctx.putImageData(pixels,0,0);
        if(led)drawLedDisplay(ctx,createLedArtwork(),{x:290,y:50,width:444,height:43,rise:80});
        return;
      }
      if(led){const texture=createLedArtwork(),w=image.width,h=image.height;
        const placements=src.includes('r8')
          ? [[.27,.166,.21,.039,.027],[.81,.558,.122,.017,.034]]
          : [[.27,.184,.21,.047,.018],[.554,.609,.137,.019,.034],[.801,.598,.13,.019,.035]];
        placements.forEach(([x,y,width,height,rise])=>drawLedDisplay(ctx,texture,{x:x*w,y:y*h,width:width*w,height:height*h,rise:rise*h}));
      }
    };image.src=src;return()=>{active=false;};
  },[src,led,matte]);
  return <canvas ref={ref} role="img" aria-label={alt} style={style}/>;
}
