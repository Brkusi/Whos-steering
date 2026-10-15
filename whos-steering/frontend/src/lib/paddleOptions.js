export const UNIVERSAL_PADDLES = ['Magnetic', 'Urus Style'];
export const URUS_PADDLE_COLORS = ['Red', 'Blue', 'Yellow', 'Black'];
export const paddleLabel = value => value === 'Magnetic' ? 'Carbon Magnetic' : value;
export const paddleOptions = originals => [...new Set([...originals, ...UNIVERSAL_PADDLES])];
export const isUniversalPaddle = value => UNIVERSAL_PADDLES.includes(value);
export function normalizePaddleDetails(config) {
  return {...config,
    paddleLength:config.paddleLength === 'Long' ? 'Long' : 'Short',
    urusPaddleColor:config.paddleShifters === 'Urus Style'
      ? (URUS_PADDLE_COLORS.includes(config.urusPaddleColor) ? config.urusPaddleColor : 'Black') : '',
  };
}
