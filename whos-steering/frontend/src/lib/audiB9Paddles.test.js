import * as THREE from 'three';
import { createB9Paddles } from './audiB9Paddles';

test('paddles mirror their profiles and attach to the active rear surface',()=>{
  const parent=new THREE.Group();
  const rear=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));rear.position.z=-.07;rear.updateMatrixWorld(true);
  const sport=rear.clone();sport.position.z=-.09;sport.updateMatrixWorld(true);
  const paddles=createB9Paddles(parent,new Map([[5,{object:rear}],[36,{object:sport}]]),new THREE.Texture());
  paddles.update({magnetic:true,longPaddles:false},5);parent.updateMatrixWorld(true);
  const [left,right]=parent.children;
  expect(left.scale.x).toBe(-right.scale.x);
  for(const assembly of [left,right]){
    const contact=assembly.getObjectByName('Rear_surface_contact');
    const positions=contact.geometry.attributes.position;
    for(let i=0;i<4;i++)expect(new THREE.Vector3().fromBufferAttribute(positions,i).applyMatrix4(contact.matrixWorld).z).toBeCloseTo(-.07,6);
    const short=assembly.getObjectByName('Short_carbon_blade'),long=assembly.getObjectByName('Long_carbon_blade');
    const a=new THREE.Box3().setFromBufferAttribute(short.geometry.attributes.position).applyMatrix4(short.matrixWorld).getSize(new THREE.Vector3());
    const b=new THREE.Box3().setFromBufferAttribute(long.geometry.attributes.position).applyMatrix4(long.matrixWorld).getSize(new THREE.Vector3());
    expect(a.z).toBeLessThan(.004);expect(a.y).toBeLessThan(.21);expect(b.y).toBeGreaterThan(a.y);expect(b.y).toBeLessThan(.30);expect(b.x).toBeLessThan(.065);
    expect(short.visible).toBe(true);expect(long.visible).toBe(false);
  }
  paddles.update({magnetic:true,longPaddles:true},36);parent.updateMatrixWorld(true);
  expect(left.getObjectByName('Long_carbon_blade').visible).toBe(true);
  expect(left.userData.mountDepth).toBeCloseTo(-.091,6);
  paddles.update({magnetic:false,longPaddles:true},36);expect(parent.children.every(o=>!o.visible)).toBe(true);
});
