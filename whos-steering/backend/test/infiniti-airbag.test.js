const test=require('node:test');
const assert=require('node:assert/strict');
const {airbagPriceCents}=require('../lib/infiniti-airbag');
const base={productType:'airbag-cover',airbagProductId:'infiniti-q50-2014-2017',brand:'INFINITI',vehicleModel:'Q50',vehicleYear:'2014–2017',airbagMat:'Alcantara',airbagCol:'#111111',airbagStitchColor:'#FFFFFF',infinitiLogoCol:'#A020F0'};
test('server prices every airbag finish independently of browser price',()=>{
 for(const [infinitiLogoFinish,price] of Object.entries({'Classic':15999,'Regular Color':15999,'Classic Carbon':17998,'Honeycomb Carbon':17998,'Forged Carbon':17998,'Carbon color':17998,LED:23998})) {
  for(const airbagMat of ['Alcantara','Smooth Leather']) assert.equal(airbagPriceCents({...base,airbagMat,infinitiLogoFinish,price:1}),price);
 }
});
test('unsupported fitments, finishes and incomplete selections are rejected',()=>{
 for(const patch of [{brand:'BMW'},{vehicleModel:'Q60'},{vehicleYear:'2018'},{airbagProductId:'unknown'},{infinitiLogoFinish:'free LED'},{airbagMat:'unknown'},{airbagCol:null},{isPreset:true},{productId:'123'}]) assert.throws(()=>airbagPriceCents({...base,infinitiLogoFinish:'LED',...patch}));
});
test('checkout saves complete cover config and charges server amount, with promo and quantities',async()=>{
 const fs=require('node:fs'),vm=require('node:vm');
 const routes={},queries=[],intent=[];
 const client={query:async(sql,args)=>{queries.push([sql,args]);return {rows:sql.includes('RETURNING id')?[{id:sql.includes('wheel_configurations')?'config-1':'order-1'}]:[]};},release(){}};
 const module={exports:{}};
 vm.runInNewContext(fs.readFileSync(require.resolve('../routes/checkout'),'utf8'),{module,exports:module.exports,process,console,require:name=>{
  if(name==='express')return {Router:()=>({post:(path,...handlers)=>routes[path]=handlers.at(-1),get(){}})};
  if(name==='../db/pool')return {connect:async()=>client};
  if(name==='../lib/security')return {};
  if(name==='../lib/infiniti-airbag')return {airbagPriceCents};
  if(name==='stripe')return ()=>({paymentIntents:{create:async args=>{intent.push(args);return {id:'pi-test',client_secret:'test-only',status:'requires_payment_method'};}}});
  throw new Error('Unexpected dependency '+name);
 }});
 const config={...base,infinitiLogoFinish:'Carbon color'};
 const req={headers:{},body:{cartItems:[{name:'Q50 Custom Airbag Cover',detail:'Carbon color',quantity:2,price:0.01,config}],customer:{email:'test@example.com'},promoCode:'complaints'}};
 let result,status=200;const res={status:n=>{status=n;return res;},json:value=>result=value};
 await routes['/create-intent'](req,res);
 assert.equal(status,200);assert.equal(result.subtotal,'359.96');assert.equal(result.amount,'323.96');
 assert.equal(intent[0].amount,32396);
 assert.equal(queries.find(([sql])=>sql.includes('INSERT INTO wheel_configurations'))[1].at(-1),config);
 assert.equal(queries.find(([sql])=>sql.includes('INSERT INTO order_items'))[1][4],'179.98');
 // Invalid cover configuration is rejected before a DB transaction or payment call.
 queries.length=0;intent.length=0;req.body.cartItems[0].config={...config,vehicleModel:'Q60'};
 await routes['/create-intent'](req,res);
 assert.equal(status,400);assert.equal(queries.length,0);assert.equal(intent.length,0);
});

test('newer cover receives identical authoritative pricing and rejects crossed fitments',()=>{
 const newer={...base,airbagProductId:'infiniti-q60-2017-q50-2018',vehicleModel:'Q60 / Q50',vehicleYear:'Q60 2017+ / Q50 2018+'};
 for(const [infinitiLogoFinish,price] of Object.entries({'Classic':15999,'Regular Color':15999,'Classic Carbon':17998,'Honeycomb Carbon':17998,'Forged Carbon':17998,'Carbon color':17998,LED:23998})) {
  assert.equal(airbagPriceCents({...newer,infinitiLogoFinish,price:1}),price);
  assert.throws(()=>airbagPriceCents({...newer,infinitiLogoFinish,vehicleYear:base.vehicleYear}));
  assert.throws(()=>airbagPriceCents({...base,infinitiLogoFinish,airbagProductId:newer.airbagProductId}));
 }
});

test('G37 has shared server prices and cannot use Q50 or Q60 fitment data',()=>{
 const g37={...base,airbagProductId:'infiniti-g37',vehicleModel:'G37',vehicleYear:''};
 for(const [infinitiLogoFinish,price] of Object.entries({'Classic':15999,'Regular Color':15999,'Classic Carbon':17998,'Honeycomb Carbon':17998,'Forged Carbon':17998,'Carbon color':17998,LED:23998})) {
  assert.equal(airbagPriceCents({...g37,infinitiLogoFinish,price:1}),price);
  for(const patch of [{vehicleModel:'Q50'},{vehicleModel:'Q60 / Q50'},{vehicleYear:'2014–2017'},{airbagProductId:base.airbagProductId}]) assert.throws(()=>airbagPriceCents({...g37,infinitiLogoFinish,...patch}));
 }
});
