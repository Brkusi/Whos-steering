import * as THREE from 'three';

// Profiles traced from the supplied short/long photographs. X points outward
// from the magnetic housing; the opposite assembly is an exact mirror.
function bladeProfile(long) {
  const s = new THREE.Shape();
  if (long) {
    s.moveTo(-.013,.151);
    s.bezierCurveTo(.008,.146,.035,.128,.042,.096);
    s.bezierCurveTo(.058,.047,.062,-.016,.049,-.063);
    s.bezierCurveTo(.039,-.101,.010,-.124,-.021,-.13);
    s.quadraticCurveTo(-.027,-.13,-.023,-.114);
    s.lineTo(-.02,-.093);
    s.bezierCurveTo(-.018,-.086,-.005,-.087,.002,-.071);
    s.bezierCurveTo(.009,-.025,.009,.052,.006,.087);
    s.bezierCurveTo(.005,.100,-.012,.098,-.016,.118);
    s.quadraticCurveTo(-.024,.15,-.013,.151);
    const hole = points => { const h=new THREE.Path(); points.forEach(([x,y],i)=>i?h.lineTo(x,y):h.moveTo(x,y)); h.closePath(); s.holes.push(h); };
    hole([[.011,.086],[.015,.092],[.029,.087],[.036,.059],[.033,.056],[.012,.059]]);
    hole([[.013,.05],[.036,.047],[.04,.022],[.037,.019],[.014,.022]]);
    const lower=new THREE.Path();lower.moveTo(.023,-.072);lower.bezierCurveTo(.016,-.089,.004,-.103,-.011,-.11);lower.lineTo(-.012,-.098);lower.bezierCurveTo(.0,-.091,.005,-.087,.01,-.074);lower.closePath();s.holes.push(lower);
  } else {
    s.moveTo(-.013,.101);
    s.bezierCurveTo(.012,.098,.031,.084,.037,.059);
    s.bezierCurveTo(.051,.016,.049,-.041,.037,-.073);
    s.quadraticCurveTo(.006,-.079,-.015,-.077);
    s.quadraticCurveTo(-.03,-.071,-.015,-.061);
    s.lineTo(-.004,-.052);s.lineTo(-.005,.039);s.lineTo(-.025,.048);
    s.quadraticCurveTo(-.03,.051,-.025,.065);s.lineTo(-.018,.096);s.quadraticCurveTo(-.017,.102,-.013,.101);
  }
  s.closePath(); return s;
}

function plate(shape, depth, material, name) {
  const geometry=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelThickness:.0006,bevelSize:.0007,bevelSegments:3,curveSegments:20,steps:1});
  const uv=geometry.getAttribute('uv'); for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*7,uv.getY(i)*7);
  const mesh=new THREE.Mesh(geometry,material);mesh.name=name;return mesh;
}

export function createB9Paddles(parent, parts, carbonTexture) {
  const carbon=new THREE.MeshStandardMaterial({map:carbonTexture,color:'#999999',roughness:.32,metalness:.15});
  const black=new THREE.MeshStandardMaterial({color:'#17191b',roughness:.32,metalness:.65});
  const magnet=new THREE.MeshStandardMaterial({color:'#aaa99d',roughness:.28,metalness:.88});
  const ink=new THREE.MeshStandardMaterial({color:'#050505',roughness:.7});
  const ray=new THREE.Raycaster();
  function surface(object,x,y) {
    ray.set(new THREE.Vector3(x,y,-1),new THREE.Vector3(0,0,1));
    return ray.intersectObject(object,true)[0]?.point.z;
  }
  const assemblies=[-1,1].map(sign=>{
    const group=new THREE.Group();group.name=`Magnetic_paddle_${sign<0?'left':'right'}`;parent.add(group);
    group.position.set(-.012138549+sign*.164,.373,0);group.scale.x=sign;
    const variants=[false,true].map(long=>{
      const blade=plate(bladeProfile(long),.0024,carbon,long?'Long_carbon_blade':'Short_carbon_blade');
      blade.scale.x=.72;blade.position.set(.026,0,-.021);group.add(blade);
      // The gear symbols are part of the paddle, never branding on the housing.
      const mark=new THREE.Group();mark.position.set(.007,long?.13:.086,-.001);blade.add(mark);
      const minus=new THREE.Mesh(new THREE.BoxGeometry(.012,.0027,.0005),ink);mark.add(minus);
      if(sign>0){const plus=new THREE.Mesh(new THREE.BoxGeometry(.0027,.012,.0005),ink);mark.add(plus);}
      return blade;
    });
    const outline=new THREE.Shape();outline.moveTo(-.031,-.031);outline.quadraticCurveTo(-.035,-.03,-.035,-.025);outline.lineTo(-.035,.025);outline.quadraticCurveTo(-.035,.032,-.028,.032);outline.lineTo(.029,.028);outline.quadraticCurveTo(.034,.028,.034,.021);outline.lineTo(.034,-.024);outline.quadraticCurveTo(.034,-.031,.027,-.031);outline.closePath();
    const housing=plate(outline,.014,black,'Unbranded_magnetic_housing');housing.position.z=-.017;group.add(housing);
    const face=new THREE.Shape();[[-.031,-.027],[-.031,.027],[-.006,.017],[.028,.025],[.030,.022],[.03,-.022],[.006,-.016],[-.027,-.028]].forEach(([x,y],i)=>i?face.lineTo(x,y):face.moveTo(x,y));face.closePath();
    const cover=plate(face,.002,black,'Magnetic_housing_face');cover.position.z=-.023;group.add(cover);
    const disc=new THREE.Mesh(new THREE.CylinderGeometry(.007,.007,.0014,48),magnet);disc.rotation.x=Math.PI/2;disc.position.set(-.021,0,-.024);group.add(disc);
    // Two integral attachment ears join the blade to the housing, with no
    // separate tools, loose screws, or logos from the product photographs.
    for(const y of [-.024,.024]){const tab=new THREE.Mesh(new THREE.BoxGeometry(.026,.005,.006),black);tab.position.set(.008,y,-.020);group.add(tab);}
    const contactGeometry=new THREE.BufferGeometry();const contact=new THREE.Mesh(contactGeometry,black);contact.name='Rear_surface_contact';group.add(contact);
    let fittedNode;
    function fit(node) {
      if(fittedNode===node)return;fittedNode=node;
      const object=parts.get(node).object;
      const corners=[[-.033,-.027],[.032,-.027],[.032,.027],[-.033,.027]];
      const depths=corners.map(([x,y])=>surface(object,group.position.x+sign*x,group.position.y+y));
      const middle=surface(object,group.position.x,group.position.y);
      const available=depths.filter(Number.isFinite);if(Number.isFinite(middle))available.push(middle);
      if(!available.length)throw new Error('Paddle mount does not meet the wheel rear surface');
      // The contact plate follows the actual surface at its corners. Housing
      // and blade sit entirely behind that plate rather than inside the wheel.
      const back=Math.min(...available)-.001;
      group.position.z=back;
      const vertices=[];
      corners.forEach(([x,y],i)=>vertices.push(x,y,(depths[i]??middle??back)-back));
      corners.forEach(([x,y])=>vertices.push(x,y,-.003));
      contactGeometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
      contactGeometry.setIndex([0,2,1,0,3,2,4,5,6,4,6,7,0,1,5,0,5,4,1,2,6,1,6,5,2,3,7,2,7,6,3,0,4,3,4,7]);contactGeometry.computeVertexNormals();contactGeometry.computeBoundingSphere();
      group.userData.contactDepths=depths;group.userData.mountDepth=back;
    }
    return {group,variants,fit};
  });
  return {update(appearance,sideNode){assemblies.forEach(({group,variants,fit})=>{group.visible=appearance.magnetic;if(group.visible)fit(sideNode);variants[0].visible=!appearance.longPaddles;variants[1].visible=appearance.longPaddles;});}};
}
