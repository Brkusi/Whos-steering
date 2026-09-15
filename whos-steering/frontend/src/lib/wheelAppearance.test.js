import { wheelAppearance } from './wheelAppearance';
import { DEFAULT_CONFIG } from './data';

const parse = s => /^#[a-f\d]{6}$/i.test(s) ? s : null;
test('restored carbon builds use carbon colors rather than stale leather colors', () => {
  const result = wheelAppearance({...DEFAULT_CONFIG, topBottomMat:'Forged Carbon',topBottomCarbonCol:'#6e0000',topBottomCol:'#ffffff'},parse);
  expect(result.top).toEqual({material:'Forged Carbon',color:'#6e0000'});
});
test('custom colors override palettes and a custom stripe can override No Stripe', () => {
  const result = wheelAppearance({...DEFAULT_CONFIG, topBottomCustomColor:'#abcdef',topBottomCol:'#ffffff',stripeConceptId:'C-1',stripeCustomColor:'#123456'},parse);
  expect(result.top.color).toBe('#abcdef'); expect(result.stripes).toEqual(['#123456']);
});
test('Germany stripe preserves its three colors; No Stripe clears them', () => {
  expect(wheelAppearance({...DEFAULT_CONFIG,stripeConceptId:'C-13'},parse).stripes).toEqual(['#000000','#DD0000','#FFCC00']);
  expect(wheelAppearance({...DEFAULT_CONFIG,stripeConceptId:'C-1'},parse).stripes).toEqual([]);
});
test('turning off the cover upgrade suppresses stale cover options without mutating the order', () => {
  const cfg={...DEFAULT_CONFIG,airbagCompat:false,airbagMat:'Alcantara',airbagCol:'#ff0000',audiLogoCol:'#ff0000',airbagUpgrade:false};
  const result=wheelAppearance(cfg,parse);
  expect(result.airbag).toEqual({material:'Smooth Leather',color:'#292929'});
  expect(result.logo).toBe('#c5c9ce');expect(cfg.airbagCol).toBe('#ff0000');expect(cfg.airbagUpgrade).toBe(false);
});
test('unsupported custom instructions are surfaced rather than treated as accurate colors', () => {
  const result=wheelAppearance({...DEFAULT_CONFIG,stitchCustomColor:'Red and gold alternating'},parse);
  expect(result.unresolved).toContain('Red and gold alternating');expect(result.stitch).toBe('#696969');
});
