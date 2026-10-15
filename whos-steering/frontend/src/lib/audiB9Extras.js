import { drawLedArtwork } from './ledDisplay';
import * as THREE from 'three';
import { createB9Paddles } from './audiB9Paddles';

// Optional catalog extras are separate objects. The approved source meshes
// remain unchanged; these are visual approximations, not source geometry.
export async function createB9Extras(root, parts) {
  const group = new THREE.Group(); group.name = 'WhosSteering_optional_extras'; root.add(group);
  const [honeycomb,paddleTexture,matteCarbon] = await Promise.all([
    new THREE.TextureLoader().loadAsync(`${process.env.PUBLIC_URL || ''}/HoneyComb.jpeg`),
    new THREE.TextureLoader().loadAsync(`${process.env.PUBLIC_URL || ''}/classic/classic-black.png`),
    new THREE.TextureLoader().loadAsync(`${process.env.PUBLIC_URL || ''}/matte-carbon-gseries.png`),
  ]);
  honeycomb.colorSpace = THREE.SRGBColorSpace; honeycomb.flipY = false;
  honeycomb.wrapS = honeycomb.wrapT = THREE.RepeatWrapping; honeycomb.repeat.set(4,4);
  paddleTexture.colorSpace=THREE.SRGBColorSpace;paddleTexture.wrapS=paddleTexture.wrapT=THREE.RepeatWrapping;
  matteCarbon.colorSpace=THREE.SRGBColorSpace;matteCarbon.flipY=false;
  matteCarbon.wrapS=matteCarbon.wrapT=THREE.RepeatWrapping;matteCarbon.repeat.set(8,8);
  const textures = [honeycomb,paddleTexture,matteCarbon];
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
  const ledMap=canvasMap(1536,160,drawLedArtwork);
  const led=add(ledGeometry,new THREE.MeshBasicMaterial({map:ledMap,side:THREE.DoubleSide}),'LED_display_preview',new THREE.Vector3());
  function update(appearance,sideNode) {
    led.visible=appearance.led;
    paddles.update(appearance,sideNode);
  }
  // Geometries/materials are disposed with the containing source model.
  return {honeycomb,matteCarbon,update,dispose:()=>textures.forEach(texture=>texture.dispose())};
}
