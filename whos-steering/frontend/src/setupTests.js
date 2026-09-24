// CRA's older JSDOM lacks these browser APIs used by React Router and Motion.
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
window.matchMedia = query => ({
  matches: query === '(prefers-reduced-motion)', media: query,
  addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {},
});
global.IntersectionObserver = class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
