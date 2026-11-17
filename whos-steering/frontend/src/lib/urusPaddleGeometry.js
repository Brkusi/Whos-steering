import * as THREE from 'three';
import {URUS_OUTLINE,URUS_WINDOWS,urusFinish} from './urusPaddles';
export function urusPaddleShape(){
 const shape=new THREE.Shape();
 const trace=(path,points)=>{points.forEach(([x,y],i)=>i?path.lineTo((x-.5)*.078,(.5-y)*.275):path.moveTo((x-.5)*.078,(.5-y)*.275));path.closePath();};
 trace(shape,URUS_OUTLINE);URUS_WINDOWS.forEach(points=>{const hole=new THREE.Path();trace(hole,points);shape.holes.push(hole);});return shape;
}
export function createUrusPaddle(sign,textureMaps={}){
 const group=new THREE.Group();group.name='Urus_paddle';
 const material=new THREE.MeshBasicMaterial({color:'#18191b',toneMapped:false});
 const edge=new THREE.MeshStandardMaterial({color:'#242629',roughness:.32,metalness:.35,envMapIntensity:.35});
 const geometry=new THREE.ExtrudeGeometry(urusPaddleShape(),{depth:.004,bevelEnabled:true,bevelThickness:.0008,bevelSize:.0007,bevelSegments:3,curveSegments:18});
 const uv=geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/.078+.5,uv.getY(i)/.275+.5);
 const blade=new THREE.Mesh(geometry,[material,edge]);blade.name='Urus_blade';blade.position.set(.025,0,-.026);blade.scale.set(-.85,.85,1);group.add(blade);
 const black=new THREE.MeshStandardMaterial({color:'#121315',roughness:.5,metalness:.1});
 const housing=new THREE.Mesh(new THREE.BoxGeometry(.052,.06,.018),black);housing.name='Urus_enclosed_switch';housing.position.set(.005,-.003,-.014);group.add(housing);
 const mount=new THREE.Mesh(new THREE.BoxGeometry(.026,.038,.012),black);mount.position.set(0,0,-.002);mount.name='Urus_attachment';group.add(mount);
 const ink=new THREE.MeshStandardMaterial({color:'#f0f1f2',roughness:.25,metalness:.5});
 const symbols=new THREE.Group();symbols.name=sign>0?'Urus_plus':'Urus_minus';symbols.position.set(.0347,.0935,-.0205);symbols.scale.setScalar(.85);symbols.add(new THREE.Mesh(new THREE.BoxGeometry(.013,.002,.0006),ink));if(sign>0)symbols.add(new THREE.Mesh(new THREE.BoxGeometry(.002,.015,.0006),ink));group.add(symbols);
 return {group,update(name){const f=urusFinish(name);material.map=textureMaps[f.name]||null;material.color.set(material.map?'#ffffff':f.color);edge.color.set(f.carbon?'#26282a':f.color);edge.metalness=f.name==='Silver'?.8:.3;material.needsUpdate=true;}};
}
