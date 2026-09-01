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
  { n: 'Dark Blue',   h: '#0A1F6E', img: '/stitches/stitch-navy-blue.jpg' },
  { n: 'Orange',      h: '#E85500', img: '/stitches/stitch-orange.jpg' },
  { n: 'Pink',        h: '#FF69B4', img: '/stitches/stitch-pink.jpg' },
  { n: 'Purple',      h: '#6A1FA8', img: '/stitches/stitch-purple.jpg' },
  { n: 'Red',         h: '#CC2200', img: '/stitches/stitch-red.jpg' },
  { n: 'White',       h: '#F0F0F0', img: '/stitches/stitch-white.jpg' },
  { n: 'Yellow',      h: '#E8B800', img: '/stitches/stitch-yellow.jpg' },
];

// ── Classic Carbon colors (image-based) ────────────────────────────────────
export const CLASSIC_CARBON_COLORS = [
  { n: 'Black Carbon',              h: '#111111', img: '/classic/classic-black.png', rec: true },
  { n: 'Black & Blue Carbon',       h: '#0A1F6E', img: '/classic/classic-black-blue.png' },
  { n: 'Black & Gold Carbon',       h: '#3A2800', img: '/classic/classic-black-gold.png' },
  { n: 'Black & Green Carbon',      h: '#1A3020', img: '/classic/classic-black-green.png' },
  { n: 'Black & Orange Carbon',     h: '#7A2800', img: '/classic/classic-black-orange.png' },
  { n: 'Black & Purple Carbon',     h: '#2A0A5C', img: '/classic/classic-black-purple.png' },
  { n: 'Black & Red Carbon',        h: '#6E0000', img: '/classic/classic-black-red.png' },
  { n: 'Black & Silver Carbon',     h: '#555555', img: '/classic/classic-black-silver.png' },
  { n: 'Lime Green & Black Carbon', h: '#3A5C00', img: '/classic/classic-limegreen-black.png' },
];

// ── Forged Carbon colors (image-based) ───────────────────────────────────────
export const FORGED_CARBON_COLORS = [
  { n: 'Classic',  h: '#111111', img: '/forged/forged-classic.jpeg' },
  { n: 'Purple',   h: '#1A0A2E', img: '/forged/forged-purple.jpeg'  },
  { n: 'Green',    h: '#0A2E10', img: '/forged/forged-green.jpeg'   },
  { n: 'Gold',     h: '#3A2800', img: '/forged/forged-gold.jpeg'    },
  { n: 'Blue',     h: '#0A1428', img: '/forged/forged-blue.jpeg'    },
];

// ── Honeycomb Carbon colors ────────────────────────────────────────────────────
export const HONEYCOMB_CARBON_COLORS = [
  { n: 'Black Honeycomb',     h: '#0A0A0A', img: '/HoneyComb.jpeg' },
];

// ── Airbag material + color options ──────────────────────────────────────────
export const AIRBAG_MATS = [
  { n: 'Alcantara',       col: true },
  { n: 'Smooth Leather',  col: true },
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
  { n: 'Classic Leather',     d: '#5C3A1E', col: true,  carbon: false  },
  { n: 'Classic Carbon',      d: '#111111', col: false, carbon: true,  cType: 'classic'   },
  { n: 'Forged Carbon',       d: '#1A1F28', col: false, carbon: true,  cType: 'forged'    },
  { n: 'Honeycomb Carbon',    d: '#0A0A0A', col: false, carbon: true,  cType: 'honeycomb' },
  { n: 'Alcantara',           d: '#3A3A3A', col: true,  carbon: false  },
];

// Sides — no carbon options, Perforated included
export const SIDE_MATS = [
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
  wheelStyle: 'Standard', paddleShifters: 'Standard', paddleLength: 'Short',
  topBottomMat: 'Classic Leather', topBottomCol: null, topBottomCarbonCol: null, topBottomCustomColor: '',
  wheelStyleType: 'B9',
  startStopButtons: false,
  ledDisplay: false,
  sideMat: 'Alcantara', sideCol: null, sideCarbonCol: null, sideCustomColor: '',
  stripeConceptId: 'C-1', stripeCustomColor: '',
  stitchColor: null, stitchCustomColor: '',
  airbagCompat: false, airbagUpgrade: false, heated: false, laneAssist: false,
  airbagMat: null, airbagCol: null, airbagCustomColor: '',
  airbagStitchColor: null, airbagStitchCustomColor: '',
  audiLogoCol: null, audiLogoCustomColor: '',
  audiBadge: 'RS', plasticTrimCol: null, plasticTrimCustomColor: '', innerTrimCol: null, innerTrimCustomColor: '', innerTrimMatchCarbon: false,
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
    name: 'RS CARBON',
    base_price: 729.99,
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
    base_price: 679.99,
    compat: 'Fits 2011+ AUDI All Models',
    features: ['Magnetic Paddle Shifters','Full Alcantara Grip','Carbon Fiber Accents','RS Badging','Airbag Cover Compatible','Heated Steering'],
    images: ['/PRESET_2.png', '/PRESET_2_2.png'],
    desc: 'Blacked-out Alcantara all around with carbon fibre accents. Understated, aggressive, and purpose-built.',
    isPreset: true,
  },
  {
    id: 'audi-flagship-carbon',
    brand: 'AUDI',
    name: 'FLAGSHIP CARBON',
    base_price: 799.99,
    compat: 'Fits All Audi Models 2011+',
    features: [
      'Alcantara Sides & Airbag',
      'Carbon Fiber Top & Bottom',
      'Carbon Fiber Paddles',
      'Gloss Black Inlay',
      'Red 12 Stripe',
    ],
    images: ['/AUDI_PRESET_3.png'],
    desc: 'Carbon fiber top and bottom with Alcantara sides, gloss black inlay, and a bold red stripe. The flagship Audi build.',
    isPreset: true,
  }
];

// Alias used by Catalog.jsx
export const AUDI_PRESETS_FULL = AUDI_PRESETS;


// ── Infiniti preset products (catalog-only; customization not available yet) ─
export const INFINITI_PRESETS = [
  {
    id: 'infiniti-purple-rain',
    brand: 'INFINITI',
    name: 'PURPLE RAIN',
    base_price: 399.99,
    compat: 'Fits Infiniti G25, G35, G37 & G37X (2009–2013)',
    vehicleYear: '2009–2013',
    vehicleModel: 'G25 / G35 / G37 / G37X',
    features: [
      'Purple Carbon Fiber',
      'Alcantara Side Grips',
      'Black Stitching',
    ],
    images: [
      '/infiniti/purple-rain-1.jpg',
      '/infiniti/purple-rain-2.png',
      '/infiniti/purple-rain-3.jpg',
      '/infiniti/purple-rain-4.jpg',
    ],
    desc: 'Purple carbon fiber paired with Alcantara side grips and black stitching. Built specifically for Infiniti G25, G35, G37 and G37X models from 2009–2013.',
    isPreset: true,
    customizable: false,
    allowAirbagCover: false,
    allowAirbagUpgrade: false,
    allowHeated: false,
    allowLaneAssist: false,
    statusBadge: 'PRESET',
    productTypeLabel: 'INFINITI · PRESET BUILD',
    fixedInfoTitle: 'FIXED INFINITI PRESET',
    fixedInfoBody: 'Purple Rain is sold exactly as shown. Infiniti customization is not available yet. This build has no airbag, heated-steering, or lane-assist options.',
    fixedBuildNote: 'Fixed build · Sold as shown',
    footerMeta: '🛡 6 Month Warranty · ⏱ 3–4 Week Build · Made to Order',
    fixedConfig: {
      topBottomMat: 'Purple Carbon Fiber',
      topBottomCarbonCol: 'Purple',
      sideMat: 'Alcantara',
      sideCol: '#111111',
      stitchColor: '#111111',
      stripe: 'No Stripe',
    },
  },
  {
    id: 'infiniti-gold-rush',
    brand: 'INFINITI',
    name: 'GOLD RUSH',
    base_price: 399.99,
    compat: 'Fits Infiniti G25, G35, G37 & G37X (2009–2013)',
    vehicleYear: '2009–2013',
    vehicleModel: 'G25 / G35 / G37 / G37X',
    features: [
      'Gold Carbon Fiber',
      'Black Perforated Side Grips',
      'Black Stripe',
      'Black Stitching',
    ],
    images: [
      '/infiniti/gold-rush-1.jpg',
      '/infiniti/gold-rush-2.jpg',
      '/infiniti/gold-rush-3.jpg',
      '/infiniti/gold-rush-4.jpg',
    ],
    desc: 'Gold carbon fiber with black perforated side grips and a black top stripe. This wheel is already made, sold exactly as shown, and ready to ship for Infiniti G25, G35, G37 and G37X models from 2009–2013.',
    isPreset: true,
    customizable: false,
    readyToShip: true,
    allowAirbagCover: false,
    allowAirbagUpgrade: false,
    allowHeated: false,
    allowLaneAssist: false,
    statusBadge: 'READY TO SHIP',
    productTypeLabel: 'INFINITI · READY TO SHIP',
    fixedInfoTitle: 'READY TO SHIP INFINITI WHEEL',
    fixedInfoBody: 'Gold Rush is already made and ships exactly as shown. Infiniti customization is not available yet. This wheel includes a black stripe and has no airbag, heated-steering, or lane-assist options.',
    fixedBuildNote: 'Ready to ship · Already made',
    footerMeta: '🛡 6 Month Warranty · Ready to Ship · Already Made',
    fixedConfig: {
      topBottomMat: 'Gold Carbon Fiber',
      topBottomCarbonCol: 'Gold',
      sideMat: 'Perforated Leather',
      sideCol: '#111111',
      stitchColor: '#111111',
      stripe: 'Black',
    },
  },
];

// ── BMW Preset products ───────────────────────────────────────────────────────
export const BMW_PRESETS = [
  {
    id: 'bmw-touch-of-taste',
    brand: 'BMW',
    name: 'TOUCH OF TASTE',
    base_price: 549.99,
    compat: 'Fits F10, F30, G20, G30',
    features: [
      'G-Series Style',
      'Carbon Fiber Inlays',
      'Carbon Fiber Paddle Shifters',
      'Red Stripe at Top',
      'Option for M1 & M2 Buttons',
      'Red & Blue Dual Stitching',
    ],
    images: ['/BMW_PRESET_1.png'],
    desc: 'A refined BMW build with G-Series styling, carbon fiber inlays, and dual red & blue stitching. Clean, purposeful, and unmistakably M.',
    isPreset: true,
  },
  {
    id: 'bmw-m-sport-carbon',
    brand: 'BMW',
    name: 'M SPORT CARBON',
    base_price: 649.99,
    compat: 'Fits F10, F30, G20, G30',
    features: [
      'G-Series Style',
      'Carbon Fiber Base',
      'Perforated Leather Sides',
      'Carbon Fiber Inlays',
      'Carbon Fiber Paddle Shifters',
      'Option for M1 & M2 Buttons',
      'Red & Blue Dual Stitching',
    ],
    images: ['/BMW_PRESET_2.png'],
    desc: 'Full carbon fiber base with perforated leather sides and signature M stitching. Built for the driver who demands performance in every detail.',
    isPreset: true,
  },
  ,
  {
    id: 'bmw-m-stealth',
    brand: 'BMW',
    name: 'M STEALTH',
    base_price: 599.99,
    compat: 'Fits F10, F30, G20, G30',
    features: [
      'G-Series Style',
      'Fully Alcantara',
      'Carbon Fiber Inlays',
      'Carbon Fiber Paddle Shifters',
      'Red Stripe at Top',
      'Option for M1 & M2 Buttons',
      'Red & Blue Dual Stitching',
    ],
    images: ['/BMW_PRESET_3.png'],
    desc: 'Full Alcantara grip with carbon fiber inlays and a bold red stripe — the ultimate M stealth build. Aggressive without saying a word.',
    isPreset: true,
  }
    ,
  {
    id: 'bmw-carbon-crusher',
    brand: 'BMW',
    name: 'CARBON CRUSHER',
    base_price: 449.99,
    compat: 'Fits F10, F30, E90',
    features: [
      'F-Series Base',
      'Carbon Fiber Base',
      'Perforated Leather Sides',
      'Silver Inlay',
      'Standard Paddle Shifters',
      'Red & Blue Dual Stitching',
    ],
    images: ['/BMW_PRESET_4.png'],
    desc: 'F-Series carbon fiber base with perforated leather sides and silver inlay. Built tough, finished clean.',
    isPreset: true,
  }
  ,
  {
    id: 'bmw-classic-m-sport',
    brand: 'BMW',
    name: 'CLASSIC M SPORT',
    base_price: 319.99,
    compat: 'Fits F10, F30, E90',
    features: [
      'F-Series Base',
      'Smooth Leather Top & Bottom',
      'Perforated Leather Sides',
      'Stealth Black Inlay',
      'Standard Paddle Shifters',
      'Red & Blue Dual Stitching',
    ],
    images: ['/BMW_PRESET_5.png'],
    desc: 'Clean, smooth leather top and bottom with perforated sides and stealth black inlay. The essential M sport build.',
    isPreset: true,
  }
];