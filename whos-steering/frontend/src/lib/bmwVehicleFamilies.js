// BMW's public model names omit the platform code. These ranges use US model
// years, not production dates. Overlap years return both possible generations;
// the customer's wheel photo still determines final fitment.
export function bmwVehicleFamilies(yearValue, modelValue) {
  const year = Number(yearValue);
  const model = String(modelValue || '').trim().toUpperCase().replace(/\s+/g, ' ');
  if (!Number.isInteger(year) || year < 2010 || year > 2025 || !model) return [];

  const code = /\b(E9[0-3]|F\d{2}|G\d{2})\b/.exec(model)?.[1];
  if (code) return [code.startsWith('E') ? 'E90' : code[0]];

  if (/^(?:1M|128I|135I|ACTIVEE|I3|I8|IX)$/.test(model)) return [];
  if (/^335IS$/.test(model)) return year <= 2013 ? ['E90'] : [];
  if (/^M3\b/.test(model)) return year <= 2013 ? ['E90'] : year >= 2015 && year <= 2018 ? ['F'] : year >= 2021 ? ['G'] : [];
  if (model === 'M340I') return year >= 2020 ? ['G'] : [];
  if (/^(?:3\d{2}(?:I|D|E)?|ACTIVEHYBRID 3)$/.test(model)) {
    if (year <= 2011) return ['E90'];
    if (year <= 2013) return ['E90', 'F'];
    if (year <= 2018 || (year === 2019 && model === '340I')) return ['F'];
    return ['G'];
  }

  if (/^(?:228I|M235I|M235)$/.test(model)) return year >= 2014 ? ['F'] : [];
  if (/^(?:230I|M240I)$/.test(model)) return year >= 2022 ? ['G'] : year >= 2017 ? ['F'] : [];
  if (/^M2$/.test(model)) return year >= 2023 ? ['G'] : year >= 2016 && year <= 2021 ? ['F'] : [];
  if (/^(?:4\d{2}I|M440I|M4)$/.test(model)) return year >= 2021 ? ['G'] : year >= 2014 ? ['F'] : [];

  if (/^M5$/.test(model)) return year >= 2025 ? ['G'] : year >= 2012 && year <= 2023 ? ['F'] : [];
  if (/^(?:M550I|550E)$/.test(model)) return year >= 2017 ? ['G'] : [];
  if (/^(?:530[EI]|540[ID])$/.test(model)) return year >= 2017 ? ['G'] : [];
  if (/^(?:5\d{2}(?:I|D|XI)?|ACTIVEHYBRID 5)$/.test(model)) return year >= 2011 ? ['F'] : [];

  if (model === '640I') return year >= 2012 && year <= 2019 ? ['F'] : [];
  if (model === '640XI') return year >= 2018 && year <= 2019 ? ['F', 'G'] : year >= 2012 ? ['F'] : [];
  if (/^(?:650I(?:, (?:ALPINA )?B6)?|650XI|M6|B6)$/.test(model)) return year >= 2012 ? ['F'] : [];
  if (/^(?:M760I|M760LI|74\d(?:I|LI|E|LE)|75\d(?:I|LI|LXI|XI|E)|760(?:I|LI)|ACTIVEHYBRID 7|B7)(?:, (?:ALPINA )?B7)?$/.test(model)) return year >= 2016 ? ['G'] : ['F'];

  if (/^M8$/.test(model)) return year >= 2019 ? ['F'] : [];
  if (/^(?:840I|850I|M850I|ALPINA B8)$/.test(model)) return year >= 2019 ? ['G'] : [];

  if (/^X1\b/.test(model)) return year >= 2016 && year <= 2022 ? ['F'] : [];
  if (/^X2\b/.test(model)) return year >= 2018 && year <= 2023 ? ['F'] : [];
  if (/^X3\b/.test(model)) return year >= 2018 ? ['G'] : year >= 2011 ? ['F'] : [];
  if (/^X4\b/.test(model)) return year >= 2019 ? ['G'] : year >= 2015 ? ['F'] : [];
  if (/^X5\b/.test(model)) return year >= 2019 ? ['G'] : year >= 2014 ? ['F'] : [];
  if (/^X6\b/.test(model)) return year >= 2020 ? ['G'] : year >= 2015 ? ['F'] : [];
  if (/^X7\b/.test(model)) return year >= 2019 ? ['G'] : [];
  if (/^Z4\b/.test(model)) return year >= 2019 ? ['G'] : [];
  if (/^(?:I4|I5|I7|XM)$/.test(model)) return year >= 2022 ? ['G'] : [];

  return [];
}
