import * as THREE from 'three';
import {
 URUS_OUTLINE, URUS_WINDOWS, URUS_TIP_PANELS, URUS_SWITCH,
 URUS_SWITCH_COVER, URUS_MARK_CENTER, urusFinish
} from './urusPaddles';

const height=.275, width=height*214/613;
const localX=x=>(x-.5)*width;
const localY=y=>(.5-y)*height;

function trace(path,points){
 points.forEach(([x,y],i)=>i?path.lineTo(localX(x),localY(y)):path.moveTo(localX(x),localY(y)));
 path.closePath();
 return path;
}

export function urusPaddleShape(){
 const shape=trace(new THREE.Shape(),URUS_OUTLINE);
 shape.holes=URUS_WINDOWS.map(points=>trace(new THREE.Path(),points));
 return shape;
}

export function createUrusPaddle(sign,textureMaps={}){
 const group=new THREE.Group();group.name='Urus_paddle';
 const face=new THREE.MeshBasicMaterial({color:'#18191b',toneMapped:false});
 const edge=new THREE.MeshStandardMaterial({color:'#242629',roughness:.32,metalness:.35});
 const bladeDepth=.004;
 const geometry=new THREE.ExtrudeGeometry(urusPaddleShape(),{depth:bladeDepth,bevelEnabled:true,bevelThickness:.0008,bevelSize:.0007,bevelSegments:3});
 const uv=geometry.attributes.uv;
 for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/width+.5,uv.getY(i)/height+.5);
 const blade=new THREE.Mesh(geometry,[face,edge]);blade.name='Urus_blade';
 blade.position.set(.025,0,-.026);blade.scale.set(-.85,.85,1);group.add(blade);
 const black=new THREE.MeshStandardMaterial({color:'#17181a',roughness:.52,metalness:.12});
 const cover=new THREE.MeshStandardMaterial({color:'#303033',roughness:.56});
 const ink=new THREE.MeshBasicMaterial({color:'#55565a',toneMapped:false});
 function plate(name,points,z,depth,material){
  const shape=trace(new THREE.Shape(),points);
  const mesh=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false}),material);
  const uv=mesh.geometry.attributes.uv;
  for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/width+.5,uv.getY(i)/height+.5);
  mesh.name=name;mesh.position.z=z;blade.add(mesh);return mesh;
 }
 // The switch and the molded tip recesses are on the side facing the wheel.
 // Oblique rear views show a continuous beveled blade around the windows.
 for(const points of URUS_TIP_PANELS){
  plate('Urus_tip_recess',points,.00485,.00045,black);
  const cx=points.reduce((sum,p)=>sum+p[0],0)/points.length;
  const cy=points.reduce((sum,p)=>sum+p[1],0)/points.length;
  plate('Urus_tip_inset',points.map(([x,y])=>[cx+(x-cx)*.86,cy+(y-cy)*.90]),.00531,.0002,face);
 }
 plate('Urus_enclosed_switch',URUS_SWITCH,bladeDepth,.014,black);
 plate('Urus_switch_cover',URUS_SWITCH_COVER,.018,.0018,cover);
 const socket=new THREE.Mesh(new THREE.CylinderGeometry(.006,.006,.001,20),black);
 socket.rotation.x=Math.PI/2;socket.position.set(localX(.46),localY(.51),.020);blade.add(socket);
 const mount=new THREE.Mesh(new THREE.BoxGeometry(.026,.038,.012),black);
 mount.position.set(.01,0,-.002);mount.name='Urus_attachment';group.add(mount);
 const symbols=new THREE.Group();symbols.name=sign>0?'Urus_plus':'Urus_minus';
 symbols.position.set(localX(URUS_MARK_CENTER[0]),localY(URUS_MARK_CENTER[1]),.006);
 symbols.add(new THREE.Mesh(new THREE.BoxGeometry(width*.118,height*.0076,.0005),ink));
 if(sign>0)symbols.add(new THREE.Mesh(new THREE.BoxGeometry(width*.024,height*.042,.0005),ink));
 blade.add(symbols);
 return {group,update(name){
  const f=urusFinish(name);
  face.map=textureMaps[f.name]||null;face.color.set(face.map?'#ffffff':f.color);
  edge.color.set(f.carbon?'#26282a':f.color);edge.metalness=f.name==='Silver'?.8:.3;
  ink.color.set(f.name==='Black'?'#55565a':f.name==='Silver'?'#313438':'#f3f3f3');
  face.needsUpdate=true;
 }};
}
