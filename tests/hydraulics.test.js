const {test}=require('node:test');
const assert=require('node:assert/strict');
let model={};
try { model=require('../hydraulics.js'); } catch(error) { if(error.code!=='MODULE_NOT_FOUND') throw error; }
const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-9*Math.max(1,Math.abs(expected)),`${actual} != ${expected}`);
test('Fr=2 matches the analytical conjugate depth and loss benchmark',()=>{
  assert.equal(typeof model.calculateJump,'function');
  const r=model.calculateJump({depth:1,velocity:2*Math.sqrt(9.81),width:2});
  close(r.fr1,2); close(r.ratio,(Math.sqrt(33)-1)/2);
  close(r.loss,(r.depth2-1)**3/(4*r.depth2));
});
test('mass, momentum and specific energy agree across the supported grid',()=>{
  assert.equal(typeof model.calculateJump,'function');
  for(const depth of [.02,.08,.25,.4]) for(const velocity of [.2,1,3.2,6,8]) for(const width of [.1,.4,2]) {
    const r=model.calculateJump({depth,velocity,width});
    close(r.discharge,width*depth*velocity);
    if(!r.hasJump) continue;
    close(depth*velocity,r.depth2*r.velocity2);
    close(depth*depth/2+r.q*r.q/(9.81*depth),r.depth2*r.depth2/2+r.q*r.q/(9.81*r.depth2));
    close(r.energy1-r.energy2,r.loss);
    assert.ok(r.fr2<1 && r.loss>0 && r.lossFraction<1);
  }
});
test('subcritical and exactly critical inflows do not produce a conjugate jump',()=>{
  assert.equal(typeof model.calculateJump,'function');
  for(const velocity of [.5,Math.sqrt(9.81)]) {
    const r=model.calculateJump({depth:1,velocity,width:1});
    assert.equal(r.hasJump,false); assert.equal(r.depth2,null); assert.equal(r.loss,0);
  }
});
test('invalid input is rejected before calculating',()=>{
  assert.equal(typeof model.calculateJump,'function');
  for(const value of [0,-1,NaN,Infinity,'1',undefined]) for(const key of ['depth','velocity','width']) {
    assert.throws(()=>model.calculateJump({...{depth:.08,velocity:3.2,width:.4},[key]:value}),RangeError);
  }
});
test('jump classification handles boundaries',()=>{
  assert.equal(typeof model.classifyJump,'function');
  for(const [fr,label] of [[.9,'No jump'],[1,'Critical flow'],[1.2,'Undular jump'],[1.7,'Weak jump'],[2.5,'Oscillating jump'],[4.5,'Steady jump'],[9,'Strong jump']]) assert.equal(model.classifyJump(fr),label);
});
