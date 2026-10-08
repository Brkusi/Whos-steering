import { VEHICLE_MAKES, isConfigurableMake, wheelMatchesVehicle } from './vehicleCompatibility';
import { bmwFSeriesConfiguration, sourceWheelShapes, sourceWheelHasPaddles, sourceWheelSupportsLed } from './bmwFSeriesConfiguration';
import { calcPrice } from './api';
import { DEFAULT_CONFIG } from './data';
import { wheelStyle } from './wheelStyles';
const fs = require('fs'), path = require('path'), crypto = require('crypto');

test('make selection separates available wheels from requests for fitment', () => {
  expect(VEHICLE_MAKES.map(item => item.label)).toEqual(['Audi','BMW','Dodge','Mercedes','Toyota','Porsche']);
  expect(VEHICLE_MAKES.filter(item => isConfigurableMake(item.value)).map(item => item.label)).toEqual(['Audi','BMW','Dodge','Mercedes','Toyota','Porsche']);
});

test('compatibility follows the published style coverage and selected BMW chassis', () => {
  expect(wheelMatchesVehicle({brand:'AUDI',vehicleYear:'2022',vehicleModel:'RS 6'},'RS 2020+')).toBe(true);
  expect(wheelMatchesVehicle({brand:'AUDI',vehicleYear:'2011',vehicleModel:'A4'},'RS 2020+')).toBe(true);
  expect(wheelMatchesVehicle({brand:'AUDI',vehicleYear:'2022',vehicleModel:'A4'},'R8')).toBe(true);
  expect(wheelMatchesVehicle({brand:'AUDI',vehicleYear:'2022',vehicleModel:'A4'},'B9')).toBe(true);
  expect(wheelMatchesVehicle({brand:'AUDI',vehicleYear:'2026',vehicleModel:'A4'},'B9')).toBe(false);
  expect(wheelMatchesVehicle({brand:'BMW',vehicleYear:'2018',vehicleModel:'320i'},'F-Series')).toBe(true);
  expect(wheelMatchesVehicle({brand:'BMW',vehicleYear:'2018',vehicleModel:'320i'},'G-Series')).toBe(true);
  expect(wheelMatchesVehicle({brand:'BMW',vehicleYear:'2024',vehicleModel:'330i'},'G-Series Pre LCI')).toBe(true);
  expect(wheelMatchesVehicle({brand:'BMW',vehicleYear:'2024',vehicleModel:'330i'},'F-Series')).toBe(false);
  expect(wheelMatchesVehicle({brand:'BMW',vehicleYear:'2011',vehicleModel:'328i'},'F-Series')).toBe(true);
  expect(wheelMatchesVehicle({brand:'BMW',vehicleYear:'2011',vehicleModel:'328i'},'G-Series')).toBe(false);
  expect(wheelMatchesVehicle({brand:'TOYOTA',vehicleYear:'2024',vehicleModel:'Supra'},'Supra GR')).toBe(true);
  expect(wheelMatchesVehicle({brand:'TOYOTA',vehicleYear:'2024',vehicleModel:'Camry'},'Supra GR')).toBe(false);
  expect(wheelMatchesVehicle({brand:'TOYOTA',vehicleYear:'2024',vehicleModel:'Supra Sedan'},'Supra GR')).toBe(false);
  expect(wheelMatchesVehicle({brand:'MERCEDES',vehicleYear:'2021',vehicleModel:'AMG GT'},'AMG Performance')).toBe(true);
  expect(wheelMatchesVehicle({brand:'MERCEDES',vehicleYear:'2019',vehicleModel:'GLC-Class'},'Mercedes 2015–2023')).toBe(true);
  expect(wheelMatchesVehicle({brand:'MERCEDES',vehicleYear:'2012',vehicleModel:'GLK-Class'},'Mercedes 2010–2015')).toBe(true);
  expect(wheelMatchesVehicle({brand:'MERCEDES',vehicleYear:'2022',vehicleModel:'GLK-Class'},'Mercedes 2010–2015')).toBe(false);
  expect(wheelMatchesVehicle({brand:'PORSCHE',vehicleYear:'2018',vehicleModel:'911'},'911 Performance (991)')).toBe(true);
  expect(wheelMatchesVehicle({brand:'PORSCHE',vehicleYear:'2024',vehicleModel:'911'},'911 Performance (992)')).toBe(true);
  expect(wheelMatchesVehicle({brand:'PORSCHE',vehicleYear:'2024',vehicleModel:'Macan'},'911 Performance (992)')).toBe(false);
  expect(wheelMatchesVehicle({brand:'DODGE_SRT',vehicleYear:'2020',vehicleModel:'Charger'},'SRT')).toBe(false);
});

test('source styles expose their reference shapes, LEDs, paddles, and original assets', () => {
  const cases=[
    ['TOYOTA','Supra GR','supra-gr','Flat bottom',true],
    ['MERCEDES','AMG Performance','mercedes-amg','Flat bottom',true],
    ['MERCEDES','Mercedes 2015–2023','mercedes-2015','Round',false],
    ['MERCEDES','Mercedes 2010–2015','mercedes-2010','Round',true],
    ['PORSCHE','911 Performance (991)','porsche-991','Flat bottom',true],
    ['PORSCHE','911 Performance (992)','porsche-992','Flat bottom',true],
    ['DODGE_SRT','SRT','dodge-srt','Flat bottom',false],
  ];
  for(const [brand,wheelStyleType,family,bmwShape,paddles] of cases){
    const cfg={...DEFAULT_CONFIG,brand,wheelStyleType,bmwShape,ledDisplay:true,paddleShifters:'Forged Carbon',heated:false,laneAssist:false};
    expect(bmwFSeriesConfiguration(cfg,()=>null)).toMatchObject({family,led:sourceWheelSupportsLed(cfg),paddle:paddles?'forged':null,lowerTrim:null});
    expect(sourceWheelHasPaddles(cfg)).toBe(paddles);
    const basePrice=brand==='PORSCHE'?1399:brand==='MERCEDES'?(wheelStyleType==='Mercedes 2010–2015'?699.99:799.99):899;
    expect(calcPrice({...cfg,airbagCompat:false})).toBe(basePrice+25*(paddles?1:0)+100);
    const root=path.join(process.cwd(),`public/models/${family}/source`);
    const assets=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
    const names=new Set(assets.filter(asset=>asset.sha256).map(asset=>asset.path));
    for(const shape of sourceWheelShapes(cfg))expect(names.has(`${({Round:'round',Yoke:'yoke','Flat top & bottom':'flat-flat','Flat bottom':'flat-round'})[shape]}.webp`)).toBe(true);
    for(const asset of assets.filter(asset=>asset.sha256))expect(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,asset.path))).digest('hex')).toBe(asset.sha256);
  }
  expect(sourceWheelShapes({brand:'TOYOTA',wheelStyleType:'Supra GR'})).not.toContain('Round');
  expect(fs.existsSync(path.join(process.cwd(),'public/models/dodge-srt/source/pre/round-tb-smooth-9800.webp'))).toBe(true);
});

test('Audi RS 2020+ source maps cover four shapes and retain original bytes', () => {
  const root=path.join(process.cwd(),'public/models/audi-rs-2020/source');
  const assets=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
  const names=new Set(assets.map(a => a.path));
  const calibration=require('./audiRS2020Calibration.json');
  for (const shape of ['round','yoke','flat-flat','flat-round']) {
    expect(names.has(`${shape}.webp`)).toBe(true);
    for (const zone of ['side',shape==='yoke'?'bottom':'tb']) for (const material of ['smooth','perforated','alcantara']) {
      const key=`${shape}-${zone}-${material}`;
      expect(names.has(`grips/${key}-map.webp`)).toBe(true);
      expect(calibration[key]).toBeDefined();
    }
  }
  for (const asset of assets) expect(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,asset.path))).digest('hex')).toBe(asset.sha256);
  const wheel=bmwFSeriesConfiguration({...DEFAULT_CONFIG,brand:'AUDI',wheelStyleType:'RS 2020+',bmwShape:'Flat bottom',ledDisplay:true,airbagCompat:true},()=>null);
  expect(wheel).toMatchObject({family:'audi-rs-2020',shape:'flat-round',led:true,cover:false,paddle:null,lowerTrim:null});
});

test('Audi B9.5 and Mercedes style prices match the advertised starting prices', () => {
  const noOptions={...DEFAULT_CONFIG,airbagCompat:false,heated:false,laneAssist:false};
  expect(wheelStyle('AUDI','RS 2020+')).toMatchObject({label:'Audi B9.5',price:799.99});
  expect(calcPrice({...noOptions,brand:'AUDI',wheelStyleType:'RS 2020+'})).toBe(799.99);
  for(const style of ['AMG Performance','Mercedes 2015–2023']) {
    expect(wheelStyle('MERCEDES',style).price).toBe(799.99);
    expect(calcPrice({...noOptions,brand:'MERCEDES',wheelStyleType:style})).toBe(799.99);
  }
  expect(wheelStyle('MERCEDES','Mercedes 2010–2015').price).toBe(699.99);
  expect(calcPrice({...noOptions,brand:'MERCEDES',wheelStyleType:'Mercedes 2010–2015'})).toBe(699.99);
  expect(calcPrice({...noOptions,brand:'AUDI',wheelStyleType:'RS 2020+',airbagCompat:true,airbagUpgrade:true})).toBe(899.99);
});
