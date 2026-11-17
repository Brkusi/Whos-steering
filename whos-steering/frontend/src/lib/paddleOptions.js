import {URUS_FINISHES} from './urusPaddles';
export const UNIVERSAL_PADDLES = ['Magnetic'];
export const URUS_PADDLE_COLORS = URUS_FINISHES.map(f=>f.name);
export const paddleLabel = value => value === 'Magnetic' ? 'Carbon Magnetic' : value;
export const paddleOptions = (originals,brand) => [...new Set([...originals.filter(p=>p!=='Urus Style'), ...UNIVERSAL_PADDLES, ...(brand==='AUDI'?['Urus Style']:[])])];
export const isUniversalPaddle = value => UNIVERSAL_PADDLES.includes(value) || value === 'Urus Style';
export function normalizePaddleDetails(config) {
  const paddleShifters=config.paddleShifters === 'Urus Style' && config.brand !== 'AUDI' ? 'Standard' : config.paddleShifters;
  return {...config,paddleShifters,
    paddleLength:config.paddleLength === 'Long' ? 'Long' : 'Short',
    urusPaddleColor:paddleShifters === 'Urus Style'
      ? (URUS_PADDLE_COLORS.includes(config.urusPaddleColor) ? config.urusPaddleColor : 'Black') : '',
  };
}
