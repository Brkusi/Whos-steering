const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
test('newsletter requires consent, normalizes emails, persists and protects exports',async()=>{
 const routes={},calls=[],admin=()=>{};
 const module={exports:{}};
 vm.runInNewContext(fs.readFileSync(require.resolve('../routes/newsletter'),'utf8'),{module,exports:module.exports,require:name=>{
 if(name==='express')return {Router:()=>({post:(p,...h)=>routes['POST '+p]=h,get:(p,...h)=>routes['GET '+p]=h})};
 if(name==='express-rate-limit')return ()=>()=>{};
 if(name==='crypto')return require('node:crypto');
 if(name==='../db/pool')return {query:async(sql,args)=>{calls.push({sql,args});return {rows:[]};}};
 if(name==='../middleware/auth')return {adminRequired:admin};
 throw Error(name);
 }});
 const res=()=>({code:200,status(n){this.code=n;return this;},json(v){this.body=v;return this;},set(){return this;}}),next=e=>{if(e)throw e;};
 const bad=res();await routes['POST /subscribe'].at(-1)({body:{email:'a@example.com',consent:false}},bad,next);assert.equal(bad.code,400);assert.equal(calls.length,0);
 const ok=res();await routes['POST /subscribe'].at(-1)({body:{email:' DRIVER@EXAMPLE.COM ',consent:true}},ok,next);assert.equal(ok.body.ok,true);assert.equal(calls[0].args[0],'driver@example.com');assert.match(calls[0].args[1],/^[a-f0-9]{64}$/);assert.match(calls[0].sql,/ON CONFLICT/);
 assert.equal(routes['GET /admin'][0],admin);
 const invalid=res();await routes['POST /unsubscribe'].at(-1)({body:{id:'bad'}},invalid,next);assert.equal(invalid.code,400);
 const unsub=res();await routes['POST /unsubscribe'].at(-1)({body:{id:'a'.repeat(64)}},unsub,next);assert.match(calls[1].sql,/unsubscribed_at=now/);
 await routes['GET /admin'].at(-1)({},res(),next);assert.match(calls[2].sql,/unsubscribed_at IS NULL/);
});
