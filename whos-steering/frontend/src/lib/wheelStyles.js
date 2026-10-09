// Styles and source photographs shared by the build landing page and configurator.
export const WHEEL_STYLES = [
  {brand:'BMW', style:'G-Series', label:'G-Series LCI', image:'/configure-g-series-lci.png', detail:'BMW G-Series LCI wheel', price:549.99},
  {brand:'BMW', style:'G-Series Pre LCI', label:'G-Series Pre LCI', image:'/models/bmw-gseries/source/round.webp', detail:'BMW G-Series Pre LCI · live 2D preview', price:549.99},
  {brand:'BMW', style:'F-Series', label:'F-Series', image:'/models/bmw-fseries/source/round.webp', detail:'Classic BMW F-Series · live 2D preview', price:449.99},
  {brand:'AUDI', style:'B9', label:'B9', image:'/configure-audi-b9.png', detail:'Audi B9 Style', price:699.99},
  {brand:'AUDI', style:'RS 2020+', label:'Audi B9.5', image:'/models/audi-rs-2020/source/round.webp', detail:'Audi B9.5 steering wheel', price:799.99},
  {brand:'AUDI', style:'R8', label:'R8', image:'/r8-reference.png', detail:'Audi R8 style steering wheel', price:799.99},
  {brand:'MERCEDES', style:'AMG Performance', label:'AMG Performance', image:'/models/mercedes-amg/source/round.webp', detail:'Mercedes-AMG · 2019–2024', price:799.99},
  {brand:'MERCEDES', style:'Mercedes 2015–2023', label:'Mercedes 2015–2023', image:'/models/mercedes-2015/source/round.webp', detail:'Mercedes · 2015–2023', price:799.99},
  {brand:'MERCEDES', style:'Mercedes 2010–2015', label:'Mercedes 2010–2015', image:'/models/mercedes-2010/source/round.webp', detail:'Mercedes · 2010–2015', price:699.99},
  {brand:'TOYOTA', style:'Supra GR', label:'Supra GR', image:'/models/supra-gr/source/flat-round.webp', detail:'Toyota Supra GR · 2020+', price:699.99},
  {brand:'PORSCHE', style:'911 Performance (992)', label:'911 Performance (992)', image:'/models/porsche-992/source/flat-round.webp', imageOverlay:'/models/porsche-992/source/cf/flat-round-glossy.webp', detail:'Porsche 911 · 2019+', price:899.99},
  {brand:'DODGE_SRT', style:'SRT', label:'SRT', image:'/models/dodge-srt/source/round.webp', detail:'Dodge SRT performance wheel', price:699.99},
];

export const stylesForBrand = brand => WHEEL_STYLES.filter(item => item.brand === brand);
export const wheelStyle = (brand, style) => WHEEL_STYLES.find(item => item.brand === brand && item.style === style);
export const defaultWheelStyle = brand => stylesForBrand(brand)[0]?.style || 'G-Series';
