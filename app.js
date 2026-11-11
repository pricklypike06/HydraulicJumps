/* Browser-only presentation layer. The calculations live in hydraulics.js. */
(()=>{
  'use strict';
  const $=id=>document.getElementById(id), {calculateJump,g}=Hydraulics;
  const initial={depth:.08,velocity:3.2,width:.4};
  const state={...initial,playing:!matchMedia('(prefers-reduced-motion: reduce)').matches,slow:false,time:0};
  const limits={depth:[.02,.4],velocity:[.2,8],width:[.1,2]};
  const presets={subcritical:[.12,.5],undular:[.08,1.15],weak:[.08,1.85],oscillating:[.08,3.2],steady:[.08,5],strong:[.04,6.5]};
  const descriptions={
    'No jump':'The inflow is already subcritical. These conditions do not support a free hydraulic jump; the depth and velocity shown remain the upstream values.',
    'Critical flow':'The inflow is critical (Fr₁ = 1). The two conjugate depths coincide, so there is no finite jump or jump energy loss.',
    'Undular jump':'Near critical flow, the transition produces gentle surface waves with little energy loss. A developed turbulent roller is not expected.',
    'Weak jump':'A small roller connects shallow upstream flow to deeper downstream water. The mechanical energy loss is relatively modest.',
    'Oscillating jump':'This regime can send waves downstream as the jet and roller fluctuate. The small motion shown is illustrative, not a prediction of jump position.',
    'Steady jump':'A developed roller connects fast upstream flow to slower downstream flow, dissipating a substantial part of the upstream specific energy.',
    'Strong jump':'A strong jump has a pronounced depth increase and high energy dissipation. The illustrated whitewater is not a resolved turbulence simulation.'
  };
  let result=calculateJump(state);
  const fmt=(v,d=3)=>v===null?'—':v.toFixed(d);
  function update(){
    result=calculateJump(state);
    for(const key of Object.keys(limits)) { $(key).value=state[key]; $(key+'-range').value=state[key]; }
    $('regime').textContent=result.classification;
    $('flow-explanation').textContent=descriptions[result.classification];
    $('fr1').textContent=fmt(result.fr1,2);
    $('fr1-note').textContent=result.fr1>1?'Supercritical inflow':result.fr1===1?'Critical inflow':'Subcritical inflow';
    $('depth2').textContent=result.hasJump?fmt(result.depth2)+' m':'—';
    $('depth-ratio').textContent=result.hasJump?fmt(result.ratio,2)+' × the upstream depth':'No sequent jump depth';
    $('loss').textContent=fmt(result.loss)+' m';
    $('loss-percent').textContent=fmt(100*result.lossFraction,1)+'% of upstream specific energy';
    $('discharge').textContent=fmt(result.discharge)+' m³/s';
    $('velocity2').textContent=result.hasJump?fmt(result.velocity2,2)+' m/s':'—';
    $('fr2').textContent=fmt(result.fr2,2);
    $('power').textContent=result.power>=1000?fmt(result.power/1000,2)+' kW':fmt(result.power,1)+' W';
    drawPlots(); drawFlume();
  }
  for(const key of Object.keys(limits)) {
    const number=$(key), range=$(key+'-range');
    range.addEventListener('input',()=>{ state[key]=Number(range.value); $('preset').value='custom'; number.setAttribute('aria-invalid','false'); $('input-message').textContent=''; update(); });
    number.addEventListener('input',()=>{
      const n=number.valueAsNumber,[min,max]=limits[key];
      const valid=Number.isFinite(n)&&n>=min&&n<=max;
      number.setAttribute('aria-invalid',String(!valid));
      if(!valid){$('input-message').textContent=`Enter ${key} between ${min} and ${max}. The last valid result is shown.`;return;}
      $('input-message').textContent=''; state[key]=n; $('preset').value='custom';
      // Do not replace the active numeric field while a user is typing decimals.
      range.value=n; const selection=number.value; update(); number.value=selection;
    });
    number.addEventListener('change',()=>{if(number.getAttribute('aria-invalid')==='true'){number.value=state[key];number.setAttribute('aria-invalid','false');$('input-message').textContent='Invalid entry reverted to the last valid value.';}});
  }
  $('preset').addEventListener('change',()=>{const p=presets[$('preset').value];if(p){state.depth=p[0];state.velocity=p[1];clearValidation();update();}});
  function clearValidation(){for(const key of Object.keys(limits))$(key).setAttribute('aria-invalid','false');$('input-message').textContent='';}
  $('reset').addEventListener('click',()=>{Object.assign(state,initial);$('preset').value='oscillating';clearValidation();update();});
  function pauseLabel(){ $('pause').textContent=state.playing?'Pause':'Play';$('pause').setAttribute('aria-pressed',String(!state.playing)); }
  $('pause').addEventListener('click',()=>{state.playing=!state.playing;pauseLabel();});
  $('slow').addEventListener('click',()=>{state.slow=!state.slow;$('slow').setAttribute('aria-pressed',String(state.slow));});
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',event=>{if(event.matches){state.playing=false;pauseLabel();}});
  $('export').addEventListener('click',()=>{
    const fields=[['upstream_depth_m','depth'],['upstream_velocity_m_s','velocity'],['width_m','width'],['upstream_froude','fr1'],['discharge_m3_s','discharge'],['downstream_depth_m','depth2'],['downstream_velocity_m_s','velocity2'],['downstream_froude','fr2'],['specific_energy_upstream_m','energy1'],['specific_energy_downstream_m','energy2'],['energy_head_loss_m','loss'],['power_dissipated_W','power']];
    const csv='quantity,value\r\n'+fields.map(([label,key])=>label+','+(result[key]??'not applicable')).join('\r\n')+'\r\nclassification,'+result.classification+'\r\nsource,Ideal rectangular-channel calculation - not experimental data\r\n';
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download='hydraulic-jump-calculation.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });

  // SVG graphs use the same calculation module as the displayed outputs.
  const ns='http://www.w3.org/2000/svg';
  function el(parent,tag,attrs,text){const node=document.createElementNS(ns,tag);for(const [k,v]of Object.entries(attrs))node.setAttribute(k,String(v));if(text!==undefined)node.textContent=text;parent.appendChild(node);return node;}
  function axes(svg,xmax,ymax,xlabel,ylabel){
    svg.replaceChildren();
    const x=v=>60+v/xmax*475,y=v=>244-v/ymax*210;
    for(let i=0;i<=4;i++){
      const xv=xmax*i/4,yv=ymax*i/4;
      el(svg,'line',{x1:60,y1:y(yv),x2:535,y2:y(yv),stroke:'#e6eded'});
      el(svg,'text',{x:49,y:y(yv)+4,fill:'#657982','font-size':10,'text-anchor':'end'},tick(yv));
      el(svg,'text',{x:x(xv),y:264,fill:'#657982','font-size':10,'text-anchor':'middle'},tick(xv));
    }
    el(svg,'path',{d:'M60 27 V244 H535',fill:'none',stroke:'#a8b9be'});
    el(svg,'text',{x:300,y:290,fill:'#526c76','font-size':11,'text-anchor':'middle'},xlabel);
    el(svg,'text',{x:17,y:135,fill:'#526c76','font-size':11,transform:'rotate(-90 17 135)','text-anchor':'middle'},ylabel);
    return {x,y};
  }
  function tick(v){return v===0?'0':v<1?v.toFixed(2):v<10?v.toFixed(1):v.toFixed(0);}
  function curve(svg,points,x,y,color){el(svg,'path',{d:points.map(([a,b],i)=>(i?'L':'M')+x(a).toFixed(2)+','+y(b).toFixed(2)).join(' '),fill:'none',stroke:color,'stroke-width':2.5,'stroke-linejoin':'round'});}
  function point(svg,x,y,color,label){const p=el(svg,'circle',{cx:x,cy:y,r:5.5,fill:color,stroke:'#fff','stroke-width':2});el(p,'title',{},label);}
  function drawPlots(){
    const ratioSvg=$('ratio-plot'),fmax=Math.max(10,Math.ceil(result.fr1*1.1));
    const rmax=(Math.sqrt(1+8*fmax*fmax)-1)/2*1.08;
    const a=axes(ratioSvg,fmax,rmax,'Upstream Froude number, Fr₁','Sequent depth ratio, y₂/y₁');
    const pts=[];for(let i=0;i<=160;i++){const fr=1+(fmax-1)*i/160;pts.push([fr,(Math.sqrt(1+8*fr*fr)-1)/2]);}
    el(ratioSvg,'rect',{x:60,y:28,width:a.x(1)-60,height:216,fill:'#ecf0ef'});
    curve(ratioSvg,pts,a.x,a.y,'#087f86');
    if(result.hasJump){el(ratioSvg,'line',{x1:a.x(result.fr1),x2:a.x(result.fr1),y1:244,y2:a.y(result.ratio),stroke:'#dc693c','stroke-dasharray':'4 4'});point(ratioSvg,a.x(result.fr1),a.y(result.ratio),'#dc693c',`Fr₁ ${fmt(result.fr1,2)}, depth ratio ${fmt(result.ratio,2)}`);}
    else el(ratioSvg,'text',{x:300,y:70,fill:'#526c76','font-size':12,'text-anchor':'middle'},'Current inflow: no free jump');
    const svg=$('energy-plot'),f=result.fr1,critical=result.criticalDepth/state.depth;
    const z2=result.ratio??1,xmax=Math.max(2.2,z2*1.3,critical*1.7);
    const ymax=Math.max(2,result.energy1/state.depth*1.2,xmax*1.12);
    const b=axes(svg,xmax,ymax,'Water depth, y/y₁','Specific energy, E/y₁');
    // E/y₁ = z + Fr₁²/(2 z²). Omit values outside the displayed energy range.
    const zmin=Math.max(.02,f/Math.sqrt(2*ymax));
    const energyPts=[];for(let i=0;i<=240;i++){const z=zmin+(xmax-zmin)*i/240,e=z+f*f/(2*z*z);if(e<=ymax)energyPts.push([z,e]);}
    curve(svg,energyPts,b.x,b.y,'#879ea6');
    el(svg,'line',{x1:b.x(critical),x2:b.x(critical),y1:32,y2:244,stroke:'#abbcbf','stroke-dasharray':'4 4'});
    if(result.hasJump){
      el(svg,'line',{x1:b.x(1),x2:b.x(z2),y1:b.y(result.energy1/state.depth),y2:b.y(result.energy2/state.depth),stroke:'#bddbd8','stroke-dasharray':'4 4'});
      point(svg,b.x(z2),b.y(result.energy2/state.depth),'#087f86',`Downstream: depth ${fmt(result.depth2)} m, specific energy ${fmt(result.energy2)} m`);
    }
    point(svg,b.x(1),b.y(result.energy1/state.depth),'#dc693c',`Upstream: depth ${fmt(state.depth)} m, specific energy ${fmt(result.energy1)} m`);
  }

  const canvas=$('flume'),ctx=canvas.getContext('2d'),W=1100,bed=337;
  const particles=Array.from({length:115},(_,i)=>({phase:i/115,layer:((i*37)%101)/101,size:i%3===0?1.7:1}));
  function text(str,x,y,size=14,color='#aac5d0',align='left'){ctx.font=`${size}px Segoe UI, Arial, sans-serif`;ctx.fillStyle=color;ctx.textAlign=align;ctx.fillText(str,x,y);}
  function drawFlume(){
    const r=result,t=state.time,jump=r.hasJump,undular=jump&&r.fr1<1.7;
    ctx.clearRect(0,0,W,420);ctx.fillStyle='#102b39';ctx.fillRect(0,0,W,420);
    // Dynamic shared vertical scale keeps both depths visible without individually clipping them.
    const y2=r.depth2??state.depth,scale=235/Math.max(.32,y2*1.12,state.depth*1.12);
    const h1=state.depth*scale,h2=y2*scale;
    const toe=390+(r.fr1>=2.5&&r.fr1<4.5?Math.sin(t*1.3)*8:0),end=toe+210;
    const surface=x=>{
      if(!jump)return bed-h1+Math.sin(x*.025-t*2)*1.1;
      const u=Math.max(0,Math.min(1,(x-toe)/(end-toe))),smooth=u*u*(3-2*u);
      const base=bed-h1-(h2-h1)*smooth;
      if(undular&&x>toe)return base+Math.sin((x-toe)*.045-t*1.7)*Math.min(7,(h2-h1)*.28)*Math.exp(-(x-toe)/550);
      if(x>toe&&x<end+130)return base+Math.sin(x*.08-t*5)*Math.min(5,r.fr1*.45)*Math.sin(Math.min(1,(x-toe)/(end+130-toe))*Math.PI);
      return base+Math.sin(x*.03-t*2)*1.1;
    };
    ctx.strokeStyle='#ffffff05';ctx.lineWidth=1;for(let x=50;x<W;x+=60){ctx.beginPath();ctx.moveTo(x,75);ctx.lineTo(x,bed);ctx.stroke();}for(let y=97;y<bed;y+=60){ctx.beginPath();ctx.moveTo(30,y);ctx.lineTo(1070,y);ctx.stroke();}
    const water=ctx.createLinearGradient(0,bed-Math.max(h1,h2),0,bed);water.addColorStop(0,'#3baec0');water.addColorStop(.35,'#167e9f');water.addColorStop(1,'#104b70');
    ctx.beginPath();ctx.moveTo(0,bed);for(let x=0;x<=W;x+=4)ctx.lineTo(x,surface(x));ctx.lineTo(W,bed);ctx.closePath();ctx.fillStyle=water;ctx.fill();
    ctx.beginPath();for(let x=0;x<=W;x+=4){const y=surface(x);if(x===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.lineWidth=2;ctx.strokeStyle='#8be3e9';ctx.stroke();
    // Tracers advect through an illustrative depth profile. Their downstream motion slows with V₂/V₁.
    ctx.fillStyle='#d9f7fa';
    for(const p of particles){
      const travel=state.velocity*t*45+p.phase*W,upstreamLength=toe;
      const stretch=jump?Math.max(1,r.ratio):1;
      const cycle=upstreamLength+(W-upstreamLength)*stretch;
      const s=((travel%cycle)+cycle)%cycle;
      const x=s<upstreamLength?s:upstreamLength+(s-upstreamLength)/stretch;
      const surf=surface(x),depthPx=bed-surf;
      const y=surf+Math.min(5,depthPx*.15)+p.layer*Math.max(0,depthPx-8);
      ctx.globalAlpha=.25+p.layer*.4;ctx.beginPath();ctx.ellipse(x,y,p.size*2.8,p.size,0,0,Math.PI*2);ctx.fill();
    }ctx.globalAlpha=1;
    if(jump&&!undular){
      const centerX=toe+115,centerY=surface(centerX)+Math.min(35,(h2-h1)*.25),rx=65,ry=Math.min(29,Math.max(4,(h2-h1)*.24));
      for(let k=0;k<25;k++){const angle=-t*2.7+k*Math.PI*2/25;const x=centerX+Math.cos(angle)*rx,y=centerY+Math.sin(angle)*ry;if(y>surface(x)+2&&y<bed-3){ctx.fillStyle=`rgba(237,255,255,${.25+(k%4)*.12})`;ctx.beginPath();ctx.arc(x,y,1.6+k%3,0,Math.PI*2);ctx.fill();}}
      // Surface return flow is upstream; main discharge remains left to right.
      text('↶  TURBULENT ROLLER',toe+120,Math.max(65,bed-h2-30),12,'#c6edf0','center');
      for(let k=0;k<35;k++){const x=toe+25+(k*43%195),y=surface(x)+4+Math.sin(t*4+k)*3;ctx.fillStyle='#e7ffff88';ctx.beginPath();ctx.arc(x,y,1+k%3*.7,0,7);ctx.fill();}
    }
    ctx.fillStyle='#617580';ctx.fillRect(0,bed+1,W,9);ctx.fillStyle='#263f4c';ctx.fillRect(0,bed+10,W,16);
    ctx.strokeStyle='#78919b';for(let x=0;x<W;x+=18){ctx.beginPath();ctx.moveTo(x,bed+25);ctx.lineTo(x+9,bed+12);ctx.stroke();}
    // A schematic gate upstream, opening at the upstream water depth.
    ctx.fillStyle='#8299a3';ctx.fillRect(48,45,13,Math.max(0,bed-h1-45));ctx.fillStyle='#e78f65';ctx.fillRect(37,39,35,6);
    text('SLUICE GATE',83,55,11);text('FLOW DIRECTION  →',80,100,12,'#c9dfe7');
    depthMarker(225,h1,`y₁ = ${fmt(state.depth)} m`,'#d5eef2');
    if(jump)depthMarker(925,h2,`y₂ = ${fmt(y2)} m`,'#d5eef2');
    text(`V₁ = ${fmt(state.velocity,2)} m/s →`,135,bed-h1-44,13,'#ecf5f6');
    if(jump)text(`V₂ = ${fmt(r.velocity2,2)} m/s →`,920,Math.max(45,bed-h2-44),13,'#ecf5f6','center');
    if(jump){ctx.strokeStyle='#e29570';ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(toe,bed+26);ctx.lineTo(toe,bed+45);ctx.stroke();ctx.setLineDash([]);text(undular?'WAVE TRANSITION':'JUMP TOE',toe,bed+65,11,'#e7a180','center');}
    text('HORIZONTAL CHANNEL BED',80,bed+65,10,'#9bb2be');
    text(jump?'SUPERCRITICAL':'SUBCRITICAL',190,143,11,'#83bac8','center');
    if(jump)text('SUBCRITICAL',920,Math.max(22,bed-h2-75),11,'#83bac8','center');
    function depthMarker(x,h,label,color){ctx.strokeStyle=color;ctx.lineWidth=1;ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(x,bed-3);ctx.lineTo(x,bed-h);ctx.stroke();ctx.setLineDash([]);text(label,x,bed-h-17,13,color,'center');}
  }
  let previous;
  function frame(timestamp){const dt=previous===undefined?0:Math.min(.05,(timestamp-previous)/1000);previous=timestamp;if(state.playing){state.time+=dt*(state.slow?.5:1);drawFlume();}requestAnimationFrame(frame);}
  pauseLabel();update();requestAnimationFrame(frame);
})();
