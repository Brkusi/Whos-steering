export const COLORS = [
  { n: 'Black',       h: '#111111' }, { n: 'Dark Gray',  h: '#2A2A2A' },
  { n: 'Gray',        h: '#888888' }, { n: 'White',       h: '#F0F0F0' },
  { n: 'Red',         h: '#CC2200' }, { n: 'Pink',        h: '#FF69B4' },
  { n: 'Blue',        h: '#0044CC' }, { n: 'Light Blue',  h: '#4499FF' },
  { n: 'Yellow',      h: '#E8B800' }, { n: 'Orange',      h: '#E85500' },
  { n: 'Dark Green',  h: '#1A5C2A' }, { n: 'Lime Green',  h: '#A0E800' },
  { n: 'Purple',      h: '#6A1FA8' }, { n: 'Brown',       h: '#6B3A2A' },
];

export const MATS = [
  { n: 'Carbon Fiber',        d: '#222831', col: false },
  { n: 'Forged Carbon',       d: '#1A1F28', col: false },
  { n: 'Leather',             d: '#5C3A1E', col: true  },
  { n: 'Perforated Leather',  d: '#4A2E15', col: true  },
  { n: 'Alcantara',           d: '#3A3A3A', col: true  },
];

export const MAT_HEX = {
  'Alcantara': '#2A2A2A', 'Leather': '#3A2010',
  'Perforated Leather': '#342010', 'Carbon Fiber': '#1A2030',
  'Forged Carbon': '#15202E',
};

export const TRIS = {
  germany: { lbl: 'Germany', c1: '#000000', c2: '#DD0000', c3: '#FFCC00' },
  bmw:     { lbl: 'BMW',     c1: '#87CEEB', c2: '#003DA5', c3: '#CC0000' },
};

export const DEFAULT_CONFIG = {
  brand: 'BMW', vehicleYear: '', vehicleModel: '',
  wheelStyle: 'Standard', paddleShifters: 'Standard',
  topBottomMat: 'Alcantara', topBottomCol: null,
  sideMat: 'Alcantara', sideCol: null,
  stripeMode: 'none', stripeColor: null, triKey: null,
  airbagCompat: true, heated: true, laneAssist: true,
  audiBadge: 'RS', outerTrimCol: null, innerTrimCol: null,
  photoUrl: null,
};

export function colorName(h) {
  if (!h) return '—';
  return COLORS.find(c => c.h === h)?.n || h;
}
