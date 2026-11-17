import {urusActive,loadUrusTexture,makeUrusTexture,drawUrusPair} from './urusPaddles';
// Keep the photographed wheel in front of the added paddles. Source sets use
// either alpha or black backing, so build the occluder from their actual pixels.
export async function addUrusPaddlesToCanvas(canvas,config,placement,coverForeground){
 if(!urusActive(config))return;
 const image=await loadUrusTexture(config.urusPaddleColor),texture=makeUrusTexture(config.urusPaddleColor,image);
 const layer=document.createElement('canvas');layer.width=canvas.width;layer.height=canvas.height;
 const ctx=canvas.getContext('2d'),lc=layer.getContext('2d');
 drawUrusPair(lc,canvas,config.urusPaddleColor,texture,placement);
 const pixels=ctx.getImageData(0,0,canvas.width,canvas.height),mask=document.createElement('canvas');mask.width=canvas.width;mask.height=canvas.height;
 const opaqueBlack=pixels.data[3]>240 && Math.max(...pixels.data.slice(0,3))<16;
 for(let i=0;i<pixels.data.length;i+=4){const light=Math.max(pixels.data[i],pixels.data[i+1],pixels.data[i+2]);pixels.data[i+3]=opaqueBlack?Math.round(pixels.data[i+3]*Math.max(0,Math.min(1,(light-4)/12))):pixels.data[i+3];pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=255;}
 mask.getContext('2d').putImageData(pixels,0,0);
 lc.globalCompositeOperation='destination-out';
 lc.drawImage(mask,0,0);
 coverForeground?.(lc);
 ctx.drawImage(layer,0,0);
}
