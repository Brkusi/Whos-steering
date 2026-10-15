import { B85_STRIPE_CONCEPTS } from './data';
import assets from './audiB85Assets.json';

export const B85_ROOT = '/models/audi-b85/source/';
export const B85_LED = '/models/audi-rs-2020/source/led/flat-round.webp';
const materialNames = {'Smooth Leather':'Cuir nappa', 'Perforated Leather':'Cuir nappa perforé', Alcantara:'Alcantara', 'Classic Carbon':'Carbone brillant', 'Matte Carbon':'Carbone mat'};
const colors = {'#111111':'Noir','#CC2200':'Rouge','#F0F0F0':'Blanc','#0044CC':'Bleu','#0A1F6E':'Bleu','#1A5C2A':'Vert','#6A1FA8':'Violet','#E8B800':'Jaune'};
const forged = {'#111111':'Simple','#1A0A2E':'Violet','#0A2E10':'Vert','#3A2800':'Or','#0A1428':'Bleu','#6E0000':'Rouge','#D0D0D0':'Blanc','#A6326C':'Rose'};
const stripes = {'C-2':'Noir','C-3':'Rose','C-4':'Bleu','C-6':'Rouge','C-8':'Vert','C-10':'Violet','B85-W':'Blanc','B85-Y':'Jaune'};

// All source layers share the same 1080px registration. Paddles must be behind
// the base, and grip layers must always cover the material baked into that base.
export function audiB85Layers(config) {
  const layers = [];
  const add = name => { if (name) layers.push({src:B85_ROOT + name}); };
  const racing = config.paddleShifters === 'Racing Style 1' ? 'racing1' : config.paddleShifters === 'Racing Style 2' ? 'racing2' : null;
  if (racing) {
    add(config.b85PaddleMaterial === 'Forged Carbon'
      ? assets[`${racing}Forged`][forged[config.b85PaddleCarbonCol] || 'Simple']
      : assets[`${racing}Finish`].Carbone);
    add(assets[`${racing}Symbols`][colors[config.b85PaddleSymbolCol] || 'Blanc']);
  } else if (config.paddleShifters === 'Magnetic') {
    add('paddles-magnetic.png');
    add(assets.magneticSymbols.Blanc);
    if(config.paddleLength === 'Long')layers.forEach(layer => {layer.rect=[0,-119,1080,1318];});
  } else if (config.paddleShifters !== 'None') add('paddles-original.png');
  add('base.png');
  add(config.topBottomMat === 'Forged Carbon'
    ? assets.top[forged[config.topBottomCarbonCol] || 'Simple']
    : assets.top[materialNames[config.topBottomMat]] || assets.top['Cuir nappa']);
  add(assets.sides[materialNames[config.sideMat]] || assets.sides['Cuir nappa perforé']);
  const airbag = config.airbagCompat && config.airbagMat === 'Alcantara' ? assets.airbagAlcantara : assets.airbagLeather;
  add(airbag[config.airbagCompat ? colors[config.airbagStitchColor] || 'Noir' : 'Noir']);
  add(assets.badge[config.audiBadge === 'S' ? 'Sline' : 'RS']);
  if (config.ledDisplay) {
    // Register the existing Audi LED photograph to the B8.5 upper rim.
    layers.push({src:B85_LED, crop:[320,175,950,245], rect:[220,74,640,165]});
  } else add(assets.stripe[stripes[config.stripeConceptId]]);
  return layers;
}

export function normalizeB85Options(config) {
  if (config.brand !== 'AUDI' || config.wheelStyleType !== 'B8.5') return config;
  const topBottomMat = ['Smooth Leather','Alcantara','Classic Carbon','Matte Carbon','Forged Carbon'].includes(config.topBottomMat) ? config.topBottomMat : 'Smooth Leather';
  return {...config, wheelStyle:'Sport', bmwShape:'Flat bottom', topBottomMat,
    topBottomCol:config.topBottomCol ?? '#111111', sideCol:config.sideCol ?? '#111111',
    sideMat: ['Smooth Leather','Perforated Leather','Alcantara'].includes(config.sideMat) ? config.sideMat : 'Perforated Leather',
    topBottomCarbonCol:topBottomMat === 'Forged Carbon' ? (forged[config.topBottomCarbonCol] ? config.topBottomCarbonCol : '#111111') : '#111111',
    paddleShifters:['None','Standard','Racing Style 1','Racing Style 2','Magnetic','Urus Style'].includes(config.paddleShifters) ? config.paddleShifters : 'Standard',
    b85PaddleMaterial:config.b85PaddleMaterial === 'Forged Carbon' ? 'Forged Carbon' : 'Classic Carbon',
    b85PaddleCarbonCol:forged[config.b85PaddleCarbonCol] ? config.b85PaddleCarbonCol : '#111111',
    b85PaddleSymbolCol:colors[config.b85PaddleSymbolCol] ? config.b85PaddleSymbolCol : '#F0F0F0',
    stripeConceptId:!config.ledDisplay && B85_STRIPE_CONCEPTS.some(c => c.id === config.stripeConceptId) ? config.stripeConceptId : 'C-1',
    stripeCustomColor:config.ledDisplay ? '' : config.stripeCustomColor,
    airbagMat:config.airbagMat && !['Smooth Leather','Alcantara'].includes(config.airbagMat) ? 'Smooth Leather' : config.airbagMat,
    airbagUpgrade:Boolean(config.airbagCompat && config.airbagUpgrade),
    audiBadge:config.audiBadge === 'S' ? 'S' : 'RS', audiLogoCol:config.audiLogoCol ?? '#111111',
    airbagCol:config.airbagCol ?? '#111111',
    airbagStitchColor:config.airbagStitchColor ?? '#111111',
  };
}
