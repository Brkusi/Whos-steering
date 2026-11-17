// Urus blade outline traced from the supplied front/back and installed Audi
// photographs: angular tips, two open windows, and a covered central switch.
// Loose-paddle photographs show the rear; flip each blade for the mounted
// driver-facing view. Shared normalized paths keep 2D previews and the extruded 3D blades aligned.
export const URUS_OUTLINE = [[.17,.02],[.39,0],[.56,.08],[.54,.20],[.58,.26],[.91,.39],[.99,.46],[1,.69],[.94,.79],[.67,.98],[.47,1],[.34,.94],[.33,.86],[.14,.73],[.07,.61],[.05,.40],[.12,.25],[.14,.10]];
export const URUS_WINDOWS = [
 [[.31,.18],[.40,.17],[.43,.23],[.42,.28],[.67,.39],[.65,.43],[.37,.42],[.27,.33]],
 [[.35,.72],[.60,.73],[.66,.77],[.51,.88],[.44,.90],[.42,.84],[.29,.76]],
];
export const URUS_FINISHES = [
 {name:'Red',color:'#c41c20'}, {name:'Blue',color:'#165fc4'}, {name:'Yellow',color:'#e8b800'},
 {name:'Black',color:'#18191b'}, {name:'Silver',color:'#b7bdc5'}, {name:'Green',color:'#23843d'},
 {name:'Carbon Fiber',color:'#252629',texture:'/classic/classic-black.png',carbon:true},
 {name:'Red Carbon Fiber',color:'#640b11',texture:'/classic/classic-black-red.png',carbon:true},
 {name:'Forged Carbon Fiber',color:'#242527',texture:'/forged/forged-classic.jpeg',carbon:true,forged:true},
 {name:'Red Forged Carbon Fiber',color:'#6e0000',texture:'/forged/forged-classic.jpeg',carbon:true,forged:true,accent:'#d42831'},
 {name:'Blue Forged Carbon Fiber',color:'#102641',texture:'/forged/forged-classic.jpeg',carbon:true,forged:true,accent:'#167de1'},
];
export const urusFinish = name => URUS_FINISHES.find(f=>f.name===name) || URUS_FINISHES[3];
export const urusActive = config => config.brand === 'AUDI' && config.paddleShifters === 'Urus Style';
function polygon(ctx,points){points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();}
export function urusCanvasPath(ctx){ctx.beginPath();polygon(ctx,URUS_OUTLINE);URUS_WINDOWS.forEach(points=>polygon(ctx,points));}
const textures = new Map();
export function loadUrusTexture(finish){
 const f=urusFinish(finish);if(!f.texture)return Promise.resolve(null);
 if(!textures.has(f.texture))textures.set(f.texture,new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>{textures.delete(f.texture);reject(new Error('Unable to load paddle finish'));};img.src=(process.env.PUBLIC_URL||'')+f.texture;}));
 return textures.get(f.texture);
}
export function makeUrusTexture(finish,image,size=256){
 const f=urusFinish(finish),c=document.createElement('canvas');c.width=c.height=size;const ctx=c.getContext('2d');
 ctx.fillStyle=f.color;ctx.fillRect(0,0,size,size);
 if(image){
  // More repeats reveal a finer weave/chip pattern on the long narrow blades.
  // This map is shared by paddle thumbnails, 2D overlays and the 3D faces.
  const columns=2,rows=6;
  for(let y=0;y<rows;y++)for(let x=0;x<columns;x++)ctx.drawImage(image,x*size/columns,y*size/rows,size/columns,size/rows);
  if(f.accent){
   // The references show colored chips against black resin, not a solid tint.
   const pixels=ctx.getImageData(0,0,size,size),rgb=[1,3,5].map(i=>parseInt(f.accent.slice(i,i+2),16));
   for(let i=0;i<pixels.data.length;i+=4){const light=pixels.data[i]*.21+pixels.data[i+1]*.72+pixels.data[i+2]*.07;const chip=Math.pow(Math.max(0,(light-38)/217),1.1);for(let n=0;n<3;n++)pixels.data[i+n]=Math.round(10+rgb[n]*chip);}
   ctx.putImageData(pixels,0,0);
  }
 }
 return c;
}
export function drawUrusBlade(ctx,{x,y,width,height,sign=1,finish='Black',texture}){
 const f=urusFinish(finish);ctx.save();ctx.translate(x,y);ctx.scale(-sign*width,height);ctx.translate(-.5,-.5);
 ctx.save();urusCanvasPath(ctx);ctx.clip('evenodd');
 ctx.fillStyle=f.color;ctx.fillRect(0,0,1,1);
 if(texture)ctx.drawImage(texture,0,0,1,1);
 const sheen=ctx.createLinearGradient(0,0,1,.6);sheen.addColorStop(0,'#ffffff44');sheen.addColorStop(.25,'#ffffff0a');sheen.addColorStop(.5,'#00000022');sheen.addColorStop(.8,'#ffffff44');sheen.addColorStop(1,'#00000066');ctx.fillStyle=sheen;ctx.fillRect(0,0,1,1);ctx.restore();
 urusCanvasPath(ctx);ctx.strokeStyle=f.carbon?'#999a9c':'#777b80';ctx.lineWidth=.012;ctx.stroke();
 ctx.fillStyle=f.name==='Black'?'#a3a6aa':'#f1f2f4';ctx.fillRect(.28,.09,.17,.019);if(sign>0)ctx.fillRect(.354,.055,.022,.09);
 ctx.restore();
}
// The source photograph's wheel/spokes mask the central housing in front view.
export function drawUrusPair(ctx,size,finish,texture,placement={}){
 const width=size*(placement.width||.092),height=size*(placement.height||.35),y=size*(placement.y||.49),spread=size*(placement.spread||.245);
 for(const sign of [-1,1])drawUrusBlade(ctx,{x:size*.5+sign*spread,y,width,height,sign,finish,texture});
}
