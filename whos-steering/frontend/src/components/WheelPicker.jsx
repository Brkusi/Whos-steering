import {useEffect,useId,useRef,useState} from 'react';

export default function WheelPicker({wheels,onChoose,nameForWheel}) {
  const [open,setOpen]=useState(false);
  const root=useRef(null),trigger=useRef(null),options=useRef([]),last=useRef(0);
  const id=useId();
  const close=(restore=false)=>{setOpen(false);if(restore)trigger.current?.focus({preventScroll:true});};
  const focus=index=>{const next=(index+wheels.length)%wheels.length;last.current=next;options.current[next]?.focus();};
  useEffect(()=>{
    if(!open)return;
    focus(last.current);
    const outside=event=>{if(!root.current?.contains(event.target))setOpen(false);};
    document.addEventListener('pointerdown',outside);
    return()=>document.removeEventListener('pointerdown',outside);
  },[open]);
  return <div className="orbit-picker" ref={root} onKeyDown={event=>{
    if(event.key==='Escape'&&open){event.stopPropagation();event.preventDefault();close(true);}
    if(event.key==='Tab')close();
  }}>
    <button ref={trigger} type="button" className="orbit-picker-trigger" aria-label="Select your wheel" aria-haspopup="listbox" aria-expanded={open} aria-controls={id} onClick={()=>setOpen(!open)} onKeyDown={event=>{
      if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();last.current=event.key==='ArrowUp'?wheels.length-1:0;setOpen(true);}
    }}><span><small>QUICK SELECT</small>Select your wheel</span><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg></button>
    {open&&<div id={id} role="listbox" aria-label="Available steering wheels" className="orbit-picker-menu" onKeyDown={event=>{
      const index=options.current.indexOf(document.activeElement);
      if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();focus(index+(event.key==='ArrowDown'?1:-1));}
      if(event.key==='Home'||event.key==='End'){event.preventDefault();focus(event.key==='Home'?0:wheels.length-1);}
    }}>
      {wheels.map((wheel,index)=><button ref={el=>{options.current[index]=el;}} role="option" aria-selected="false" tabIndex={-1} type="button" className="orbit-picker-option" key={wheel.brand+wheel.style} onClick={()=>{close();onChoose(wheel,index);}}><span>{nameForWheel(wheel)}<small>STYLE WHEEL</small></span><span aria-hidden="true">↗</span></button>)}
    </div>}
  </div>;
}
