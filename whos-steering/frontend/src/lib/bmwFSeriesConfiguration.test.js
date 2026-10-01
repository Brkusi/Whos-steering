import { DEFAULT_CONFIG, COLORS } from './data';
import { bmwFSeriesConfiguration, F_SERIES_SHAPES, F_SERIES_SHAPE_IDS, F_SERIES_PADDLES, sourceWheelStyle } from './bmwFSeriesConfiguration';
import { calcPrice } from './api';
import { renderMaterialPixels } from './bmwFSeriesSourceRenderer';
import calibration from './bmwFSeriesCalibration.json';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const base={...DEFAULT_CONFIG,brand:'BMW',wheelStyleType:'F-Series',heated:false,laneAssist:false,airbagCompat:false,airbagUpgrade:false,ledDisplay:false};
const parse=value=>/^#[a-f\d]{6}$/i.test(value)?value:null;

test('all source shapes and paddle options map correctly; legacy defaults are safe',()=>{
  for(const bmwShape of F_SERIES_SHAPES)for(const paddleShifters of F_SERIES_PADDLES){
    const a=bmwFSeriesConfiguration({...base,bmwShape,paddleShifters},parse);
    expect(a.shape).toBe(F_SERIES_SHAPE_IDS[bmwShape]);
    expect(a.paddle).toBe(({Standard:null,None:null,'Glossy Carbon':'glossy','Matte Carbon':'matte','Forged Carbon':'forged'})[paddleShifters]);
  }
  expect(bmwFSeriesConfiguration(base,parse).shape).toBe('round');
  expect(bmwFSeriesConfiguration({...base,bmwShape:'Yoke',ledDisplay:true,stripeConceptId:'C-6'},parse)).toMatchObject({topZone:'bottom',led:false,stripes:[]});
  expect(bmwFSeriesConfiguration({...base,bmwShape:'Flat bottom',ledDisplay:true},parse).led).toBe(true);
});
test('source assets retain downloaded bytes and every shape/material has a calibrated map',()=>{
  const directory=path.join(process.cwd(),'public/models/bmw-fseries/source');
  const manifest=JSON.parse(fs.readFileSync(path.join(directory,'manifest.json'),'utf8'));
  for(const asset of manifest)expect(crypto.createHash('sha256').update(fs.readFileSync(path.join(directory,asset.path))).digest('hex')).toBe(asset.sha256);
  const files=new Set(manifest.map(a=>a.path));
  for(const shape of Object.values(F_SERIES_SHAPE_IDS)){
    expect(files.has(`${shape}.webp`)).toBe(true);
    for(const zone of ['side',shape==='yoke'?'bottom':'tb'])for(const mat of ['alcantara','smooth','perforated']){
      const key=`${shape}-${zone}-${mat}`;expect(calibration[key]).toBeDefined();expect(files.has(`grips/${key}-map.webp`)).toBe(true);
    }
    for(const finish of ['glossy','matte','forged'])expect(files.has(`cf/${shape}-${finish}.webp`)).toBe(true);
  }
});
test('source renderer preserves alpha and colors stitch masks separately from the grip',()=>{
  const input={data:new Uint8ClampedArray([0,255,20,0, 255,200,90,255, 0,200,90,255])};
  const out={data:new Uint8ClampedArray(12)};
  renderMaterialPixels(input,out,calibration['round-side-smooth'],'#0044cc','#cc2200');
  expect([...out.data.slice(0,4)]).toEqual([0,0,0,0]);
  expect(out.data[4]).toBeGreaterThan(out.data[6]);
  expect(out.data[10]).toBeGreaterThan(out.data[8]);expect(out.data[11]).toBe(255);
});
test('faint red map noise does not tint the grip, and Dodge exposes stitching',()=>{
  const input={data:new Uint8ClampedArray([24,200,90,255, 255,200,90,255])};
  const red={data:new Uint8ClampedArray(8)},blue={data:new Uint8ClampedArray(8)};
  renderMaterialPixels(input,red,calibration['round-side-smooth'],'#292929','#ff0000');
  renderMaterialPixels(input,blue,calibration['round-side-smooth'],'#292929','#0000ff');
  expect([...red.data.slice(0,4)]).toEqual([...blue.data.slice(0,4)]);
  expect([...red.data.slice(4,8)]).not.toEqual([...blue.data.slice(4,8)]);
  expect(sourceWheelStyle({brand:'DODGE_SRT',wheelStyleType:'SRT'}).stitch).not.toBe(false);
});
test('existing palette and carbon selections pass through without extra source colors',()=>{
  for(const c of COLORS)expect(bmwFSeriesConfiguration({...base,sideCol:c.h},parse).side.color).toBe(c.h);
  for(const material of ['Classic Carbon','Forged Carbon'])expect(bmwFSeriesConfiguration({...base,topBottomMat:material,topBottomCarbonCol:'#111111'},parse).top).toEqual({material,color:'#111111'});
});
test('F-series paddle/trim pricing and rule overrides match the server',()=>{
  const initial=calcPrice(base);
  for(const bmwShape of F_SERIES_SHAPES)expect(calcPrice({...base,bmwShape,paddleShifters:'None'})).toBe(initial);
  for(const paddleShifters of ['Glossy Carbon','Matte Carbon','Forged Carbon','Magnetic']){
    expect(calcPrice({...base,paddleShifters})).toBe(initial+25);
    expect(calcPrice({...base,paddleShifters},{paddle_magnetic:37})).toBe(initial+37);
  }
  expect(calcPrice({...base,bmwLowerTrim:'Glossy Carbon'})).toBe(initial+50);
  expect(calcPrice({...base,bmwLowerTrim:'Forged Carbon'},{bmw_lower_trim:60})).toBe(initial+60);
  expect(calcPrice({...base,wheelStyleType:'G-Series',paddleShifters:'Forged Carbon'})).toBe(549.99);
});


test('G-Series Pre LCI selects its own assets and keeps G-Series pricing',()=>{
  const cfg={...base,wheelStyleType:'G-Series Pre LCI',bmwShape:'Flat bottom',paddleShifters:'Forged Carbon',bmwLowerTrim:'Glossy Carbon'};
  expect(bmwFSeriesConfiguration(cfg,parse)).toMatchObject({family:'bmw-gseries',shape:'flat-round',paddle:'forged'});
  expect(calcPrice(cfg)).toBe(549.99+25+50);
  const directory=path.join(process.cwd(),'public/models/bmw-gseries/source');
  const manifest=JSON.parse(fs.readFileSync(path.join(directory,'manifest.json'),'utf8'));
  for(const asset of manifest)expect(crypto.createHash('sha256').update(fs.readFileSync(path.join(directory,asset.path))).digest('hex')).toBe(asset.sha256);
  const calibration=require('./bmwGSeriesCalibration.json');
  for(const shape of Object.values(F_SERIES_SHAPE_IDS))for(const zone of ['side',shape==='yoke'?'bottom':'tb'])for(const mat of ['smooth','perforated','alcantara'])expect(calibration[`${shape}-${zone}-${mat}`]).toBeDefined();
});
