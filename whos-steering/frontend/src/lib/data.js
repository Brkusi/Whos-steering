// ── Leather / Alcantara colors ────────────────────────────────────────────────
export const COLORS = [
  { n: 'Black',       h: '#111111' },
  { n: 'Dark Gray',   h: '#2A2A2A' },
  { n: 'Gray',        h: '#888888' },
  { n: 'White',       h: '#F0F0F0' },
  { n: 'Red',         h: '#CC2200' },
  { n: 'Pink',        h: '#FF69B4' },
  { n: 'Blue',        h: '#0044CC' },
  { n: 'Light Blue',  h: '#4499FF' },
  { n: 'Yellow',      h: '#E8B800' },
  { n: 'Orange',      h: '#E85500' },
  { n: 'Dark Green',  h: '#1A5C2A' },
  { n: 'Lime Green',  h: '#A0E800' },
  { n: 'Purple',      h: '#6A1FA8' },
  { n: 'Brown',       h: '#6B3A2A' },
];

// ── Stripe concepts C-1 through C-9 ──────────────────────────────────────────
// Each entry: label, background (carbon weave) + stripe color(s)
export const STRIPE_CONCEPTS = [
  { id: 'C-1', label: 'C-1 · No Stripe',      stripes: [] },
  { id: 'C-2', label: 'C-2 · Red',            stripes: ['#CC2200'] },
  { id: 'C-3', label: 'C-3 · Yellow',         stripes: ['#E8B800'] },
  { id: 'C-4', label: 'C-4 · Blue',           stripes: ['#4499FF'] },
  { id: 'C-5', label: 'C-5 · White',          stripes: ['#F0F0F0'] },
  { id: 'C-6', label: 'C-6 · Double Dark',    stripes: ['#2A2A2A', '#555'] },
  // C-7: German tri-color (blue | red | yellow)
  { id: 'C-7', label: 'C-7 · Germany',        stripes: ['#4499FF', '#CC2200', '#E8B800'], tri: true },
  // C-8: Italian tri-color (red | yellow)  — mapped to BMW tri
  { id: 'C-8', label: 'C-8 · Italy',          stripes: ['#009246', '#F0F0F0', '#CC2200'], tri: true },
  // C-9: Other tri
  { id: 'C-9', label: 'C-9 · Tri-Accent',     stripes: ['#4499FF', '#F0F0F0', '#1A5C2A'], tri: true },
];

// ── Stitch colors (same palette as COLORS) ───────────────────────────────────
export const STITCH_COLORS = COLORS;

// ── Classic Carbon colors ─────────────────────────────────────────────────────
export const CLASSIC_CARBON_COLORS = [
  { n: 'Black Carbon',        h: '#111111' },
  { n: 'Dark Carbon',         h: '#1A1A1A' },
  { n: 'Green Carbon',        h: '#1A3020' },
  { n: 'Navy Carbon',         h: '#0A1428' },
  { n: 'Dark Blue Carbon',    h: '#0D1A2E' },
  { n: 'Copper Carbon',       h: '#3D1F0A' },
  { n: 'Olive Carbon',        h: '#2A2A10' },
  { n: 'Silver Carbon',       h: '#555555' },
  { n: 'Blue Carbon',         h: '#0A1F6E' },
  { n: 'Purple Carbon',       h: '#2A0A5C' },
  { n: 'Orange Carbon',       h: '#7A2800' },
  { n: 'Red Carbon',          h: '#6E0000' },
];

// ── Forged Carbon colors (with "Flakes" suffix) ───────────────────────────────
export const FORGED_CARBON_COLORS = [
  { n: 'Black Flakes',        h: '#0D0D0D' },
  { n: 'Gold Flakes',         h: '#3A2800' },
  { n: 'Silver Flakes',       h: '#1A1A1A' },
  { n: 'Blue Flakes',         h: '#0A1428' },
  { n: 'Purple Flakes',       h: '#1A0A2E' },
  { n: 'Red Flakes',          h: '#2E0000' },
];

// ── Honeycomb Carbon colors ────────────────────────────────────────────────────
export const HONEYCOMB_CARBON_COLORS = [
  { n: 'Black Honeycomb',     h: '#0A0A0A' },
];

// ── Materials list ─────────────────────────────────────────────────────────────
export const MATS = [
  { n: 'Classic Carbon',      d: '#111111', col: false, carbon: true,  cType: 'classic'   },
  { n: 'Forged Carbon',       d: '#1A1F28', col: false, carbon: true,  cType: 'forged'    },
  { n: 'Honeycomb Carbon',    d: '#0A0A0A', col: false, carbon: true,  cType: 'honeycomb' },
  { n: 'Leather',             d: '#5C3A1E', col: true,  carbon: false  },
  { n: 'Perforated Leather',  d: '#4A2E15', col: true,  carbon: false  },
  { n: 'Alcantara',           d: '#3A3A3A', col: true,  carbon: false  },
];

export const MAT_HEX = {
  'Alcantara':          '#2A2A2A',
  'Leather':            '#3A2010',
  'Perforated Leather': '#342010',
  'Classic Carbon':     '#111111',
  'Forged Carbon':      '#15202E',
  'Honeycomb Carbon':   '#0A0A0A',
};

export const TRIS = {
  germany: { lbl: 'Germany', c1: '#000000', c2: '#DD0000', c3: '#FFCC00' },
  bmw:     { lbl: 'BMW',     c1: '#87CEEB', c2: '#003DA5', c3: '#CC0000' },
  italy:   { lbl: 'Italy',   c1: '#009246', c2: '#F0F0F0', c3: '#CC0000' },
};

export const DEFAULT_CONFIG = {
  brand: 'BMW', vehicleYear: '', vehicleModel: '',
  wheelStyle: 'Standard', paddleShifters: 'Standard',
  topBottomMat: 'Alcantara', topBottomCol: null, topBottomCarbonCol: null,
  sideMat: 'Alcantara', sideCol: null, sideCarbonCol: null,
  stripeConceptId: 'C-1', stripeCustomColor: '',
  stitchColor: null, stitchCustomColor: '',
  airbagCompat: true, airbagUpgrade: false, heated: true, laneAssist: true,
  audiBadge: 'RS', outerTrimCol: null, innerTrimCol: null,
  photoUrl: null,
  customNotes: '',
};

export function colorName(h) {
  if (!h) return '—';
  return COLORS.find(c => c.h === h)?.n || h;
}

// ── Audi preset products (frontend-only, no DB needed) ────────────────────────
export const AUDI_PRESETS = [
  {
    id: 'audi-pre-1',
    brand: 'AUDI',
    name: 'RS SPORT EDITION',
    description: 'Full Alcantara grip, RS badge, Germany tri-color stripe, magnetic paddle shifters.',
    base_price: 1129.99,
    stripe_color: '#CC0000',
    features: ['RS Badge', 'Germany Tri-Color', 'Full Alcantara', 'Magnetic Paddles', 'Heated', 'Airbag Compatible'],
    isPreset: true,
  },
  {
    id: 'audi-pre-2',
    brand: 'AUDI',
    name: 'S LINE CARBON',
    description: 'Classic carbon top, perforated leather sides, S badge, red single stripe.',
    base_price: 1199.99,
    stripe_color: '#CC2200',
    features: ['S Badge', 'Red Stripe', 'Classic Carbon Top', 'Perf. Leather Sides', 'Heated', 'Lane Assist'],
    isPreset: true,
  },
  {
    id: 'audi-pre-3',
    brand: 'AUDI',
    name: 'RS FORGED PRO',
    description: 'Forged carbon black flakes top, Alcantara sides, RS badge, no stripe clean finish.',
    base_price: 1349.99,
    stripe_color: '#111111',
    features: ['RS Badge', 'Forged Carbon Top', 'Alcantara Sides', 'Standard Paddles', 'Heated', 'Airbag Compatible'],
    isPreset: true,
  },
  {
    id: 'audi-pre-4',
    brand: 'AUDI',
    name: 'CLASSIC ALCANTARA',
    description: 'Full Alcantara build, S badge, white single stripe, outer gold trim ring.',
    base_price: 999.99,
    stripe_color: '#F0F0F0',
    features: ['S Badge', 'White Stripe', 'Full Alcantara', 'Gold Outer Trim', 'Heated', 'Lane Assist'],
    isPreset: true,
  },
];

// ── Augmented AUDI_PRESETS with images/compat/desc for Catalog ────────────────
// Overwrite the export with full data
export const AUDI_PRESETS_FULL = [
  {
    id: 'rs-sig-carbon',
    brand: 'AUDI',
    name: 'RS SIGNATURE CARBON',
    base_price: 789.99,
    compat: 'Fits 2011+ AUDI All Models',
    features: ['Magnetic Paddle Shifters','Classic Carbon Top & Bottom','Perforated Leather Sides','S or RS Badging Option','Airbag Cover Compatible','Heated Steering'],
    images: ['/PRESET_1.png', '/PRESET_1_2.png'],
    desc: 'A bold carbon-forward build with perforated leather sides and magnetic paddle shifters. Available with S or RS badging.',
    isPreset: true,
  },
  {
    id: 'rs-stealth',
    brand: 'AUDI',
    name: 'RS STEALTH',
    base_price: 779.99,
    compat: 'Fits 2011+ AUDI All Models',
    features: ['Magnetic Paddle Shifters','Full Alcantara Grip','Carbon Fiber Accents','RS Badging','Airbag Cover Compatible','Heated Steering'],
    images: ['/PRESET_2.png', '/PRESET_2_2.png'],
    desc: 'Blacked-out Alcantara all around with carbon fibre accents. Understated, aggressive, and purpose-built.',
    isPreset: true,
  },
];
