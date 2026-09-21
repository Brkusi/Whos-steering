const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
function checkoutRoutes(){
  const routes={};const router={post:(path,handler)=>routes[path]=handler,get:()=>{}};
  const module={exports:{}};
  vm.runInNewContext(fs.readFileSync(require.resolve('../routes/checkout'),'utf8'),{module,exports:module.exports,process,console,require:name=>{
    if(name==='express')return {Router:()=>router};
    if(name==='../db/pool')return {connect:()=>{throw new Error('Unexpected database access');}};
    if(name==='../lib/security')return {safeHttpUrl:value=>value};
    if(name==='stripe')return ()=>({});
    throw new Error('Unexpected dependency '+name);
  }});return routes;
}
function response(){return {statusCode:200,status(code){this.statusCode=code;return this;},json(body){this.body=body;return this;}};}
test('expired Labor promotion is rejected, including mixed case and whitespace',()=>{
  const route=checkoutRoutes()['/validate-promo'];
  for(const code of ['LABOR',' labor ','LaBoR']){const res=response();route({body:{code}},res);assert.equal(res.body.valid,false);}
  const res=response();route({body:{code:'complaints'}},res);assert.equal(res.body.valid,true);assert.equal(res.body.percentOff,10);
});
test('retired badge and carbon-trim selections cannot enter a new order',async()=>{
  for(const config of [{brand:'AUDI',wheelStyleType:'B9',audiBadge:'R8'},{brand:'AUDI',isPreset:true,wheelStyleType:'R8',audiBadge:'R8'},{brand:'AUDI',innerTrimMatchCarbon:true}]){
    const res=response();await checkoutRoutes()['/create-intent']({body:{cartItems:[{config,quantity:1}],customer:{email:'test@example.com'}}},res);assert.equal(res.statusCode,400);assert.match(res.body.error,/lower badge|inner trim color/);
  }
});
