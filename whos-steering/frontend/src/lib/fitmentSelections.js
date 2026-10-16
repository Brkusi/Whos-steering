import { colorName, materialLabel, STRIPE_CONCEPTS, STITCH_COLORS, CLASSIC_CARBON_COLORS, FORGED_CARBON_COLORS, HONEYCOMB_CARBON_COLORS, B85_FORGED_CARBON_COLORS } from './data';
import { paddleLabel } from './paddleOptions';
import { bmwStyleLabel, isBmw2010, isAudiRS2020, sourceWheelStyle, usesBmw2D, usesSource2D } from './bmwFSeriesConfiguration';

const present = value => typeof value === 'string' && value.trim() ? value.trim() : null;
const yesNo = value => value ? 'Yes' : 'No';
const swatchName = (colors, value) => colors.find(color => color.h?.toLowerCase() === String(value).toLowerCase())?.n || colorName(value);

function selectedColor(value, custom, colors) {
  return present(custom) || (value ? colors ? swatchName(colors, value) : colorName(value) : 'Not selected');
}

function materialColor(material, regular, carbon, custom) {
  if (material === 'Matte Carbon') return null;
  const palette = material === 'Forged Carbon' ? FORGED_CARBON_COLORS
    : material === 'Honeycomb Carbon' ? HONEYCOMB_CARBON_COLORS : CLASSIC_CARBON_COLORS;
  return material?.includes('Carbon') ? selectedColor(carbon, custom, palette) : selectedColor(regular, custom);
}

export function fitmentWheelName(config) {
  return config?.wheelStyleType ? bmwStyleLabel(config.wheelStyleType) : 'Wheel not recorded';
}

export function fitmentSelections(config) {
  if (!config || typeof config !== 'object') return [];
  const audi = config.brand === 'AUDI';
  const b85 = audi && config.wheelStyleType === 'B8.5';
  const stripe = STRIPE_CONCEPTS.find(option => option.id === config.stripeConceptId);
  const rows = [
    ['Wheel', fitmentWheelName(config)],
    usesSource2D(config) ? ['Wheel shape', config.bmwShape || 'Round'] : null,
    !usesSource2D(config) && !(audi && config.wheelStyleType === 'R8') ? ['Wheel style', config.wheelStyle || 'Standard'] : null,
    audi && config.wheelStyleType === 'R8' ? ['Start / Stop & Drive Select buttons', yesNo(config.startStopButtons)] : null,
    [audi ? 'LED display strip' : 'RPM gauge', yesNo(config.ledDisplay)],
    isBmw2010(config) ? ["12 o'clock ring", yesNo(config.bmwRing)] : config.bmwShape !== 'Yoke' ? ['Top stripe', present(config.stripeCustomColor) || stripe?.label || 'No Stripe'] : null,
    sourceWheelStyle(config)?.stitch !== false ? ['Stitch color', selectedColor(config.stitchColor, config.stitchCustomColor, STITCH_COLORS)] : null,
    usesBmw2D(config) ? ['Lower trim', config.bmwLowerTrim || 'Original'] : null,
    ['Paddle shifters', paddleLabel(config.paddleShifters) || 'Standard'],
    config.paddleShifters === 'Magnetic' ? ['Paddle length', config.paddleLength || 'Short'] : null,
    config.paddleShifters === 'Urus Style' ? ['Urus paddle color', config.urusPaddleColor || 'Black'] : null,
    audi && config.wheelStyleType === 'B9' && config.paddleShifters === 'Standard' ? ['Paddle finish', config.paddleFinish === 'Stealth' ? 'Black' : 'Classic'] : null,
    b85 && config.paddleShifters?.startsWith('Racing Style') ? ['Paddle material', config.b85PaddleMaterial || 'Classic Carbon'] : null,
    b85 && config.paddleShifters?.startsWith('Racing Style') && config.b85PaddleMaterial === 'Forged Carbon' ? ['Paddle carbon color', selectedColor(config.b85PaddleCarbonCol, config.b85PaddleCarbonCustomColor, B85_FORGED_CARBON_COLORS)] : null,
    b85 && config.paddleShifters?.startsWith('Racing Style') ? ['Paddle symbol color', selectedColor(config.b85PaddleSymbolCol, config.b85PaddleSymbolCustomColor)] : null,
    ['Top & bottom grip material', materialLabel(config.topBottomMat) || 'Not selected'],
    materialColor(config.topBottomMat, config.topBottomCol, config.topBottomCarbonCol, config.topBottomCustomColor) !== null ? ['Top & bottom color', materialColor(config.topBottomMat, config.topBottomCol, config.topBottomCarbonCol, config.topBottomCustomColor)] : null,
    ['Side grip material', materialLabel(config.sideMat) || 'Not selected'],
    ['Side grip color', materialColor(config.sideMat, config.sideCol, config.sideCarbonCol, config.sideCustomColor) || 'Not selected'],
    audi && !isAudiRS2020(config) ? ['Lower badge', config.audiBadge || 'Not selected'] : null,
    audi && !isAudiRS2020(config) && !b85 ? ['Plastic trim color', selectedColor(config.plasticTrimCol, config.plasticTrimCustomColor)] : null,
    audi && !isAudiRS2020(config) && !b85 ? ['Inner trim color', config.innerTrimMatchCarbon ? 'Match top & bottom carbon' : selectedColor(config.innerTrimCol, config.innerTrimCustomColor)] : null,
    ['Airbag cover', yesNo(config.airbagCompat)],
    (config.airbagCompat || isAudiRS2020(config)) && !isBmw2010(config) ? ['Full upgraded airbag unit', yesNo(config.airbagUpgrade)] : null,
    config.airbagCompat ? ['Airbag material', materialLabel(config.airbagMat) || 'Not selected'] : null,
    config.airbagCompat ? ['Airbag color', selectedColor(config.airbagCol, config.airbagCustomColor)] : null,
    config.airbagCompat && sourceWheelStyle(config)?.airbagStitch !== false ? ['Airbag stitch color', selectedColor(config.airbagStitchColor, config.airbagStitchCustomColor, STITCH_COLORS)] : null,
    audi && !b85 && config.airbagCompat ? ['Audi logo color', selectedColor(config.audiLogoCol, config.audiLogoCustomColor)] : null,
    config.brand === 'DODGE_SRT' && config.airbagCompat ? ['Airbag trim color', selectedColor(config.dodgeAirbagTrimCol, config.dodgeAirbagTrimCustomColor)] : null,
    config.brand === 'DODGE_SRT' && config.airbagCompat ? ['SRT logo color', selectedColor(config.dodgeLogoCol, config.dodgeLogoCustomColor)] : null,
    ['Heated steering', yesNo(config.heated)],
    !isBmw2010(config) ? [config.brand === 'BMW' ? 'Driver assistance retained' : 'Lane assist compatible', yesNo(config.laneAssist)] : null,
    present(config.customNotes) ? ['Custom notes', present(config.customNotes)] : null,
  ];
  return rows.filter(Boolean);
}
