const test=require('node:test'),assert=require('node:assert/strict');
const {active,customWheelPrice}=require('../lib/black-friday');
const NOW=Date.parse('2026-11-20T12:00:00Z');
test('promotion boundaries follow New York midnight',()=>{
 for(const [date,result] of [['2026-11-11T04:59:59Z',false],['2026-11-11T05:00:00Z',true],['2026-11-29T04:59:59Z',true],['2026-11-29T05:00:00Z',false]])assert.equal(active(Date.parse(date)),result);
});
test('actual 10 percent discount ignores browser stock flags and excludes authoritative stock presets',()=>{
 assert.equal(customWheelPrice(54999,{brand:'BMW',readyToShip:true},NOW),49499);
 assert.equal(customWheelPrice(54999,{brand:'BMW',isPreset:true,presetId:'bmw-touch-of-taste'},NOW),49499);
 assert.equal(customWheelPrice(39999,{brand:'BMW',isPreset:true,presetId:'bmw-ready-classic-carbon',readyToShip:false},NOW),39999);
 assert.equal(customWheelPrice(15999,{brand:'INFINITI',productType:'airbag-cover'},NOW),15999);
 assert.equal(customWheelPrice(39999,{brand:'BMW',productId:'stock'},NOW),39999);
 assert.equal(customWheelPrice(54999,{brand:'BMW'},Date.parse('2026-11-29T05:00:00Z')),54999);
});
test('mixed checkout charges custom wheels at 10 percent off and keeps stock and airbags exact',async()=>{
 const fs=require('node:fs'),vm=require('node:vm');const routes={},charged=[],stored=[];
 const client={query:async(sql,args)=>{if(sql.includes('wheel_configurations'))stored.push(args);return {rows:sql.includes('RETURNING id')?[{id:'test-id'}]:[]};},release(){}};
 const pool={connect:async()=>client,query:async()=>({rows:[]})},module={exports:{}};
 vm.runInNewContext(fs.readFileSync(require.resolve('../routes/checkout'),'utf8'),{module,exports:module.exports,process,console,require:name=>{
 if(name==='express')return {Router:()=>({post:(p,...h)=>routes[p]=h.at(-1),get(){}})};
 if(name==='../db/pool')return pool;
 if(name==='../lib/security')return {};
 if(name==='../lib/black-friday')return {customWheelPrice:(c,cfg)=>customWheelPrice(c,cfg,NOW)};
 if(name==='../lib/preset-pricing')return require('../lib/preset-pricing');
 if(name==='../lib/infiniti-airbag')return require('../lib/infiniti-airbag');
 if(name==='stripe')return ()=>({paymentIntents:{create:async args=>{charged.push(args);return {id:'test-intent',client_secret:'test'};}}});
 throw Error(name);
 }});
 const custom={brand:'BMW',airbagCompat:false,heated:false,laneAssist:false};
 const stock={brand:'BMW',isPreset:true,presetId:'bmw-ready-classic-carbon',readyToShip:false};
 const airbag={productType:'airbag-cover',airbagProductId:'infiniti-g37',brand:'INFINITI',vehicleModel:'G37',vehicleYear:'',airbagMat:'Alcantara',infinitiLogoFinish:'Regular Color',airbagCol:'#111111',airbagStitchColor:'#ffffff',infinitiLogoCol:'#111111'};
 const req={headers:{},body:{cartItems:[custom,stock,airbag].map(config=>({config,price:.01,quantity:1,name:'Test'})),customer:{email:'test@example.com'}}};
 const res={code:200,status(n){this.code=n;return this;},json(v){this.body=v;return this;}};
 await routes['/create-intent'](req,res);assert.equal(res.code,200);assert.equal(res.body.subtotal,'1054.97');assert.equal(charged[0].amount,105497);
 assert.deepEqual(stored.map(args=>args.at(-2)),['494.99','399.99','159.99']);
});
