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

test('G-Series Pre LCI retains G pricing and charges source paddle/trim choices',async()=>{
  const base={brand:'BMW',wheelStyleType:'G-Series Pre LCI',airbagCompat:false,heated:false,laneAssist:false};
  assert.equal(await serverPrice()(base),54999);
  assert.equal(await serverPrice()({...base,paddleShifters:'Forged Carbon',bmwLowerTrim:'Glossy Carbon'}),62499);
  assert.equal(await serverPrice()({...base,airbagCompat:true}),57499);
});

test('Toyota and Mercedes source wheels use their own base price and available paddles',async()=>{
  const base={airbagCompat:false,heated:false,laneAssist:false};
  for(const [brand,wheelStyleType,hasPaddles] of [
    ['TOYOTA','Supra GR',true],
    ['MERCEDES','AMG Performance',true],
    ['MERCEDES','Mercedes 2015–2023',false],
    ['MERCEDES','Mercedes 2010–2015',true],
  ]){
    const cfg={...base,brand,wheelStyleType};
    const starting=brand==='MERCEDES'?(wheelStyleType==='Mercedes 2010–2015'?69999:79999):69999;
    assert.equal(await serverPrice()(cfg),starting);
    assert.equal(await serverPrice()({...cfg,paddleShifters:'Forged Carbon'}),starting+(hasPaddles?2500:0));
    assert.equal(await serverPrice()({...cfg,topBottomMat:'Classic Carbon',ledDisplay:true}),starting+14000);
  }
});

test('Audi B9.5 pricing includes optional cover and full airbag unit',async()=>{
  const cfg={brand:'AUDI',wheelStyleType:'RS 2020+',airbagCompat:false,airbagUpgrade:false};
  assert.equal(await serverPrice()(cfg),79999);
  assert.equal(await serverPrice()({...cfg,airbagCompat:true}),82499);
  assert.equal(await serverPrice()({...cfg,airbagCompat:true,airbagUpgrade:true}),89999);
});

test('Porsche and Dodge source wheels use their listed bases and paddle rules',async()=>{
  const base={airbagCompat:false,heated:false,laneAssist:false};
  for(const wheelStyleType of ['911 Performance (991)','911 Performance (992)']) {
    const cfg={...base,brand:'PORSCHE',wheelStyleType};
    assert.equal(await serverPrice()(cfg),89999);
    assert.equal(await serverPrice()({...cfg,paddleShifters:'Forged Carbon'}),92499);
  }
  const dodge={...base,brand:'DODGE_SRT',wheelStyleType:'SRT'};
  assert.equal(await serverPrice()(dodge),69999);
  assert.equal(await serverPrice()({...dodge,paddleShifters:'Forged Carbon'}),69999);
});
