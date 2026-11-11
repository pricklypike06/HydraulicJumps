(function(root){
  'use strict';
  const g=9.81, density=1000;
  function classifyJump(fr){
    if(fr<1) return 'No jump';
    if(fr===1) return 'Critical flow';
    if(fr<1.7) return 'Undular jump';
    if(fr<2.5) return 'Weak jump';
    if(fr<4.5) return 'Oscillating jump';
    if(fr<9) return 'Steady jump';
    return 'Strong jump';
  }
  function calculateJump({depth,velocity,width}){
    if(![depth,velocity,width].every(v=>typeof v==='number'&&Number.isFinite(v)&&v>0)) throw new RangeError('Depth, velocity and width must be finite positive numbers.');
    const fr1=velocity/Math.sqrt(g*depth), q=depth*velocity, discharge=q*width;
    const energy1=depth+velocity**2/(2*g), hasJump=fr1>1;
    const ratio=hasJump?(Math.sqrt(1+8*fr1**2)-1)/2:null;
    const depth2=hasJump?depth*ratio:null, velocity2=hasJump?q/depth2:null;
    const energy2=hasJump?depth2+velocity2**2/(2*g):null;
    const loss=hasJump?(depth2-depth)**3/(4*depth*depth2):0;
    return {depth,velocity,width,fr1,q,discharge,hasJump,ratio,depth2,velocity2,
      fr2:hasJump?velocity2/Math.sqrt(g*depth2):null,energy1,energy2,loss,
      lossFraction:loss/energy1,power:density*g*discharge*loss,
      criticalDepth:Math.cbrt(q*q/g),classification:classifyJump(fr1)};
  }
  const api={calculateJump,classifyJump,g,density};
  if(typeof module!=='undefined'&&module.exports) module.exports=api;
  else root.Hydraulics=api;
})(typeof globalThis!=='undefined'?globalThis:this);
