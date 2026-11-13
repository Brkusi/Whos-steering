const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
function setup(){const routes={},calls=[],admin=()=>{};let fail=false;const module={exports:{}};vm.runInNewContext(fs.readFileSync(require.resolve('../routes/waitlist'),'utf8'),{module,exports:module.exports,require:name=>{
 if(name==='express')return {Router:()=>({post:(path,...handlers)=>routes['POST '+path]=handlers,get:(path,...handlers)=>routes['GET '+path]=handlers})};
 if(name==='express-rate-limit')return ()=>()=>{};
 if(name==='crypto')return require('node:crypto');
 if(name==='../middleware/auth')return {adminRequired:admin};
 if(name==='../db/pool')return {query:async(sql,args)=>{calls.push({sql,args});if(fail)throw Error('Database unavailable');return {rows:sql.startsWith('SELECT')?[{product:'audi-a6-a7-c7-digital-cluster',email:'driver@example.com',unsubscribe_token:'b'.repeat(64)}]:[]};}};
 throw Error(name);
}});return {routes,calls,admin,setFail(value){fail=value;}};}
const response=()=>({code:200,status(value){this.code=value;return this;},json(value){this.body=value;return this;},set(){return this;}});
const valid={product:'audi-a6-a7-c7-digital-cluster',name:' Driver ',email:' DRIVER@EXAMPLE.COM ',vehicle:'2016 Audi A7',consent:true};
test('waitlist validates consent and product, deduplicates signups and protects exports',async()=>{
 const {routes,calls,admin}=setup();const next=error=>{if(error)throw error;};
 for(const body of [{...valid,consent:false},{...valid,product:'other'},{...valid,email:'x'},{...valid,name:' '},{...valid,vehicle:{}},{}]){const res=response();await routes['POST /subscribe'].at(-1)({body},res,next);assert.equal(res.code,400);}
 assert.equal(calls.length,0);const ok=response();await routes['POST /subscribe'].at(-1)({body:valid},ok,next);assert.equal(ok.body.ok,true);assert.match(calls[0].sql,/CREATE TABLE IF NOT EXISTS/);assert.match(calls[1].sql,/ON CONFLICT\(product,email\)/);assert.equal(calls[1].args[1],'driver@example.com');assert.equal(calls[1].args[2],'Driver');assert.match(calls[1].args[4],/^[a-f0-9]{64}$/);
 await routes['POST /subscribe'].at(-1)({body:valid},response(),next);assert.equal(calls.filter(call=>call.sql.startsWith('CREATE')).length,1);
 assert.equal(routes['GET /admin'][0],admin);const exported=response();await routes['GET /admin'].at(-1)({},exported,next);assert.match(calls.at(-1).sql,/unsubscribed_at IS NULL/);assert.match(exported.body.subscribers[0].unsubscribeUrl,/#unsubscribe-b{64}$/);
 const invalid=response();await routes['POST /unsubscribe'].at(-1)({body:{id:'invalid'}},invalid,next);assert.equal(invalid.code,400);
 await routes['POST /unsubscribe'].at(-1)({body:{id:'b'.repeat(64)}},response(),next);assert.match(calls.at(-1).sql,/SET unsubscribed_at=now/);
});
test('database failures never confirm a signup and schema initialization can retry',async()=>{
 const context=setup();context.setFail(true);const res=response();let error;await context.routes['POST /subscribe'].at(-1)({body:valid},res,caught=>{error=caught;});assert.match(error.message,/Database unavailable/);assert.equal(res.body,undefined);context.setFail(false);await context.routes['POST /subscribe'].at(-1)({body:valid},res,caught=>{throw caught;});assert.equal(res.body.ok,true);
});
