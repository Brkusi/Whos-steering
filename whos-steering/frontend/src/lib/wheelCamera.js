import * as THREE from 'three';
export function frontViewDistance(size,aspect,fov=45,padding=1.08){
 const tangent=Math.tan(fov*Math.PI/360);
 return Math.max(size.y/(2*tangent),size.x/(2*tangent*Math.max(.1,aspect)))*padding+size.z/2;
}
export function visibleWheelFraming(root,aspect,fov=45,padding=1.045){
 root.updateMatrixWorld(true);const bounds=new THREE.Box3(),meshes=[];
 root.traverseVisible(mesh=>{if(!mesh.isMesh||!(Array.isArray(mesh.material)?mesh.material.some(m=>m.visible):mesh.material.visible))return;if(!mesh.geometry.boundingBox)mesh.geometry.computeBoundingBox();bounds.union(mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld));meshes.push(mesh);});
 if(bounds.isEmpty())return null;
 const target=bounds.getCenter(new THREE.Vector3()),point=new THREE.Vector3(),tangent=Math.tan(fov*Math.PI/360);let distance=0;
 for(const mesh of meshes){const positions=mesh.geometry.attributes.position;for(let i=0;i<positions.count;i++){point.fromBufferAttribute(positions,i).applyMatrix4(mesh.matrixWorld).sub(target);distance=Math.max(distance,point.z+Math.abs(point.y)*padding/tangent,point.z+Math.abs(point.x)*padding/(tangent*Math.max(.1,aspect)));}}
 return {target,distance};
}
