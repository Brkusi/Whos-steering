// Trace coordinates from the driver-left paddle in the black-pair photograph.
// Keeping one trace lets the canvas and mesh mirror the exact same part.
const trace = points => points.map(([x,y]) => [(x-29)/214,(y-12)/613]);
export const URUS_OUTLINE = trace([
 [29,239],[31,221],[45,174],[91,44],[96,35],[133,14],[140,12],[146,14],
 [173,36],[177,42],[178,50],[174,130],[175,136],[222,199],[231,214],[234,226],
 [243,410],[242,422],[238,432],[195,496],[192,502],[192,510],[205,585],[204,592],
 [199,599],[173,623],[167,625],[160,624],[119,608],[113,603],[107,591],
 [47,452],[38,430],[35,415]
]);
export const URUS_WINDOWS = [
 trace([[101,139],[106,132],[132,124],[138,125],[141,129],[142,146],[146,157],
  [171,207],[177,223],[179,248],[127,252],[123,249],[101,184],[97,167],[97,155]]),
 trace([[124,420],[129,414],[141,411],[176,409],[182,411],[185,416],[185,423],
  [160,481],[157,490],[158,509],[155,516],[150,518],[120,513],[116,509],[111,490],[111,477]])
];
export const URUS_TIP_PANELS = [
 trace([[101,124],[113,56],[118,50],[137,39],[143,40],[153,50],[145,122],[137,115],[130,115]]),
 trace([[114,515],[123,519],[151,522],[159,516],[177,581],[175,588],[168,595],[137,584]])
];
export const URUS_SWITCH = trace([[79,276],[82,266],[90,260],[192,251],[202,252],
 [210,260],[216,390],[213,401],[94,405],[85,399],[81,391]]);
export const URUS_SWITCH_COVER = trace([[88,284],[98,272],[185,264],[198,273],
 [202,283],[208,388],[202,393],[99,397],[92,391]]);
export const URUS_MARK_CENTER = trace([[131,72]])[0];
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
 function panel(points,fill,edge){
  ctx.beginPath();polygon(ctx,points);ctx.fillStyle=fill;ctx.fill();
  ctx.strokeStyle=edge;ctx.lineWidth=.012;ctx.stroke();
 }
 for(const points of URUS_TIP_PANELS)panel(points,'rgba(0,0,0,.12)','rgba(0,0,0,.58)');
 panel(URUS_SWITCH,'#17181a','#48494a');
 panel(URUS_SWITCH_COVER,'#303033','#101012');
 ctx.fillStyle='#121214';ctx.beginPath();ctx.ellipse(.46,.51,.068,.023,0,0,2*Math.PI);ctx.fill();
 ctx.fillRect(.64,.50,.08,.014);ctx.fillRect(.43,.58,.044,.028);
 const [mx,my]=URUS_MARK_CENTER;
 ctx.fillStyle=f.name==='Black'?'#55565a':f.name==='Silver'?'#313438':'#f3f3f3';
 ctx.fillRect(mx-.059,my-.0038,.118,.0076);if(sign>0)ctx.fillRect(mx-.012,my-.021,.024,.042);
 ctx.restore();
}
// The source photograph's wheel/spokes mask the central housing in front view.
export function drawUrusPair(ctx,size,finish,texture,placement={}){
 const width=size*(placement.width||.1225),height=size*(placement.height||.35),y=size*(placement.y||.49),spread=size*(placement.spread||.245);
 for(const sign of [-1,1])drawUrusBlade(ctx,{x:size*.5+sign*spread,y,width,height,sign,finish,texture});
}
