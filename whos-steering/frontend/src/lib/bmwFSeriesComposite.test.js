import { stripeColorIndex } from './bmwFSeriesComposite';

test('faint stripe pixels outside the opaque bounds retain an edge color', () => {
  for (const count of [1, 3]) {
    for (let x = 0; x < 1024; x++) {
      const index = stripeColorIndex(x, 490, 534, count);
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(count);
    }
    expect(stripeColorIndex(489, 490, 534, count)).toBe(0);
    expect(stripeColorIndex(535, 490, 534, count)).toBe(count - 1);
  }
  expect([490, 512, 534].map(x => stripeColorIndex(x, 490, 534, 3))).toEqual([0, 1, 2]);
});
