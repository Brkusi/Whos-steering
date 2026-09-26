const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
function serverPrice(rules=[]){
  const module={exports:{}};
  vm.runInNewContext(fs.readFileSync(require.resolve('../routes/checkout'),'utf8')+'\nmodule.exports.priceForTest=calcServerPrice;',{
    module,exports:module.exports,process,console,require:name=>{
      if(name==='express')return {Router:()=>({post(){},get(){}})};
      if(name==='../db/pool')return {query:async()=>({rows:rules})};
      if(name==='../lib/security')return {};
      if(name==='stripe')return ()=>({});
      throw new Error('Unexpected dependency '+name);
    }
  });return module.exports.priceForTest;
}
test('server charges existing paddle upgrade for F-series carbon finishes only',async()=>{
  const base={brand:'BMW',wheelStyleType:'F-Series',airbagCompat:false,heated:false,laneAssist:false};
  for(const paddleShifters of ['Standard','None'])assert.equal(await serverPrice()({...base,paddleShifters}),44999);
  for(const paddleShifters of ['Glossy Carbon','Matte Carbon','Forged Carbon','Magnetic']){
    assert.equal(await serverPrice()({...base,paddleShifters}),47499);
    assert.equal(await serverPrice([{rule_key:'paddle_magnetic',amount:'37'}])({...base,paddleShifters}),48699);
  }
  assert.equal(await serverPrice()({...base,bmwLowerTrim:'Glossy Carbon'}),49999);
  assert.equal(await serverPrice([{rule_key:'bmw_lower_trim',amount:'60'}])({...base,bmwLowerTrim:'Forged Carbon'}),50999);
  assert.equal(await serverPrice()({...base,wheelStyleType:'G-Series',paddleShifters:'Forged Carbon'}),54999);
});
