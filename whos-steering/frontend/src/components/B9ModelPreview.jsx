import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js';
import { B9_ASSETS, B9_TARGET, loadAudiB9 } from '../lib/audiB9SourceModel';
import { audiB9Configuration } from '../lib/audiB9Configuration';
import './AudiB9Preview.css';

export function parsePreviewColor(value) {
  if (typeof value !== 'string' || !CSS.supports('color', value) || /^(inherit|initial|unset|revert|currentcolor|transparent|var\()/i.test(value)) return null;
  const canvas=document.createElement('canvas');canvas.width=canvas.height=1;
  const ctx=canvas.getContext('2d');ctx.fillStyle=value;ctx.fillRect(0,0,1,1);
  return '#'+[...ctx.getImageData(0,0,1,1).data].slice(0,3).map(n=>n.toString(16).padStart(2,'0')).join('');
}

export default function B9ModelPreview({config}) {
  const mount=useRef(null), runtime=useRef(null), latest=useRef(config);latest.current=config;
  const [error,setError]=useState(false),[ready,setReady]=useState(false),[view,setView]=useState('Front');
  const appearance=audiB9Configuration(config,parsePreviewColor);
  useEffect(()=>{
    const host=mount.current, abort=new AbortController();
    let renderer,controls,model,environment,pmrem,observer,frame,sourceHDR;
    let disposed=false, cleanupListeners=()=>{};
    const render=()=>{if(disposed||frame||!renderer)return;frame=requestAnimationFrame(()=>{frame=null;if(!disposed&&!document.hidden)renderer.render(scene,camera);});};
    const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(45,1,.005,20);
    scene.background=new THREE.Color('#1e1e1e');
    setReady(false);setError(false);
    async function initialize(){
      try {
        renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
        renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=2.2;
        renderer.domElement.setAttribute('aria-label','Interactive Audi B9 steering wheel. Drag to rotate; scroll or pinch to zoom.');renderer.domElement.setAttribute('role','img');host.appendChild(renderer.domElement);
        controls=new OrbitControls(camera,renderer.domElement);controls.target.copy(B9_TARGET);controls.enablePan=false;controls.minDistance=.35;controls.maxDistance=4;controls.rotateSpeed=.65;
        const setCamera=name=>{
          const radius=(name==='Detail'?.94:1.26)/Math.min(camera.aspect,1);
          const [theta,phi]=name==='Rear'?[Math.PI,Math.PI/2]:name==='Detail'?[-.42,1.4876]:[0,Math.PI/2];
          camera.position.copy(B9_TARGET).add(new THREE.Vector3().setFromSphericalCoords(radius,phi,theta));controls.target.copy(B9_TARGET);controls.update();render();
        };
        const resize=()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;const previousAspect=camera.aspect;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();if(previousAspect!==camera.aspect){const offset=camera.position.clone().sub(B9_TARGET);if(offset.length()>0){offset.multiplyScalar(Math.min(previousAspect,1)/Math.min(camera.aspect,1));camera.position.copy(B9_TARGET).add(offset);controls.update();}}render();};
        resize();setCamera('Front');controls.addEventListener('change',render);
        observer=new ResizeObserver(resize);observer.observe(host);
        const visibility=()=>{if(!document.hidden)render();};document.addEventListener('visibilitychange',visibility);
        const lost=event=>{event.preventDefault();if(!disposed)setError(true);};renderer.domElement.addEventListener('webglcontextlost',lost);
        cleanupListeners=()=>{document.removeEventListener('visibilitychange',visibility);renderer?.domElement.removeEventListener('webglcontextlost',lost);};
        await Promise.all([
          loadAudiB9(abort.signal).then(value=>{if(disposed){value.dispose();return;}model=value;}),
          new HDRLoader().loadAsync(`${B9_ASSETS}/studio.hdr`).then(value=>{if(disposed){value.dispose();return;}sourceHDR=value;}),
        ]);
        if(disposed)return;
        pmrem=new THREE.PMREMGenerator(renderer);environment=pmrem.fromEquirectangular(sourceHDR);sourceHDR.dispose();sourceHDR=null;scene.environment=environment.texture;pmrem.dispose();pmrem=null;
        scene.add(model.root);model.update(audiB9Configuration(latest.current,parsePreviewColor));
        runtime.current={
          update:next=>{model.update(next);render();},setView:setCamera,
          zoom:factor=>{const offset=camera.position.clone().sub(controls.target);offset.setLength(THREE.MathUtils.clamp(offset.length()*factor,controls.minDistance,controls.maxDistance));camera.position.copy(controls.target).add(offset);controls.update();render();},
        };
        setReady(true);setView('Front');render();
      } catch(e){if(!disposed){setError(true);abort.abort();model?.dispose();model=null;sourceHDR?.dispose();sourceHDR=null;}}
    }
    initialize();
    return ()=>{disposed=true;abort.abort();cancelAnimationFrame(frame);observer?.disconnect();cleanupListeners();controls?.dispose();model?.dispose();sourceHDR?.dispose();environment?.dispose();pmrem?.dispose();runtime.current=null;renderer?.dispose();renderer?.domElement.remove();};
  },[]);
  useEffect(()=>{runtime.current?.update(appearance);});
  function changeView(name){runtime.current?.setView(name);setView(name);}
  return <section className="wheel3d" aria-label="Audi B9 live design preview">
    <div className="wheel3d-heading"><span>AUDI B9</span><span className="wheel3d-live">{ready&&!error?'LIVE 3D':'3D PREVIEW'}</span></div>
    <div className="wheel3d-stage" ref={mount}/>
    {error?<div className="wheel3d-fallback"><img src="/b9-reference.png" alt="Audi B9 wheel reference"/><p>3D isn’t available in this browser. Your selections are still saved below.</p></div>:!ready&&<p role="status" className="wheel3d-loading">Preparing your wheel…</p>}
    {!error&&<div className="wheel3d-controls" aria-label="Preview camera">
      {['Front','Detail','Rear'].map(name=><button key={name} type="button" aria-pressed={view===name} onClick={()=>changeView(name)}>{name}</button>)}
      <button type="button" aria-label="Zoom in" onClick={()=>runtime.current?.zoom(.82)}>+</button>
      <button type="button" aria-label="Zoom out" onClick={()=>runtime.current?.zoom(1.22)}>−</button>
      <button type="button" aria-label="Reset view" onClick={()=>changeView('Front')}>Reset</button>
    </div>}
    <p className="wheel3d-hint">Drag to rotate · Pinch or scroll to zoom</p>
    {appearance.unresolved.length>0&&<p className="wheel3d-note" role="status">Custom instructions retained for your order; not rendered: {appearance.unresolved.join(', ')}.</p>}
  </section>;
}
