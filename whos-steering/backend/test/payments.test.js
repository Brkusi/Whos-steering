const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {refundTotals,validateRefund,paymentSnapshot,syncRefunds}=require('../lib/refunds');
const {verifiedCapture}=require('../lib/paypal');
const {presetPrice}=require('../lib/preset-pricing');

test('preset prices are authoritative and preserve the existing catalog options',()=>{
  assert.equal(presetPrice({presetId:'bmw-m-sport-carbon',brand:'BMW',heated:true,laneAssist:true,price:1}),75499);
  assert.equal(presetPrice({presetId:'bmw-e-carbone',brand:'BMW',paddleShifterSpaceInserts:true}),49999);
  assert.equal(presetPrice({presetId:'rs-stealth',brand:'AUDI',airbagCompat:true,airbagUpgrade:true}),77999);
  assert.throws(()=>presetPrice({presetId:'made-up',brand:'BMW'}));
  assert.throws(()=>presetPrice({presetId:'rs-stealth',brand:'BMW'}));
});

test('pending refunds reserve balance; failed and canceled refunds do not',()=>{
  assert.deepEqual(refundTotals(10000,[{amount:2000,status:'succeeded'},{amount:3000,status:'pending'},{amount:1000,status:'failed'},{amount:1000,status:'canceled'}]),{completed:2000,pending:3000,available:5000});
});
test('refund request rejects invalid amounts, reasons, identifiers and missing audit notes',()=>{
  const body={amount:100,reason:'requested_by_customer',requestId:'12345678-1234-1234-1234-123456789012',note:'Customer request'};
  validateRefund(body);
  for(const amount of [0,-1,1.1,NaN,Infinity,'100']) assert.throws(()=>validateRefund({...body,amount}));
  assert.throws(()=>validateRefund({...body,note:''}));assert.throws(()=>validateRefund({...body,reason:'anything'}));assert.throws(()=>validateRefund({...body,requestId:'short'}));
});
const stripeWith=refunds=>({paymentIntents:{retrieve:async()=>({status:'succeeded',currency:'usd',latest_charge:{id:'ch_test',amount_captured:10000,payment_method_details:{type:'card'}}})},refunds:{list:()=>({async *[Symbol.asyncIterator](){for(const r of refunds)yield r;}})}});
test('snapshot reads all refunds and retains request IDs for safe retries',async()=>{
  const refunds=Array.from({length:105},(_,i)=>({id:'r'+i,amount:1,status:'succeeded',metadata:{requestId:'request'+i}}));
  const snapshot=await paymentSnapshot(stripeWith(refunds),'pi_test');assert.equal(snapshot.refunds.length,105);assert.equal(snapshot.available,9895);assert.equal(snapshot.refunds[104].requestId,'request104');
});
test('partial refund does not mark fulfillment refunded',async()=>{
  const queries=[];const client={query:async(q)=>{queries.push(q);return{rows:[]};}};
  await syncRefunds(client,stripeWith([{id:'r',amount:2000,status:'succeeded'}]),'pi_test');assert.equal(queries.some(q=>q.includes('UPDATE orders')),false);
});
test('pending full refund does not mark fulfillment refunded',async()=>{
  const queries=[];await syncRefunds({query:async(q)=>{queries.push(q);return{rows:[]};}},stripeWith([{id:'r',amount:10000,status:'pending'}]),'pi_test');assert.equal(queries.some(q=>q.includes('UPDATE orders')),false);
});
test('confirmed full refund changes fulfillment once with its actual prior status',async()=>{
  const queries=[];await syncRefunds({query:async(q,p)=>{queries.push([q,p]);return{rows:q.startsWith('SELECT')?[{id:'order',status:'shipped'}]:[]};}},stripeWith([{id:'r',amount:10000,status:'succeeded'}]),'pi_test');
  assert.equal(queries.filter(([q])=>q.includes('UPDATE orders')).length,1);assert.deepEqual(queries.find(([q])=>q.includes('INSERT INTO order_status_history'))[1],['order','shipped']);
});
test('PayPal confirmation rejects mismatched order, amount or currency',()=>{
  const payment={order_id:'order',amount:'100.00'};
  const order={purchase_units:[{custom_id:'order',payments:{captures:[{id:'cap',status:'COMPLETED',amount:{currency_code:'USD',value:'100.00'}}]}}]};
  assert.equal(verifiedCapture(order,payment).id,'cap');assert.equal(verifiedCapture(order,{...payment,order_id:'other'}),null);assert.throws(()=>verifiedCapture(order,{...payment,amount:'101.00'}));order.purchase_units[0].payments.captures[0].amount.currency_code='EUR';assert.throws(()=>verifiedCapture(order,payment));
});
test('refund route uses admin middleware and retries reuse an existing Stripe refund',async()=>{
  const routes={};const middleware=[];const router={use:fn=>middleware.push(fn),get:(p,fn)=>{routes['GET '+p]=fn;},post:(p,fn)=>{routes['POST '+p]=fn;}};
  const admin=()=>{};let calls=0;
  const body={amount:1000,reason:'requested_by_customer',note:'Customer request',requestId:'12345678-1234-1234-1234-123456789012'};
  const refunds=[{id:'re_existing',amount:1000,status:'succeeded',reason:body.reason,metadata:{requestId:body.requestId,note:body.note}}];
  const stripe=stripeWith(refunds);stripe.refunds.create=()=>{calls++;throw new Error('Must not create a duplicate');};
  const client={query:async(q)=>({rows:q.startsWith('SELECT p.stripe')?[{stripe_payment_intent:'pi_test',order_id:'order',status:'paid'}]:[]}),release:()=>{}};
  const pool={connect:async()=>client,query:async()=>({rows:[{provider:'stripe'}]})};
  const module={exports:{}};
  vm.runInNewContext(fs.readFileSync(require.resolve('../routes/payments'),'utf8'),{module,exports:module.exports,console,process,require:name=>({'express':{Router:()=>router},'../db/pool':pool,'../middleware/auth':{adminRequired:admin},'../lib/refunds':{validateRefund,paymentSnapshot,syncRefunds},stripe:()=>stripe})[name]});
  assert.equal(middleware[0],admin);
  let result;const res={status(code){this.statusCode=code;return this;},json(value){result=value;return this;}};
  await routes['POST /:id/refunds']({params:{id:'payment'},body,user:{id:'admin'}},res);assert.equal(calls,0);assert.equal(result.refund.id,'re_existing');
  await routes['POST /:id/refunds']({params:{id:'payment'},body:{...body,amount:2000},user:{id:'admin'}},res);assert.equal(res.statusCode,409);assert.equal(calls,0);
});

test('refund setup failures return an error response and release acquired connections', async () => {
  for (const failure of ['lookup', 'missing', 'connect', 'begin-and-rollback']) {
    const routes = {};
    let released = 0;
    let providerCalls = 0;
    const client = {
      query: async () => { throw new Error('Database unavailable'); },
      release: () => { released++; }
    };
    const pool = {
      query: async () => {
        if (failure === 'lookup') throw new Error('Lookup failed');
        return { rows: failure === 'missing' ? [] : [{ provider: 'stripe' }] };
      },
      connect: async () => {
        if (failure === 'connect') throw new Error('Connection failed');
        return client;
      }
    };
    const module = { exports: {} };
    vm.runInNewContext(fs.readFileSync(require.resolve('../routes/payments'), 'utf8'), {
      module, exports: module.exports, process, console: { error() {} },
      require: name => ({
        express: { Router: () => ({ use() {}, get() {}, post: (path, handler) => { routes[path] = handler; } }) },
        '../db/pool': pool,
        '../middleware/auth': { adminRequired() {} },
        '../lib/refunds': { validateRefund, paymentSnapshot, syncRefunds },
        stripe: () => ({ refunds: { create() { providerCalls++; } } })
      })[name]
    });
    const res = { status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
    await routes['/:id/refunds']({
      params: { id: 'payment' }, user: { id: 'admin' },
      body: { amount: 1000, reason: 'requested_by_customer', note: 'Customer request', requestId: '12345678-1234-1234-1234-123456789012' }
    }, res);
    assert.equal(res.statusCode, failure === 'missing' ? 404 : 502, failure);
    assert.equal(typeof res.body.error, 'string');
    assert.equal(released, failure === 'begin-and-rollback' ? 1 : 0, failure);
    assert.equal(providerCalls, 0, failure);
  }
});
