const test=require('node:test'),assert=require('node:assert/strict');
const {lightingPriceCents,validLightingQuantities}=require('../lib/ambient-lighting');
const variants=require('../../frontend/src/lib/ambientLightingVariants.json');
test('all ten variants use owner-specified retail prices and a 30 percent higher comparison price',()=>{
 assert.equal(variants.length,10);
 for(const v of variants){assert.equal(v.priceCents,({'6':4999,'10':5699,'14':5999,'18':6499,'20':6999,'22':7499,'24':7699,'26':7999})[v.id.split('-')[0]]);assert.equal(v.compareCents,Math.round(v.priceCents*1.3));assert.equal(lightingPriceCents({productType:'ambient-lighting',lightingVariant:v.id,price:1}),v.priceCents);}
});
test('lighting configuration must be valid and cannot switch server pricing paths',()=>{
 for(const config of [{},{productType:'ambient-lighting',lightingVariant:'fake'},{productType:'ambient-lighting',lightingVariant:variants[0].id,productId:'fake'},{productType:'ambient-lighting',lightingVariant:variants[0].id,isPreset:true}])assert.throws(()=>lightingPriceCents(config));
});
test('maximum 100 applies to all lighting lines together, with integer positive quantities',()=>{
 const item=quantity=>({quantity,config:{productType:'ambient-lighting'}});
 assert.equal(validLightingQuantities([item(100)]),true);
 assert.equal(validLightingQuantities([item(60),item(40)]),true);
 for(const lines of [[item(101)],[item(100),item(1)],[item(0)],[item(-1)],[item(1.5)],[item('2')]])assert.equal(validLightingQuantities(lines),false);
});
test('checkout charges 100 kits at server price, stores correct quantity and rejects a 101st kit before payment',async()=>{
 const fs=require('node:fs'),vm=require('node:vm');let response,status=200;const routes={},queries=[],intents=[];
 const client={query:async(sql,args)=>{queries.push([sql,args]);return {rows:sql.includes('RETURNING id')?[{id:'order-test'}]:[]};},release(){}};
 const module={exports:{}};
 vm.runInNewContext(fs.readFileSync(require.resolve('../routes/checkout'),'utf8'),{module,exports:module.exports,process,console,require:name=>{
  if(name==='express')return {Router:()=>({post:(path,...handlers)=>routes[path]=handlers.at(-1),get(){}})};
  if(name==='../db/pool')return {connect:async()=>client};
  if(name==='../lib/security')return {};
  if(name==='../lib/ambient-lighting')return {lightingPriceCents,validLightingQuantities};
  if(name==='../../frontend/src/lib/ambientLightingVariants.json')return variants;
  if(name==='stripe')return ()=>({paymentIntents:{create:async args=>{intents.push(args);return {id:'mock-intent',client_secret:'mock-only',status:'requires_payment_method'};}}});
  throw new Error('Unexpected dependency '+name);
 }});
 const req={headers:{},body:{cartItems:[{name:'wrong name',detail:'wrong kit',price:0.01,quantity:100,config:{productType:'ambient-lighting',lightingVariant:'6-in-1'}}],customer:{email:'test@example.com'}}};
 const res={status:value=>{status=value;return res;},json:value=>response=value};
 await routes['/create-intent'](req,res);
 assert.equal(status,200);assert.equal(response.amount,'4999.00');assert.equal(intents[0].amount,499900);
 const row=queries.find(([sql])=>sql.includes('INSERT INTO order_items'))[1];
 assert.equal(row[1],null);assert.equal(row[2],'Symphony Ambient Lighting Kit');assert.match(row[3],/6 in 1/);assert.equal(row[4],'49.99');assert.equal(row[5],100);assert.equal(row[6],'4999.00');
 assert.equal(queries.some(([sql])=>sql.includes('INSERT INTO wheel_configurations')),false);
 queries.length=0;intents.length=0;req.body.cartItems.push({...req.body.cartItems[0],quantity:1});
 await routes['/create-intent'](req,res);
 assert.equal(status,400);assert.match(response.error,/100/);assert.equal(queries.length,0);assert.equal(intents.length,0);
});
