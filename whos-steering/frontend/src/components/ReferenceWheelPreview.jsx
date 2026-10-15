import {useEffect,useRef} from 'react';
import {createLedArtwork,drawLedDisplay} from '../lib/ledDisplay';
export default function ReferenceWheelPreview({src,alt,style,led}) {
  const ref=useRef(null);
  useEffect(()=>{
    let active=true;const image=new Image();
    image.onload=()=>{if(!active)return;const canvas=ref.current;canvas.width=image.width;canvas.height=image.height;
      const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);
      if(led){const texture=createLedArtwork(),w=image.width,h=image.height;
        const placements=src.includes('r8')
          ? [[.27,.166,.21,.039,.027],[.81,.558,.122,.017,.034]]
          : [[.27,.184,.21,.047,.018],[.554,.609,.137,.019,.034],[.801,.598,.13,.019,.035]];
        placements.forEach(([x,y,width,height,rise])=>drawLedDisplay(ctx,texture,{x:x*w,y:y*h,width:width*w,height:height*h,rise:rise*h}));
      }
    };image.src=src;return()=>{active=false;};
  },[src,led]);
  return <canvas ref={ref} role="img" aria-label={alt} style={style}/>;
}
