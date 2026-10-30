import {BRAND_GUIDES,SHOP_PRODUCTS,seoForRoute,canonicalUrl} from './seoCatalog';
import {WHEEL_STYLES} from './wheelStyles';
import {BMW_PRESETS,AUDI_PRESETS_FULL,INFINITI_PRESETS} from './data';
test('every available style and preset has one unique crawlable product page',()=>{
 expect(SHOP_PRODUCTS.length).toBe(WHEEL_STYLES.length+BMW_PRESETS.filter(Boolean).length+AUDI_PRESETS_FULL.filter(Boolean).length+INFINITI_PRESETS.filter(Boolean).length);
 expect(new Set(SHOP_PRODUCTS.map(p=>p.path)).size).toBe(SHOP_PRODUCTS.length);
 expect(BRAND_GUIDES.map(b=>b.brand)).toContain('INFINITI');
 SHOP_PRODUCTS.forEach(product=>{
  const seo=seoForRoute(product.path+'/');
  expect(seo.noindex).toBe(false);expect(seo.canonical).toBe(canonicalUrl(product.path));
  expect(seo.title).toContain(product.name);
  const schema=seo.schema['@graph'].find(item=>item['@type']==='Product');
  expect(schema.offers.priceCurrency).toBe('USD');
  expect(Number(schema.offers.price||schema.offers.lowPrice)).toBe(product.price);
  expect(schema.aggregateRating).toBeUndefined();
 });
});
test('private and duplicate query pages do not enter the index while public trailing-slash routes do',()=>{
 ['/login','/account/','/admin','/configure','/checkout','/unknown-page'].forEach(path=>expect(seoForRoute(path).noindex).toBe(true));
 expect(seoForRoute('/catalog/','?preset=bmw-red-desire').noindex).toBe(true);
 expect(seoForRoute('/build/','?brand=BMW').noindex).toBe(true);
 expect(seoForRoute('/catalog/').noindex).toBe(false);
 expect(seoForRoute('/steering-wheels/audi/').canonical).toBe('https://whossteering.com/steering-wheels/audi/');
 expect(seoForRoute('/steering-wheels/audi/not-a-wheel').noindex).toBe(true);
});
test('Infiniti discovery reflects both inventory families without borrowing competitor fitment',()=>{
 const guide=BRAND_GUIDES.find(b=>b.brand==='INFINITI');
 expect(guide.summary).toContain('G37');expect(guide.summary).toContain('Q50');
 const products=SHOP_PRODUCTS.filter(p=>p.brand==='INFINITI');
 expect(products.every(p=>p.readyToShip)).toBe(true);
 expect(products.find(p=>p.slug==='purple-rain').fitment).toContain('2009–2013');
 expect(products.find(p=>p.slug==='purple-craze').fitment).toContain('Q50 2018+');
});
