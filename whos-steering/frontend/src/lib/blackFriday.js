export const BLACK_FRIDAY_START = Date.parse('2026-11-11T00:00:00-05:00');
export const BLACK_FRIDAY_END = Date.parse('2026-11-29T00:00:00-05:00');
export const BLACK_FRIDAY_DATES = 'Nov 11–28';
export const blackFridayActive = (now = Date.now()) => now >= BLACK_FRIDAY_START && now < BLACK_FRIDAY_END;
export const customWheelPrice = (regular, readyToShip = false, now = Date.now()) => blackFridayActive(now) && !readyToShip ? Math.round(Math.round(regular * 100) * .9) / 100 : regular;
