/* Generate real HTML for search-facing routes without a runtime hosting service. */
process.env.NODE_ENV='production';
const fs=require('fs'),path=require('path'),babel=require('@babel/core');
const root=path.resolve(__dirname,'..'),src=path.join(root,'src'),build=path.join(root,'build');
const originalJS=require.extensions['.js'];
function compile(module,filename){
 if(!filename.startsWith(src+path.sep))return originalJS(module,filename);
 const result=babel.transformSync(fs.readFileSync(filename,'utf8'),{filename,babelrc:false,configFile:false,presets:[[require.resolve('@babel/preset-env'),{targets:{node:'18'},modules:'commonjs'}],[require.resolve('@babel/preset-react'),{runtime:'automatic'}]]});
 module._compile(result.code,filename);
}
require.extensions['.js']=compile;require.extensions['.jsx']=compile;require.extensions['.css']=module=>{module.exports={};};
const manifest=JSON.parse(fs.readFileSync(path.join(build,'asset-manifest.json'),'utf8'));
for(const extension of ['.webp','.png','.jpg','.jpeg','.svg'])require.extensions[extension]=(module,filename)=>{
 const basename=path.basename(filename,path.extname(filename));
 const value=Object.values(manifest.files).find(value=>value.startsWith('/static/media/'+basename+'.')&&value.endsWith(path.extname(filename)));
 if(!value)throw new Error('Missing compiled image '+filename);module.exports=value;
};
const React=require('react'),{renderToString}=require('react-dom/server'),{StaticRouter}=require('react-router-dom/server');
const {AuthProvider,CartProvider}=require('../src/context/index.jsx');
const Nav=require('../src/components/Nav.jsx').default,Footer=require('../src/components/Footer.jsx').default;
const Home=require('../src/pages/Home.jsx').default,Catalog=require('../src/pages/Catalog.jsx').default,Build=require('../src/pages/BuildStart.jsx').default;
const Landing=require('../src/pages/SeoLanding.jsx').default;
const {Routes,Route}=require('react-router-dom');
const {BRAND_GUIDES,SHOP_PRODUCTS,seoForRoute,canonicalUrl}=require('../src/lib/seoCatalog.js');
const template=fs.readFileSync(path.join(build,'index.html'),'utf8');
const escape=value=>String(value).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const json=value=>JSON.stringify(value).replace(/</g,'\\u003c');
const homeCss=Object.values(manifest.files).filter(value=>value.endsWith('.css')&&!value.endsWith('.map')).find(value=>fs.readFileSync(path.join(build,value),'utf8').includes('.ws-home'));
function documentFor(url,render){
 const seo=seoForRoute(url);
 let html=template.replace(/<title>[\s\S]*?<\/title>/i,`<title>${escape(seo.title)}</title>`)
   .replace(/<meta\b[^>]*(?:name="(?:description|robots|twitter:[^"]+)"|property="og:[^"]+")[^>]*>/gi,'')
   .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi,'')
   .replace(/<link[^>]*rel="canonical"[^>]*>/gi,'');
 const head=`<meta name="description" content="${escape(seo.description)}"/><meta name="robots" content="${seo.noindex?'noindex,follow':'index,follow,max-image-preview:large'}"/><link rel="canonical" href="${escape(seo.canonical)}"/><meta property="og:site_name" content="Who’s Steering"/><meta property="og:type" content="website"/><meta property="og:title" content="${escape(seo.title)}"/><meta property="og:description" content="${escape(seo.description)}"/><meta property="og:url" content="${escape(seo.canonical)}"/><meta property="og:image" content="${escape(seo.image)}"/><meta name="twitter:card" content="summary_large_image"/><meta name="twitter:title" content="${escape(seo.title)}"/><meta name="twitter:description" content="${escape(seo.description)}"/><meta name="twitter:image" content="${escape(seo.image)}"/><script id="route-schema" type="application/ld+json">${json(seo.schema)}</script>`;
 html=html.replace('</head>',head+(url==='/'&&homeCss?`<link rel="stylesheet" href="${homeCss}"/>`:'')+'</head>');
 if(render){
  const Page=url==='/'?Home:url==='/catalog'?Catalog:url==='/build'?Build:null;
  const content=React.createElement(StaticRouter,{location:url},React.createElement(AuthProvider,null,React.createElement(CartProvider,null,React.createElement(Nav),Page?React.createElement(Page):React.createElement(Routes,null,React.createElement(Route,{path:'/steering-wheels/:brand/:slug?',element:React.createElement(Landing)})),React.createElement(Footer))));
  html=html.replace('<div id="root"></div>',`<div id="root">${renderToString(content)}</div>`);
 }
 return html;
}
const indexed=['/','/catalog','/build','/contact','/shipping','/refund-policy','/payment-policy','/privacy','/terms',...BRAND_GUIDES.map(b=>'/steering-wheels/'+b.slug),...SHOP_PRODUCTS.map(p=>p.path)];
if(new Set(indexed).size!==indexed.length)throw new Error('Duplicate SEO paths');
for(const url of indexed){
 const target=path.join(build,url==='/'?'index.html':url.slice(1)+'/index.html');fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,documentFor(url,url==='/'||url==='/catalog'||url==='/build'||url.startsWith('/steering-wheels/')));
}
for(const url of ['/login','/account','/admin','/checkout','/configure','/track-order','/resume','/unsubscribe','/order-confirmation','/custom-order-confirmation']){
 const target=path.join(build,url.slice(1),'index.html');fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,documentFor(url,false));
}
fs.writeFileSync(path.join(build,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+indexed.map(url=>`<url><loc>${canonicalUrl(url)}</loc></url>`).join('\n')+'\n</urlset>\n');
fs.writeFileSync(path.join(build,'robots.txt'),'User-agent: *\nAllow: /\n\nSitemap: https://whossteering.com/sitemap.xml\n');
console.log(`Pre-rendered ${indexed.length} search routes (${BRAND_GUIDES.length} brands, ${SHOP_PRODUCTS.length} product/style pages); generated sitemap and robots.txt.`);
