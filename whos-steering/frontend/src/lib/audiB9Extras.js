import * as THREE from 'three';
import { createB9Paddles } from './audiB9Paddles';

// Optional catalog extras are separate objects. The approved source meshes
// remain unchanged; these are visual approximations, not source geometry.
export async function createB9Extras(root, parts) {
  const group = new THREE.Group(); group.name = 'WhosSteering_optional_extras'; root.add(group);
  const [honeycomb,paddleTexture] = await Promise.all([
    new THREE.TextureLoader().loadAsync(`${process.env.PUBLIC_URL || ''}/HoneyComb.jpeg`),
    new THREE.TextureLoader().loadAsync(`${process.env.PUBLIC_URL || ''}/classic/classic-black.png`),
  ]);
  honeycomb.colorSpace = THREE.SRGBColorSpace; honeycomb.flipY = false;
  honeycomb.wrapS = honeycomb.wrapT = THREE.RepeatWrapping; honeycomb.repeat.set(4,4);
  paddleTexture.colorSpace=THREE.SRGBColorSpace;paddleTexture.wrapS=paddleTexture.wrapT=THREE.RepeatWrapping;
  const textures = [honeycomb,paddleTexture];
  function canvasMap(width, height, draw) {
    const canvas = document.createElement('canvas'); canvas.width=width; canvas.height=height;
    draw(canvas.getContext('2d'), width, height);
    const map = new THREE.CanvasTexture(canvas); map.colorSpace=THREE.SRGBColorSpace; textures.push(map);return map;
  }
  function add(geometry, material, name, position) {
    const mesh=new THREE.Mesh(geometry,material);mesh.name=name;mesh.position.copy(position);group.add(mesh);return mesh;
  }
  const paddles=createB9Paddles(group,parts,paddleTexture);
  const top=parts.get(15).object, bounds=new THREE.Box3().setFromObject(top), centerX=(bounds.min.x+bounds.max.x)/2;
  const ray=new THREE.Raycaster(), positions=[], uv=[], index=[];
  for(let i=0;i<=48;i++){
    const x=(i/48-.5)*.46, y=bounds.max.y-.029-.355*(1-Math.sqrt(1-(x/.365)**2));
    ray.set(new THREE.Vector3(centerX+x,y,1),new THREE.Vector3(0,0,-1));
    const centerDepth=ray.intersectObject(top,false)[0]?.point.z??.08;
    for(let j=0;j<2;j++){
      const py=y+(j-.5)*.033;ray.set(new THREE.Vector3(centerX+x,py,1),new THREE.Vector3(0,0,-1));
      const hit=ray.intersectObject(top,false)[0];positions.push(centerX+x,py,Math.max(hit?.point.z??.08,centerDepth)+.006);uv.push(i/48,j);
    }
    if(i<48){const k=i*2;index.push(k,k+2,k+1,k+1,k+2,k+3);}
  }
  const ledGeometry=new THREE.BufferGeometry();ledGeometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));ledGeometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));ledGeometry.setIndex(index);ledGeometry.computeVertexNormals();
  const ledMap=canvasMap(1536,160,(ctx,w,h)=>{
    ctx.fillStyle='#090a0c';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#36383b';ctx.lineWidth=5;ctx.strokeRect(2,2,w-4,h-4);
    ctx.fillStyle='#202a38';ctx.fillRect(612,12,312,136);ctx.font='36px Arial';ctx.fillStyle='#e6edf5';ctx.textAlign='center';ctx.fillText('3000 rpm',768,66);ctx.font='29px Arial';ctx.fillText('80 km/h',768,114);
    for(let i=0;i<8;i++)for(const sign of [-1,1]){const distance=190+i*59,x=w/2+sign*distance-22;ctx.fillStyle=i<2?'#e52623':i<5?'#f6c524':'#35df65';ctx.fillRect(x,45,40,66);}
  });
  const led=add(ledGeometry,new THREE.MeshBasicMaterial({map:ledMap,side:THREE.DoubleSide}),'LED_display_preview',new THREE.Vector3());
  function update(appearance,sideNode) {
    led.visible=appearance.led;
    paddles.update(appearance,sideNode);
  }
  // Geometries/materials are disposed with the containing source model.
  return {honeycomb,update,dispose:()=>textures.forEach(texture=>texture.dispose())};
}
