import { carbonCoordinates } from './bmwFSeriesCarbonUV';

test('weave follows curved rim centerline and remains centered across its width',()=>{
  const size=100, pixels=new Uint8ClampedArray(size*size*4);
  for(let x=10;x<90;x++){
    const center=Math.round(12+(x-50)**2/100);
    for(let y=center-4;y<=center+4;y++)pixels[(y*size+x)*4+3]=255;
  }
  const uv=carbonCoordinates(pixels,size);
  expect(uv(50,12)[1]).toBe(0);
  expect(uv(30,16)[1]).toBe(0);
  expect(uv(70,16)[0]-uv(30,16)[0]).toBeGreaterThan(40);
  expect(uv(50,16)[1]).toBeGreaterThan(uv(50,12)[1]);
});
