import {useEffect,useRef} from 'react';
import {drawLedArtwork} from '../lib/ledDisplay';
export default function LedDisplay() {
  const ref=useRef(null);
  useEffect(()=>{drawLedArtwork(ref.current.getContext('2d'));},[]);
  return <canvas ref={ref} width="1536" height="160" role="img" aria-label="LED display with RPM and speed readout" style={{width:'100%',height:'auto',display:'block'}}/>;
}
