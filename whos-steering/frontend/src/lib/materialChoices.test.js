import { materialChoices, materialLabel, SIDE_MATS, TOP_BOTTOM_MATS, MAT_HEX } from './data';

test('perforated side grips remain available alongside every carbon top', () => {
  for (const carbon of TOP_BOTTOM_MATS.filter(material => material.carbon)) {
    expect(materialChoices(SIDE_MATS, carbon.cType, 'sideMat').map(material => material.n))
      .toEqual(expect.arrayContaining(['Smooth Leather', 'Perforated Leather', 'Alcantara']));
  }
});

test('Alcantara uses the new display name without changing the stored material key', () => {
  expect(materialLabel('Alcantara')).toBe('Alcantara/Suede');
  expect(SIDE_MATS.map(material => material.n)).toContain('Alcantara');
  expect(MAT_HEX.Alcantara).toBeDefined();
});
