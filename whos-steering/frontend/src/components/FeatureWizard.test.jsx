import React,{act,useState} from 'react';
import {createRoot} from 'react-dom/client';
import FeatureWizard from './FeatureWizard';
global.IS_REACT_ACT_ENVIRONMENT=true;
let host,root,finish;
function Section({label,children}){return <div>{children}</div>;}
function Build(){const [choice,setChoice]=useState('None'),[trim,setTrim]=useState('Black');return <FeatureWizard onFinish={finish} onNext={f=>f.label!=='Paddles'||choice!=='None'}><div data-step="style"><Section label="Paddles"><button onClick={()=>setChoice('Long')}>Long paddles</button><output>{choice}</output></Section><Section label="Trim"><button onClick={()=>setTrim('Red')}>Red trim</button><output>{trim}</output></Section>{trim==='Red'&&<Section label="Accent"><input aria-label="Accent note"/></Section>}</div><div data-step="review"><p>Final review: {choice} / {trim}</p></div></FeatureWizard>;}
beforeEach(()=>{host=document.createElement('div');document.body.append(host);root=createRoot(host);finish=jest.fn();act(()=>root.render(<Build/>));});
afterEach(()=>{act(()=>root.unmount());host.remove();});
function click(text){const b=[...host.querySelectorAll('button')].find(b=>b.textContent===text);act(()=>b.click());}
function jump(value){act(()=>{const s=host.querySelector('select');s.value=value;s.dispatchEvent(new Event('change',{bubbles:true}));});}
test('one feature is shown, Next can validate, and Back retains earlier configuration',()=>{
 expect(host.querySelectorAll('.feature-wizard-panel')).toHaveLength(1);expect(host.textContent).not.toContain('Red trim');
 click('Next feature →');expect(host.querySelector('h2').textContent).toBe('Paddles');
 click('Long paddles');click('Next feature →');expect(host.querySelector('h2').textContent).toBe('Trim');
 click('Red trim');click('← Back');expect(host.querySelector('output').textContent).toBe('Long');
 click('Next feature →');expect(host.querySelector('output').textContent).toBe('Red');
});
test('edit menu revisits features and conditional options do not corrupt feature identity',()=>{
 click('Long paddles');jump('style-trim');click('Red trim');
 expect([...host.querySelectorAll('option')].map(o=>o.value)).toContain('style-accent');
 jump('style-paddles');expect(host.querySelector('output').textContent).toBe('Long');
 jump('review');expect(host.textContent).toContain('Final review: Long / Red');click('Review build');expect(finish).toHaveBeenCalledTimes(1);
});
