import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
import PreviewZoom,{zoomOrigin} from './PreviewZoom';
global.IS_REACT_ACT_ENVIRONMENT=true;
test('pointer origins are relative to the preview and clamped to its bounds',()=>{
 expect(zoomOrigin(175,250,{left:100,top:200,width:300,height:200})).toEqual({x:25,y:25});
 expect(zoomOrigin(-1,1000,{left:0,top:0,width:300,height:200})).toEqual({x:0,y:100});
});
test('click zoom targets the clicked detail and keyboard users can pan and reset',()=>{
 const host=document.createElement('div'),root=createRoot(host);
 act(()=>root.render(<PreviewZoom><canvas/></PreviewZoom>));
 const control=host.querySelector('[role="button"]'),content=host.querySelector('.preview-zoom-content');
 control.getBoundingClientRect=()=>({left:100,top:200,width:400,height:200});
 act(()=>control.dispatchEvent(new MouseEvent('click',{bubbles:true,clientX:200,clientY:350})));
 expect(content.style.transformOrigin).toBe('25% 75%');expect(content.style.transform).toBe('scale(2.4)');
 act(()=>control.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true})));
 expect(content.style.transformOrigin).toBe('35% 75%');
 act(()=>control.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})));
 expect(control.getAttribute('aria-pressed')).toBe('false');expect(content.style.transform).toBe('scale(1)');
 act(()=>control.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true})));
 expect(content.style.transformOrigin).toBe('50% 50%');expect(control.getAttribute('aria-pressed')).toBe('true');
 act(()=>root.unmount());
});
