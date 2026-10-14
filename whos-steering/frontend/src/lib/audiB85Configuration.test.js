import fs from 'fs';
import path from 'path';
import {audiB85Layers, normalizeB85Options, B85_ROOT, B85_LED} from './audiB85Configuration';
import assets from './audiB85Assets.json';
const defaults = {brand:'AUDI',wheelStyleType:'B8.5',topBottomMat:'Smooth Leather',sideMat:'Alcantara',paddleShifters:'Standard',stripeConceptId:'C-1'};
const render = overrides => audiB85Layers(normalizeB85Options({...defaults,...overrides}));

test('all reference layer paths exist and resolve to images, including every airbag and forged variant', () => {
  for (const filename of Object.values(assets).flatMap(group => Object.values(group))) {
    const bytes = fs.readFileSync(path.join(process.cwd(),'public',B85_ROOT,filename));
    expect(bytes.subarray(1,4).toString()).toBe('PNG');
  }
});
test('paddles render behind the base; None removes them instead of retaining the previous option', () => {
  const standard = render({});
  expect(standard[0].src).toContain('paddles-original');
  expect(standard[1].src).toContain('base.png');
  expect(render({paddleShifters:'None'})[0].src).toContain('base.png');
  for (const paddleShifters of ['Racing Style 1','Racing Style 2','Magnetic']) {
    expect(render({paddleShifters})[2].src).toContain('base.png');
  }
});
test('all three grip choices replace the baked-in base material with distinct photos', () => {
  const sideSources = ['Smooth Leather','Perforated Leather','Alcantara'].map(sideMat => render({sideMat})[3].src);
  expect(new Set(sideSources).size).toBe(3);
});
test('all eight forged colors select distinct source photos without global color filters', () => {
  const variants=['#111111','#1A0A2E','#0A2E10','#3A2800','#0A1428','#6E0000','#D0D0D0','#A6326C'];
  const sources=variants.map(topBottomCarbonCol => render({topBottomMat:'Forged Carbon',topBottomCarbonCol})[2].src);
  expect(new Set(sources).size).toBe(8);
});
test('LED replaces the stripe and cover changes replace only the airbag layer', () => {
  const baseline=render({stripeConceptId:'C-6'});
  const led=render({stripeConceptId:'C-6',ledDisplay:true});
  expect(led.at(-1).src).toBe(B85_LED);
  expect(led.map(l=>l.src)).not.toContain(baseline.at(-1).src);
  const cover=render({stripeConceptId:'C-6',airbagCompat:true,airbagMat:'Alcantara',airbagStitchColor:'#CC2200'});
  expect(cover.filter((layer,i)=>layer.src!==baseline[i].src)).toHaveLength(1);
});
test('stale structural options normalize while production colors are preserved', () => {
  const cfg=normalizeB85Options({...defaults,bmwShape:'Yoke',topBottomMat:'Honeycomb Carbon',sideCol:'#ff0000',audiBadge:'RS3',paddleShifters:'LED'});
  expect(cfg).toMatchObject({bmwShape:'Flat bottom',wheelStyle:'Sport',topBottomMat:'Smooth Leather',sideCol:'#ff0000',audiBadge:'RS',paddleShifters:'Standard'});
});

test('airbag color variants alter stitching, while cover material remains black', () => {
  const cfg=normalizeB85Options({...defaults,airbagCompat:true,airbagCol:'#CC2200',airbagStitchColor:'#E8B800'});
  expect(cfg.airbagCol).toBe('#CC2200');
  expect(audiB85Layers(cfg).map(l=>l.src)).toContain(B85_ROOT+assets.airbagLeather.Jaune);
});

test('restored builds preserve custom stitching but clear stripes alongside LEDs', () => {
  const cfg=normalizeB85Options({...defaults,ledDisplay:true,stripeConceptId:'C-6',stitchColor:'#FF69B4',stitchCustomColor:'Orange',airbagCompat:false,airbagUpgrade:true});
  expect(cfg).toMatchObject({stripeConceptId:'C-1',stitchColor:'#FF69B4',stitchCustomColor:'Orange',airbagUpgrade:false});
});


test('custom production colors survive normalization and preview fallback', () => {
  const custom = {topBottomCustomColor:'Pearl gold',sideCustomColor:'Beige',stitchCustomColor:'Teal and silver',stripeCustomColor:'Champagne',airbagCustomColor:'Ivory',airbagStitchCustomColor:'Copper',b85PaddleCarbonCustomColor:'Bronze',b85PaddleSymbolCustomColor:'Coral'};
  const cfg = normalizeB85Options({...defaults,...custom,airbagCompat:true});
  expect(cfg).toMatchObject(custom);
  expect(normalizeB85Options(cfg)).toMatchObject(custom);
  expect(audiB85Layers(cfg).every(layer => layer.src && !layer.src.includes('undefined'))).toBe(true);
  expect(cfg).toMatchObject(custom);
});
