import React,{Children,Fragment,forwardRef,isValidElement,useEffect,useId,useImperativeHandle,useRef,useState} from 'react';
import './FeatureWizard.css';
const keyFor=value=>String(value).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export function collectFeatures(children,featureErrors={},group=''){
 const features=[];
 Children.forEach(children,node=>{
  if(!isValidElement(node))return;
  if(node.type===Fragment){features.push(...collectFeatures(node.props.children,featureErrors,group));return;}
  const category=node.props['data-step'];
  if(category==='review'){features.push({id:'review',label:'Review & notes',group:'review',node,errorKeys:[]});return;}
  if(category){features.push(...collectFeatures(node.props.children,featureErrors,category));return;}
  const legend=node.type==='fieldset'?Children.toArray(node.props.children).find(c=>isValidElement(c)&&c.type==='legend'):null;
  const label=node.props['data-feature']||node.props.label||(legend&&legend.props.children);
  if(typeof label!=='string')return;
  const clean=label.replace(/\s*\*\s*$/,'').trim();
  features.push({id:[group,keyFor(clean)].filter(Boolean).join('-'),label:clean,group,node,errorKeys:featureErrors[clean]||[]});
 });
 return features;
}
const FeatureWizard=forwardRef(function FeatureWizard({children,featureErrors={},onNext,onFinish,onFeatureChange,preview,footerContent,title='Customize your wheel'},ref){
 const features=collectFeatures(children,featureErrors),[activeKey,setActiveKey]=useState(null),[visited,setVisited]=useState([]);
 const index=Math.max(0,features.findIndex(f=>f.id===activeKey)),feature=features[index],heading=useRef(null),panel=useRef(null),changed=useRef(false),id=useId();
 function choose(key){changed.current=true;setActiveKey(key);setVisited(previous=>previous.includes(key)?previous:[...previous,key]);}
 useImperativeHandle(ref,()=>({goToGroup:group=>{const f=features.find(f=>f.group===group);if(f)choose(f.id);},goToError:key=>{const f=features.find(f=>f.errorKeys.includes(key));if(f)choose(f.id);},goToFeature:key=>{if(features.some(f=>f.id===key))choose(key);}}));
 useEffect(()=>{if(!feature)return;onFeatureChange?.(feature);if(changed.current){panel.current?.scrollTo?.({top:0,behavior:'auto'});heading.current?.focus({preventScroll:true});heading.current?.closest('.feature-wizard')?.scrollIntoView?.({block:'start',behavior:'auto'});changed.current=false;}},[feature?.id]);
 if(!feature)return null;
 function next(){if(onNext?.(feature)===false)return;setVisited(previous=>previous.includes(feature.id)?previous:[...previous,feature.id]);if(index===features.length-1)onFinish?.();else choose(features[index+1].id);}
 return <section className="feature-wizard" aria-label={title}>
  <header className="feature-wizard-header"><div className="feature-wizard-caption"><span>{title}</span><span aria-live="polite">Feature {index+1} of {features.length}</span></div><div className="feature-wizard-progress" role="progressbar" aria-label="Feature progress" aria-valuemin={1} aria-valuemax={features.length} aria-valuenow={index+1}><span style={{width:((index+1)/features.length*100)+'%'}}/></div><label className="feature-wizard-edit" htmlFor={id+'-edit'}>Edit a feature<select id={id+'-edit'} value={feature.id} onChange={e=>choose(e.target.value)}>{features.map((f,i)=><option key={f.id} value={f.id}>{i+1}. {f.label}{visited.includes(f.id)?' · visited':''}</option>)}</select></label></header>
  {preview && <div className="feature-wizard-preview">{preview}</div>}
  <div ref={panel} className="feature-wizard-panel" role="region" aria-labelledby={id+'-title'}><h2 ref={heading} tabIndex={-1} id={id+'-title'}>{feature.label}</h2><div key={feature.id}>{feature.node}</div></div>
  <footer className="feature-wizard-nav">{footerContent}<button type="button" className="btn-outline" disabled={index===0} onClick={()=>choose(features[index-1].id)}>← Back</button><button type="button" className="btn" onClick={next}>{index===features.length-1?'Review build':'Next feature →'}</button></footer>
 </section>;
});
export default FeatureWizard;
