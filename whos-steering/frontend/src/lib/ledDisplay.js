// Shared artwork for the B9 3D texture and every 2D LED preview.
export function drawLedArtwork(ctx,w=1536,h=160) {
    ctx.fillStyle='#090a0c';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#36383b';ctx.lineWidth=5;ctx.strokeRect(2,2,w-4,h-4);
    ctx.fillStyle='#202a38';ctx.fillRect(612,12,312,136);ctx.font='36px Arial';ctx.fillStyle='#e6edf5';ctx.textAlign='center';ctx.fillText('3000 rpm',768,66);ctx.font='29px Arial';ctx.fillText('80 km/h',768,114);
    for(let i=0;i<8;i++)for(const sign of [-1,1]){const distance=190+i*59,x=w/2+sign*distance-22;ctx.fillStyle=i<2?'#e52623':i<5?'#f6c524':'#35df65';ctx.fillRect(x,45,40,66);}
}
export function createLedArtwork() {
  const canvas=document.createElement('canvas');canvas.width=1536;canvas.height=160;
  drawLedArtwork(canvas.getContext('2d'),1536,160);return canvas;
}
// Bend the same B9 artwork along the upper rim without changing its details.
export function drawLedDisplay(ctx,texture,{x,y,width,height,rise=0}) {
  const slices=384;
  for(let i=0;i<slices;i++) {
    const t=(i+.5)/slices,drop=rise*(2*t-1)**2;
    ctx.drawImage(texture,i*texture.width/slices,0,texture.width/slices,texture.height,
      x+i*width/slices,y+drop,width/slices+.5,height);
  }
}
export function rimLedPlacement(mask) {
  const size=mask.width,ctx=mask.getContext('2d'),data=ctx.getImageData(0,0,size,size).data;
  function rimCenter(fraction) {
    const x=Math.round(size*fraction);let first=-1;
    for(let y=Math.round(size*.025);y<size*.38;y++) {
      const visible=data[(y*size+x)*4+3]>180;
      if(visible && first<0)first=y;
      if(!visible && first>=0) {if(y-first>size*.015)return (first+y)/2;first=-1;}
    }
    return size*.13;
  }
  const center=rimCenter(.5),edge=(rimCenter(.28)+rimCenter(.72))/2;
  return {x:size*.28,y:center-size*.021,width:size*.44,height:size*.042,rise:Math.max(0,edge-center)};
}
