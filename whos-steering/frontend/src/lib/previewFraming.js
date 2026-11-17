// Trim source-canvas margins only; retain the full visible wheel and paddles.
export function previewBounds(pixels,width,height){
 let left=width,top=height,right=-1,bottom=-1;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){const i=(y*width+x)*4;if(pixels[i+3]>20&&Math.max(pixels[i],pixels[i+1],pixels[i+2])>18){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}}
 if(right<left)return {x:0,y:0,width,height};
 const pad=Math.ceil(Math.max(right-left,bottom-top)*.025);left=Math.max(0,left-pad);top=Math.max(0,top-pad);right=Math.min(width-1,right+pad);bottom=Math.min(height-1,bottom+pad);
 return {x:left,y:top,width:right-left+1,height:bottom-top+1};
}
export function fitPreviewCanvas(source,target=source){
 const ctx=source.getContext('2d'),box=previewBounds(ctx.getImageData(0,0,source.width,source.height).data,source.width,source.height);
 const copy=document.createElement('canvas');copy.width=box.width;copy.height=box.height;copy.getContext('2d').drawImage(source,box.x,box.y,box.width,box.height,0,0,box.width,box.height);
 target.width=box.width;target.height=box.height;target.getContext('2d').drawImage(copy,0,0);return target;
}
