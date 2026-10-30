import {WHEEL_STYLES} from './wheelStyles';
import {BMW_PRESETS,AUDI_PRESETS_FULL,INFINITI_PRESETS} from './data';
export const SITE='https://whossteering.com';
export const canonicalUrl=path=>SITE+(path==='/'?'/':path.replace(/\/+$/,'')+'/');
export const BRAND_GUIDES=[
 {slug:'bmw',brand:'BMW',name:'BMW',summary:'Shop BMW F-Series, G-Series pre-LCI, G-Series LCI and 2010–2019 steering wheel styles, plus existing BMW carbon fiber builds.',keywords:['BMW custom steering wheel','BMW F-Series carbon fiber steering wheel','BMW G-Series LCI steering wheel']},
 {slug:'audi',brand:'AUDI',name:'Audi',summary:'Explore Audi B9, B8.5 flat-bottom, B9.5 and R8-style custom steering wheels, alongside our RS Carbon, RS Stealth and Flagship Carbon designs.',keywords:['Audi B9 custom steering wheel','Audi B8.5 flat bottom steering wheel','Audi B9.5 carbon fiber steering wheel','Audi R8 style steering wheel']},
 {slug:'mercedes',brand:'MERCEDES',name:'Mercedes-Benz',summary:'Design a Mercedes-AMG Performance-style wheel or explore our Mercedes 2010–2015 and 2015–2023 styles. Select materials and finishing details for your build.',keywords:['Mercedes AMG custom steering wheel','Mercedes carbon fiber steering wheel','Mercedes 2010–2015 steering wheel','Mercedes 2015–2023 steering wheel']},
 {slug:'toyota',brand:'TOYOTA',name:'Toyota',summary:'Build a Toyota GR Supra-style custom steering wheel with your choice of available materials, stitching, stripe and trim options.',keywords:['Toyota GR Supra custom steering wheel','Supra A90 carbon fiber steering wheel']},
 {slug:'porsche',brand:'PORSCHE',name:'Porsche',summary:'Explore the Porsche 911 Performance (992) steering wheel style and personalize the materials and details for your interior.',keywords:['Porsche 992 custom steering wheel','Porsche 911 carbon fiber steering wheel']},
 {slug:'dodge',brand:'DODGE_SRT',name:'Dodge',summary:'Personalize a Dodge SRT-style steering wheel with available carbon finishes, grip materials, stitching and stripe options.',keywords:['Dodge SRT custom steering wheel','Dodge carbon fiber steering wheel']},
 {slug:'infiniti',brand:'INFINITI',name:'Infiniti',summary:'Shop Purple Rain and Gold Rush wheels for G25, G35, G37 and G37X (2009–2013), and Purple Craze for Q50 2018+ / Q60 2017+. These are existing ready-to-ship designs.',keywords:['Infiniti G37 carbon fiber steering wheel','Infiniti G35 G25 G37X steering wheel','Infiniti Q50 Q60 carbon fiber steering wheel','ready to ship Infiniti steering wheel']},
];
export const brandGuide=brand=>BRAND_GUIDES.find(item=>item.brand===brand);
const slugify=value=>value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const clean=value=>value.replace(/\b(Audi|BMW|Mercedes)\s+(?=Audi|BMW|Mercedes)/g,'');
export const SHOP_PRODUCTS=[
 ...WHEEL_STYLES.map(wheel=>{
   const fitment=wheel.detail.replace(/ · live 2D preview/g,''),brand=brandGuide(wheel.brand),name=/^(BMW|Audi|Mercedes)\b/.test(wheel.label)?wheel.label:clean(`${brand.name} ${wheel.label}`);
   return {id:`style-${wheel.brand}-${wheel.style}`,slug:slugify(wheel.label),brand:wheel.brand,brandSlug:brand.slug,name:`${name} Style Custom Steering Wheel`,description:`Personalize the ${name} steering wheel style with available carbon fiber, leather or Alcantara/suede materials, stitching colors and finishing details. ${fitment}. Final vehicle compatibility is confirmed from a photo of your current wheel before production.`,image:wheel.image,overlays:wheel.imageOverlays||(wheel.imageOverlay?[wheel.imageOverlay]:[]),price:wheel.price,custom:true,features:['Available carbon fiber, leather and Alcantara/suede choices','Stitching and center-stripe personalization','Vehicle-specific controls and option review'],fitment,cta:`/configure?${new URLSearchParams({brand:wheel.brand,style:wheel.style})}`};
 }),
 ...[...BMW_PRESETS,...AUDI_PRESETS_FULL,...INFINITI_PRESETS].filter(Boolean).map(preset=>({id:preset.id,slug:slugify(preset.name),brand:preset.brand,brandSlug:brandGuide(preset.brand).slug,name:`${brandGuide(preset.brand).name} ${preset.name} Steering Wheel`,description:preset.desc,image:preset.images?.[0],overlays:[],price:preset.base_price,custom:!preset.readyToShip,readyToShip:preset.readyToShip===true,features:preset.features||[],fitment:preset.compat,cta:`/catalog?${new URLSearchParams({brand:preset.brand,preset:preset.id})}`})),
].map(product=>({...product,path:`/steering-wheels/${product.brandSlug}/${product.slug}`}));
export const shopProduct=(brandSlug,slug)=>SHOP_PRODUCTS.find(item=>item.brandSlug===brandSlug&&item.slug===slug);
export const HOME_TITLE="Custom Carbon Fiber Steering Wheels | Who’s Steering";
export const HOME_DESCRIPTION='Build a custom steering wheel or shop existing designs for BMW, Audi, Mercedes, Toyota Supra, Porsche, Dodge and Infiniti. Choose materials, colors and finishes.';
export const ORG={'@type':'Organization','@id':SITE+'/#organization',name:"Who's Steering?",url:SITE+'/',logo:SITE+'/ws-logo.png',sameAs:['https://www.instagram.com/whossteering/']};
const website={'@type':'WebSite','@id':SITE+'/#website',name:"Who's Steering?",url:SITE+'/',publisher:{'@id':ORG['@id']}};
export function seoForRoute(pathname,search=''){
 pathname=pathname==='/'?'/':pathname.replace(/\/+$/,'');
 const params=new URLSearchParams(search),parts=pathname.split('/').filter(Boolean);
 let title=HOME_TITLE,description=HOME_DESCRIPTION,path=pathname==='/'?'/':pathname.replace(/\/$/,''),noindex=false,image='/configure-g-series-lci.png',schema=[ORG,website];
 const crumbs=[{name:'Home',path:'/'}];
 if(parts[0]==='steering-wheels'){
  const guide=BRAND_GUIDES.find(item=>item.slug===parts[1]);
  const product=parts[2]?shopProduct(parts[1],parts[2]):null;
  if(!guide||parts.length>3||(parts[2]&&!product)){title='Wheel Not Found | Who’s Steering';noindex=true;}
  else {
   crumbs.push({name:`${guide.name} steering wheels`,path:`/steering-wheels/${guide.slug}`});
   if(product){
    title=`${product.name} | Who’s Steering`;description=product.description;image=product.image;path=product.path;
    crumbs.push({name:product.name,path});
    schema.push({'@type':'Product','@id':canonicalUrl(path)+'#product',name:product.name,description:product.description,image:[SITE+image],sku:product.id,brand:{'@type':'Brand',name:"Who's Steering?"},category:'Vehicle steering wheels',offers:{'@type':product.custom?'AggregateOffer':'Offer',url:canonicalUrl(path),priceCurrency:'USD',...(product.custom?{lowPrice:product.price.toFixed(2),offerCount:1}:{price:product.price.toFixed(2),availability:'https://schema.org/InStock'}),seller:{'@id':ORG['@id']}}});
   }else{
    title=guide.slug==='infiniti'?'Infiniti Carbon Fiber Steering Wheels | Ready-to-Ship Designs':`${guide.name} Custom & Carbon Fiber Steering Wheels | Who’s Steering`;description=guide.summary;
    const products=SHOP_PRODUCTS.filter(item=>item.brand===guide.brand);
    image=products[0]?.image||image;
    schema.push({'@type':'CollectionPage',name:title,url:canonicalUrl(path),description,mainEntity:{'@type':'ItemList',itemListElement:products.map((p,i)=>({'@type':'ListItem',position:i+1,url:canonicalUrl(p.path),name:p.name}))}});
   }
  }
 }else if(pathname==='/catalog'){
  const product=SHOP_PRODUCTS.find(item=>item.id===params.get('preset'));
  const guide=brandGuide(params.get('brand'));
  if(product||guide)noindex=true;
  title='Shop Carbon Fiber Steering Wheels & Existing Designs | Who’s Steering';description='Shop BMW, Audi and Infiniti steering wheel designs, including ready-to-ship wheels and made-to-order presets. Review each listing for fitment and options.';
 }else if(pathname==='/build'){
  const guide=brandGuide(params.get('brand'));if(guide)noindex=true;
  title='Build a Custom Steering Wheel | BMW, Audi & More | Who’s Steering';description='Choose your vehicle and steering wheel style, then personalize materials, stitching, colors and available features. Final fitment is checked from your wheel photo.';
 }else if(pathname==='/configure'){
  noindex=true;title='Configure Your Custom Steering Wheel | Who’s Steering';description='Personalize your steering wheel materials, colors, stitching and vehicle-specific options.';
 }else if(pathname==='/contact'){title='Contact Who’s Steering | Custom Wheel & Fitment Questions';description='Ask Who’s Steering about custom steering wheels, materials, vehicle compatibility, existing designs and your order.';}
 else if(['/shipping','/refund-policy','/payment-policy','/privacy','/terms'].includes(pathname)){
  const names={'/shipping':'Shipping Policy','/refund-policy':'Returns & Warranty','/payment-policy':'Payment Policy','/privacy':'Privacy Policy','/terms':'Terms of Service'};title=`${names[pathname]} | Who’s Steering`;description=`Read the Who’s Steering ${names[pathname].toLowerCase()} for custom steering wheels and existing wheel designs.`;
 }else if(pathname!=='/'){title='Your Account & Order | Who’s Steering';noindex=true;}
 if(crumbs.length>1)schema.push({'@type':'BreadcrumbList',itemListElement:crumbs.map((crumb,i)=>({'@type':'ListItem',position:i+1,name:crumb.name,item:canonicalUrl(crumb.path)}))});
 return {title,description,canonical:canonicalUrl(path),noindex,image:SITE+image,schema:{'@context':'https://schema.org','@graph':schema}};
}
