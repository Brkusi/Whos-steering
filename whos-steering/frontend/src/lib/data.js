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

// ── Stripe concepts (image-based) ────────────────────────────────────────────
export const STRIPE_CONCEPTS = [
  { id: 'C-1',  label: 'No Stripe',       img: '/stripes/stripe-none.jpg',       stripes: [] },
  { id: 'C-2',  label: 'Black',           img: '/stripes/stripe-black.jpg',       stripes: ['#111111'] },
  { id: 'C-3',  label: 'Pink',            img: '/stripes/stripe-pink.jpg',        stripes: ['#FF69B4'] },
  { id: 'C-4',  label: 'Dark Blue',       img: '/stripes/stripe-dark-blue.jpg',   stripes: ['#0044CC'] },
  { id: 'C-5',  label: 'Light Blue',      img: '/stripes/stripe-light-blue.jpg',  stripes: ['#4499FF'] },
  { id: 'C-6',  label: 'Red',             img: '/stripes/stripe-red.jpg',         stripes: ['#CC2200'] },
  { id: 'C-7',  label: 'Orange',          img: '/stripes/stripe-orange.jpg',      stripes: ['#E85500'] },
  { id: 'C-8',  label: 'Dark Green',      img: '/stripes/stripe-dark-green.jpg',  stripes: ['#1A5C2A'] },
  { id: 'C-9',  label: 'Lime Green',      img: '/stripes/stripe-lime-green.jpg',  stripes: ['#A0E800'] },
  { id: 'C-10', label: 'Purple',          img: '/stripes/stripe-purple.jpg',      stripes: ['#6A1FA8'] },
  { id: 'C-11', label: 'Brown',           img: '/stripes/stripe-brown.jpg',       stripes: ['#6B3A2A'] },
  { id: 'C-12', label: 'BMW Tri Color',   img: '/stripes/stripe-bmw-tri.jpg',     stripes: ['#87CEEB','#003DA5','#CC0000'], tri: true, triKey: 'bmw' },
  { id: 'C-13', label: 'German Tri Color',img: '/stripes/stripe-german-tri.jpg',  stripes: ['#000000','#DD0000','#FFCC00'], tri: true, triKey: 'germany' },
];

// ── Stitch colors with real photos ───────────────────────────────────────────
export const STITCH_COLORS = [
  { n: 'Black',       h: '#111111', img: '/stitches/stitch-black.jpg' },
  { n: 'Brown',       h: '#6B3A2A', img: '/stitches/stitch-brown.jpg' },
  { n: 'Dark Green',  h: '#1A5C2A', img: '/stitches/stitch-dark-green.jpg' },
  { n: 'Grey',        h: '#888888', img: '/stitches/stitch-grey.jpg' },
  { n: 'Light Blue',  h: '#4499FF', img: '/stitches/stitch-light-blue.jpg' },
  { n: 'Light Green', h: '#A0E800', img: '/stitches/stitch-light-green.jpg' },
  { n: 'Navy Blue',   h: '#0A1F6E', img: '/stitches/stitch-navy-blue.jpg' },
  { n: 'Orange',      h: '#E85500', img: '/stitches/stitch-orange.jpg' },
  { n: 'Pink',        h: '#FF69B4', img: '/stitches/stitch-pink.jpg' },
  { n: 'Purple',      h: '#6A1FA8', img: '/stitches/stitch-purple.jpg' },
  { n: 'Red',         h: '#CC2200', img: '/stitches/stitch-red.jpg' },
  { n: 'White',       h: '#F0F0F0', img: '/stitches/stitch-white.jpg' },
  { n: 'Yellow',      h: '#E8B800', img: '/stitches/stitch-yellow.jpg' },
];

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

// ── Forged Carbon colors (image-based) ───────────────────────────────────────
export const FORGED_CARBON_COLORS = [
  { n: 'Classic',  h: '#111111', img: '/forged/forged-classic.jpg' },
  { n: 'Purple',   h: '#1A0A2E', img: '/forged/forged-purple.jpg'  },
  { n: 'Green',    h: '#0A2E10', img: '/forged/forged-green.jpg'   },
  { n: 'Gold',     h: '#3A2800', img: '/forged/forged-gold.jpg'    },
  { n: 'Blue',     h: '#0A1428', img: '/forged/forged-blue.jpg'    },
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

// Top & Bottom only — no Perforated Leather
export const TOP_BOTTOM_MATS = [
  { n: 'Classic Carbon',      d: '#111111', col: false, carbon: true,  cType: 'classic'   },
  { n: 'Forged Carbon',       d: '#1A1F28', col: false, carbon: true,  cType: 'forged'    },
  { n: 'Honeycomb Carbon',    d: '#0A0A0A', col: false, carbon: true,  cType: 'honeycomb' },
  { n: 'Classic Leather',     d: '#5C3A1E', col: true,  carbon: false  },
  { n: 'Alcantara',           d: '#3A3A3A', col: true,  carbon: false  },
];

// Sides — all options including Perforated
export const SIDE_MATS = [
  { n: 'Classic Carbon',      d: '#111111', col: false, carbon: true,  cType: 'classic'   },
  { n: 'Forged Carbon',       d: '#1A1F28', col: false, carbon: true,  cType: 'forged'    },
  { n: 'Honeycomb Carbon',    d: '#0A0A0A', col: false, carbon: true,  cType: 'honeycomb' },
  { n: 'Classic Leather',     d: '#5C3A1E', col: true,  carbon: false  },
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
  wheelStyleType: 'RS',
  startStopButtons: false,
  ledDisplay: false,
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

// Alias used by Catalog.jsx
export const AUDI_PRESETS_FULL = AUDI_PRESETS;
