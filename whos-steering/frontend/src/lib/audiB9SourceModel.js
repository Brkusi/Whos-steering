import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import PARTS from './audiB9Parts.json';
import { audiB9Parts } from './audiB9Configuration';
import { createB9Extras } from './audiB9Extras';

export const B9_ASSETS = `${process.env.PUBLIC_URL || ''}/models/audi-b9/v4`;
export const B9_TARGET = new THREE.Vector3(-.012138549, .374767253, .027438419);
const B9_MODEL_PARTS = 14;

async function fetchWheelBuffer(signal) {
  const chunks = await Promise.all(Array.from({length: B9_MODEL_PARTS}, async (_, index) => {
    const name = String(index).padStart(2, '0');
    const response = await fetch(`${B9_ASSETS}/wheel.glb.part-${name}`, {signal});
    if (!response.ok) throw new Error('Wheel asset could not be loaded');
    return new Uint8Array(await response.arrayBuffer());
  }));
  const size = chunks.reduce((total, chunk) => total + chunk.byteLength, 0);
  const joined = new Uint8Array(size);
  let offset = 0;
  chunks.forEach(chunk => { joined.set(chunk, offset); offset += chunk.byteLength; });
  return joined.buffer;
}

function disposeTree(root, additionalMaterials = []) {
  const geometries = new Set(), materials = new Set(additionalMaterials), textures = new Set();
  root.traverse(object => {
    if (object.geometry) geometries.add(object.geometry);
    if (object.material) (Array.isArray(object.material) ? object.material : [object.material]).forEach(m => materials.add(m));
  });
  materials.forEach(m => Object.values(m).forEach(v => { if (v?.isTexture) textures.add(v); }));
  geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose());
}

export async function loadAudiB9(signal) {
  const decoder = new DRACOLoader().setDecoderPath(`${B9_ASSETS}/draco/`);
  let gltf;
  try {
    gltf = await new GLTFLoader().setDRACOLoader(decoder).parseAsync(await fetchWheelBuffer(signal), '');
  } finally { decoder.dispose(); }
  if (signal?.aborted) { disposeTree(gltf.scene); throw new DOMException('Aborted', 'AbortError'); }
  const root = gltf.scene, nodes = new Map(), originalMaterials = new Set();
  root.updateMatrixWorld(true);
  root.traverse(object => {
    const association = gltf.parser.associations.get(object);
    if (association?.nodes !== undefined) nodes.set(association.nodes, object);
  });
  const parts = PARTS.map(part => {
    const object = nodes.get(part.node);
    if (!object) throw new Error(`Missing source part ${part.name}`);
    const primitives = object.isMesh ? [object] : object.children.filter(child => child.isMesh);
    // The untextured insert has no UVs in the source. Add planar UVs only for
    // the existing Match Carbon Fiber option; positions and normals are intact.
    if (part.node === 13) primitives.forEach(mesh => {
      if (mesh.geometry.attributes.uv) return;
      const position=mesh.geometry.attributes.position, uv=new Float32Array(position.count*2), point=new THREE.Vector3();
      for(let i=0;i<position.count;i++){point.fromBufferAttribute(position,i).applyMatrix4(mesh.matrixWorld);uv[i*2]=point.x*4;uv[i*2+1]=point.y*4;}
      mesh.geometry.setAttribute('uv',new THREE.BufferAttribute(uv,2));
    });
    const originals = primitives.map(mesh => {
      originalMaterials.add(mesh.material);
      const original = mesh.material.clone(); original.emissiveIntensity = 1;
      // Match the approved preview: the source viewer ignores emissive strength.
      mesh.material = original.clone();
      return original;
    });
    return {...part, object, primitives, originals};
  });
  const byNode = new Map(parts.map(part => [part.node, part]));
  let extras;
  try { extras = await createB9Extras(root, byNode); }
  catch(error) { disposeTree(root, [...originalMaterials, ...parts.flatMap(part => part.originals)]); throw error; }
  let lastAppearance = '';
  function paint(node, color) { byNode.get(node)?.primitives.forEach(mesh => mesh.material.color.set(color)); }
  function finish(node, appearance, selected) {
    const part = byNode.get(node);
    if (appearance.material === 'Honeycomb Carbon') {
      part.primitives.forEach(mesh => { mesh.material.map = extras.honeycomb; mesh.material.needsUpdate = true; });
    }
    if (!selected) return;
    if (appearance.material.includes('Carbon')) {
      const color = new THREE.Color(appearance.color), max = Math.max(color.r, color.g, color.b);
      // Black/classic is the original fiber map, not a black multiplier that
      // obscures it. Colored fiber keeps the source's black weave underneath.
      if (max - Math.min(color.r, color.g, color.b) < .035 || max < .005) color.setRGB(1,1,1);
      else color.multiplyScalar(1 / max);
      part.primitives.forEach(mesh => mesh.material.color.copy(color));
    } else paint(node, appearance.color);
  }
  function update(appearance) {
    const key = JSON.stringify(appearance); if (key === lastAppearance) return; lastAppearance = key;
    const selection = audiB9Parts(appearance);
    parts.forEach(part => part.primitives.forEach((mesh, i) => {
      // A hidden material still allows independent child controls to render.
      const previousMap = mesh.material.map;
      mesh.material.copy(part.originals[i]);
      mesh.material.visible = selection.visible.has(part.node);
      if (previousMap !== mesh.material.map) mesh.material.needsUpdate = true;
    }));
    finish(selection.top, appearance.top, appearance.topColorSelected);
    finish(selection.side, appearance.side, appearance.sideColorSelected);
    if (appearance.coverColorSelected) paint(selection.cover, appearance.airbag.color);
    [10,34].forEach(n => paint(n, appearance.stitchColorSelected ? appearance.stitch : '#080808'));
    [38,39].forEach(n => paint(n, appearance.coverStitchSelected ? appearance.airbagStitch : '#080808'));
    [12,26,28,41].forEach(n => paint(n, appearance.trimColorSelected ? appearance.trim : '#080808'));
    paint(40, appearance.logoColorSelected ? appearance.logo : '#080808');
    if (appearance.innerCarbon) {
      const carbon = byNode.get(selection.top).primitives[0].material;
      byNode.get(13).primitives.forEach(mesh => {mesh.material.copy(carbon); mesh.material.visible = true; mesh.material.needsUpdate = true;});
    } else if (appearance.innerColorSelected) paint(13, appearance.innerTrim);
    if (selection.stripe !== null) byNode.get(selection.stripe).primitives.forEach((mesh,i) => mesh.material.color.set(appearance.stripes.length === 1 ? appearance.stripes[0] : appearance.stripes[i]));
    extras.update(appearance);
  }
  function dispose() {
    extras.dispose();
    disposeTree(root, [...originalMaterials, ...parts.flatMap(part => part.originals)]);
  }
  if (signal?.aborted) { dispose(); throw new DOMException('Aborted', 'AbortError'); }
  return {root, update, dispose};
}
