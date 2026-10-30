import {useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import {seoForRoute} from '../lib/seoCatalog';
export default function SeoManager(){
 const {pathname,search}=useLocation();
 useEffect(()=>{
  const seo=seoForRoute(pathname,search);document.title=seo.title;
  const meta=(key,value,property=false)=>{let node=document.head.querySelector(`meta[${property?'property':'name'}="${key}"]`);if(!node){node=document.createElement('meta');node.setAttribute(property?'property':'name',key);document.head.appendChild(node);}node.content=value;};
  meta('description',seo.description);meta('robots',seo.noindex?'noindex,follow':'index,follow,max-image-preview:large');
  meta('og:title',seo.title,true);meta('og:description',seo.description,true);meta('og:url',seo.canonical,true);meta('og:image',seo.image,true);meta('og:type','website',true);
  meta('twitter:card','summary_large_image');meta('twitter:title',seo.title);meta('twitter:description',seo.description);meta('twitter:image',seo.image);
  let canonical=document.head.querySelector('link[rel="canonical"]');if(!canonical){canonical=document.createElement('link');canonical.rel='canonical';document.head.appendChild(canonical);}canonical.href=seo.canonical;
  let script=document.getElementById('route-schema');if(!script){script=document.createElement('script');script.id='route-schema';script.type='application/ld+json';document.head.appendChild(script);}script.textContent=JSON.stringify(seo.schema);
 },[pathname,search]);
 return null;
}
