import {paddleOptions,normalizePaddleDetails,paddleLabel} from './paddleOptions';
import {normalizeB85Options} from './audiB85Configuration';
import {bmwFSeriesConfiguration} from './bmwFSeriesConfiguration';
import {audiB9Configuration,audiB9Parts} from './audiB9Configuration';
import {DEFAULT_CONFIG,TOP_BOTTOM_MATS} from './data';
import {calcPrice} from './api';

test('universal paddles survive saved builds and carry the correct price',()=>{
  for(const [brand,wheelStyleType] of [['BMW','G-Series Pre LCI'],['AUDI','B8.5'],['AUDI','RS 2020+'],['MERCEDES','Mercedes 2015–2023'],['DODGE_SRT','SRT']]){
    const base={...DEFAULT_CONFIG,brand,wheelStyleType,heated:false,laneAssist:false,airbagCompat:false};
    for(const paddleShifters of ['Magnetic','Urus Style']){
      const cfg=normalizePaddleDetails(normalizeB85Options({...base,paddleShifters,paddleLength:'Long',urusPaddleColor:'Red'}));
      expect(cfg.paddleShifters).toBe(paddleShifters);
      expect(cfg.paddleLength).toBe('Long');
      expect(cfg.urusPaddleColor).toBe(paddleShifters==='Urus Style'?'Red':'');
      expect(calcPrice(cfg)-calcPrice(base)).toBe(25);
    }
  }
  expect(paddleOptions(['Standard'])).toEqual(['Standard','Magnetic','Urus Style']);
  expect(paddleLabel('Magnetic')).toBe('Carbon Magnetic');
});

test('matte carbon ignores stale custom color and uses carbon geometry',()=>{
  expect(TOP_BOTTOM_MATS.some(m=>m.n==='Matte Carbon')).toBe(true);
  const cfg={...DEFAULT_CONFIG,brand:'AUDI',wheelStyleType:'B9',topBottomMat:'Matte Carbon',topBottomCustomColor:'red'};
  const a=audiB9Configuration(cfg,()=> '#ff0000');
  expect(a.top.color).toBe('#111111');expect(audiB9Parts(a).top).toBe(1);
  const g=bmwFSeriesConfiguration({...cfg,brand:'BMW',wheelStyleType:'G-Series Pre LCI'},()=> '#ff0000');
  expect(g.carbonCustomTint).toBe(false);expect(g.carbonSwatch).toBe('/matte-carbon-gseries.png');
});
