import {useId} from 'react';
export default function StripeSwatch({concept}){
 const id=useId().replace(/:/g,'');
 const colors=concept.stripes||[],band=colors.length?44/colors.length:0;
 return <svg viewBox="0 0 600 336" role="img" aria-label={concept.label} style={{display:'block',width:'100%',height:'100%',background:'transparent'}}>
  <defs><mask id={id+'-rim'} maskUnits="userSpaceOnUse" x="0" y="0" width="600" height="336" style={{maskType:'alpha'}}><image href="/stripes/rim-transparent.png" width="600" height="336" preserveAspectRatio="none"/></mask><linearGradient id={id+'-gloss'} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#fff" stopOpacity=".25"/><stop offset=".55" stopColor="#fff" stopOpacity="0"/><stop offset="1" stopColor="#000" stopOpacity=".22"/></linearGradient></defs>
  <image href="/stripes/rim-transparent.png" width="600" height="336" preserveAspectRatio="none"/>
  {!!colors.length&&<g mask={`url(#${id}-rim)`}>{colors.map((color,i)=><rect key={i} x={278+i*band} y="0" width={band+.3} height="336" fill={color}/>)}<rect x="278" y="0" width="44" height="336" fill={`url(#${id}-gloss)`}/></g>}
 </svg>;
}
