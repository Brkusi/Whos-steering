import { VEHICLE_MAKES, isConfigurableMake, wheelMatchesVehicle } from './vehicleCompatibility';
import { bmwFSeriesConfiguration } from './bmwFSeriesConfiguration';
import { DEFAULT_CONFIG } from './data';
const fs = require('fs'), path = require('path'), crypto = require('crypto');

test('make selection separates available wheels from requests for fitment', () => {
  expect(VEHICLE_MAKES.map(item => item.label)).toEqual(['Audi','BMW','Dodge SRT','Mercedes','Toyota','Porsche']);
  expect(VEHICLE_MAKES.filter(item => isConfigurableMake(item.value)).map(item => item.label)).toEqual(['Audi','BMW']);
});

test('compatibility label needs a fitting year and model', () => {
  expect(wheelMatchesVehicle({brand:'AUDI',vehicleYear:'2022',vehicleModel:'RS 6'},'RS 2020+')).toBe(true);
  expect(wheelMatchesVehicle({brand:'AUDI',vehicleYear:'2018',vehicleModel:'RS 6'},'RS 2020+')).toBe(false);
  expect(wheelMatchesVehicle({brand:'AUDI',vehicleYear:'2022',vehicleModel:'A4'},'RS 2020+')).toBe(false);
  expect(wheelMatchesVehicle({brand:'AUDI',vehicleYear:'2022',vehicleModel:'A4'},'B9')).toBe(true);
  expect(wheelMatchesVehicle({brand:'AUDI',vehicleYear:'2026',vehicleModel:'A4'},'B9')).toBe(false);
  expect(wheelMatchesVehicle({brand:'BMW',vehicleYear:'2018',vehicleModel:'F30'},'F-Series')).toBe(true);
  expect(wheelMatchesVehicle({brand:'BMW',vehicleYear:'2018',vehicleModel:'G20'},'F-Series')).toBe(false);
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
