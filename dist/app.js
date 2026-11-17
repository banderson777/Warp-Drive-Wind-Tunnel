'use strict';
const byId=id=>document.getElementById(id);
const inputs=['speed','radius','width','compactness'];
const models={
  alcubierre:['A translating bubble with flat spatial slices.','NEC violated','For nonzero speed in this model.','ds² = −dt² + [dx + v(1 − f)dt]² + dy² + dz²','The wall’s transverse shear gives ρ = −v²(f′y/r)²/(32π) on this slice. Expansion θ = vf′x/r. An axial photon emitted toward the front has coordinate speed 1 − v(1 − f), which can vanish in the wall for v > 1.','https://arxiv.org/abs/gr-qc/0009013'],
  natario:['A translating bubble with divergence-free flow.','NEC violated','For this nontrivial zero-expansion flow.','u = ∇ × [vf(r)(eₓ × r⃗)/2],  ds² = −dt² + |d𝐫 − (u − veₓ)dt|²','The radial profile is used as a vector potential. The volume expansion vanishes everywhere, while shear requires negative Eulerian energy. The local flow can exceed the prescribed bubble speed.','https://arxiv.org/abs/gr-qc/0110086'],
  pocket:['A large proper interior behind a small coordinate radius.','WEC violated','Negative Eulerian density in the conformal wall.','ds² = −dt² + B(r)²{[dx + v(1 − f)dt]² + dy² + dz²}','Uses the Van Den Broeck metric ansatz with a softened teaching profile: B = 4 in the pocket and transitions to 1 across a quintic wall. The Hamiltonian constraint includes the intrinsic curvature of the B²-scaled spatial slices. This choice shows the geometry at moderate scales. The paper explores much larger scale ratios.','https://arxiv.org/abs/gr-qc/9905084'],
  shell:['A static, curved-space comparison with a positive-density wall.','NEC violated','Radial null contraction is negative outside the wall.','ds² = −dt² + dr²/(1 − 2m(r)/r) + r²dΩ²','The mass function smoothly rises from zero to M across the shell. The density is m′/(4πr²), radial pressure is −m/(4πr³), and tangential pressure is (m − rm′)/(8πr³). Local NEC shows ρ + min(pᵣ, pₜ). This idealized shell has constant lapse and serves as a comparison with published subluminal shell metrics.','https://arxiv.org/abs/2405.02709'],
  flat:['The special-relativistic control for the optical experiment.','Vacuum','Null energy condition saturated.','ds² = −dt² + dx² + dy² + dz²','The stress–energy and shift vanish. Photons follow straight lines.']
};
const library=[
  ['1994','Alcubierre · Hyper-fast travel','The original prescribed translating bubble and its required stress–energy.','https://arxiv.org/abs/gr-qc/0009013'],
  ['1999','Van Den Broeck · Pocket geometry','Changes the spatial geometry to place a large proper interior behind a small exterior bubble.','https://arxiv.org/abs/gr-qc/9905084'],
  ['2002','Natário · Zero expansion','Constructs a divergence-free bubble flow with nontrivial shear.','https://arxiv.org/abs/gr-qc/0110086'],
  ['2021','Bobrick & Martire · Physical warp drives','Classifies warp geometries and studies subluminal positive-energy matter shells.','https://arxiv.org/abs/2102.06824'],
  ['2021','Lentz · Hyper-fast solitons','Proposes positive energy. A later preprint reports negative Eulerian density in parts of the construction.','https://arxiv.org/abs/2006.07125'],
  ['2022','Santiago, Schuster & Visser · Null energy','Shows why energy measured by one observer is insufficient and analyzes NEC violations in generic warp metrics.','https://arxiv.org/abs/2105.03079'],
  ['2024','Fuchs et al. · Constant-velocity shell','Reports a subluminal construction that combines a matter shell with a shift field.','https://arxiv.org/abs/2405.02709'],
  ['CODE','Warp Factory · MATLAB','Open numerical toolkit for calculating stress–energy and evaluating energy conditions for prescribed metrics.','https://github.com/NerdsWithAttitudes/WarpFactory'],
  ['2025 · PREPRINT','Weak energy violations in Lentz metrics','Revisits the Lentz stress–energy tensor and reports regions of negative Eulerian density.','https://arxiv.org/abs/2511.18251'],
  ['2026 · PREPRINT','Warp-spacetime classification','Reexamines proposals, their restrictions and what their metrics imply for physical viability.','https://arxiv.org/abs/2602.16495'],
  ['2026 · PREPRINT','Observer-robust energy checks','Studies energy conditions across observer directions and compares several published metrics.','https://arxiv.org/abs/2602.18023'],
  ['CODE','Warpax · JAX','Research code accompanying observer-robust tests of warp-drive spacetimes.','https://github.com/anindex/warpax'],
  ['2026','New realizations in general relativity','Develops alternative GR constructions and examines links with Newtonian gravity.','https://www.mdpi.com/2218-1997/12/5/132'],
  ['2026 · PREPRINT','Radiative steering of warp shells','Studies a subluminal shell matched to a radiating exterior, with perturbative and numerical shell checks.','https://arxiv.org/abs/2606.22531'],
  ['2026 · PREPRINT','Sharp energy bound for Natário walls','Studies how the minimum integrated negative energy scales with wall thickness in the zero-expansion case.','https://arxiv.org/abs/2609.36211']
];
for(const [year,title,note,url] of library){
  const article=document.createElement('article');
  const label=document.createElement('small'), link=document.createElement('a'), description=document.createElement('p');
  label.textContent=year;
  link.href=url;
  link.textContent=title+' ↗';
  description.textContent=note;
  article.append(label,link,description);
  byId('papers').append(article);
}
const fieldNames={rho:'Eulerian density ρ · ℓ⁻²',expansion:'Volume expansion θ · ℓ⁻¹',shift:'Bubble flow magnitude · c',nec:'Minimum null contraction · ℓ⁻²'};
const background=[8,15,28], negative=[231,111,247], positive=[63,224,205];
const scientific=value=>value===0?'0':value.toExponential(2);
const extent=6.2, aspect=1.65, vertical=extent/aspect;
let metric, layer='rho', paused=matchMedia('(prefers-reduced-motion: reduce)').matches;
let phase=0, scheduled=false, last=0;
const panels=Array.from({length:2},()=>{
  const element=byId('plot-template').content.firstElementChild.cloneNode(true);
  const canvas=element.querySelector('canvas'), heat=document.createElement('canvas');
  byId('plots').append(element);
  return {element,canvas,heat,ctx:canvas.getContext('2d'),hc:heat.getContext('2d'),
    get:role=>element.querySelector('[data-role="'+role+'"]'),trace:[]};
});
panels[1].element.hidden=true;

function update(){
  const comparing=byId('compare').checked;
  const primary=byId('model').value;
  const selected=comparing?[primary,byId('second-model').value]:[primary];
  const active=panels.slice(0,selected.length);
  const supportsNEC=selected.every(model=>['shell','flat'].includes(model));
  if(layer==='nec' && !supportsNEC) layer='rho';
  byId('comparison-controls').hidden=!comparing;
  byId('plots').classList.toggle('comparing',comparing);
  panels[1].element.hidden=!comparing;
  const values=Object.fromEntries(inputs.map(id=>[id,Number(byId(id).value)]));
  const settings=selected.map(model=>({...values,model,speed:['flat','shell'].includes(model)?0:values.speed}));
  for(const id of inputs){
    const needed=selected.some(model=>model!=='flat' && (id==='compactness'?model==='shell':id!=='speed'||model!=='shell'));
    byId(id+'-row').hidden=!needed;
    byId(id+'-out').textContent=values[id].toFixed(2)+({speed:' c',radius:' ℓ',width:' ℓ',compactness:''}[id]);
  }
  byId('model-note').textContent=models[primary][0];
  const direction=Math.min(...settings.map(Warp.rayDirection));
  const dt=Math.min(...settings.map(Warp.rayTimeStep));
  const traceEnabled=byId('rays').checked;
  byId('launch-note').hidden=!comparing || !traceEnabled;
  byId('launch-note').textContent=direction===1?'Photons enter both views from the left.':'Photons enter both views from the right at the selected bubble speed.';
  for(const [index,panel] of active.entries()){
    const snapshot=settings[index], model=snapshot.model;
    const title=byId(index?'second-model':'model').selectedOptions[0].textContent;
    panel.snapshot=snapshot;
    panel.get('title').textContent=title;
    panel.get('title').hidden=!comparing;
    panel.canvas.setAttribute('aria-label',title+' · '+fieldNames[layer]+' cross-section');
    const vacuum=snapshot.speed===0 && !['shell','pocket'].includes(model);
    panel.get('condition').textContent=vacuum?'Vacuum':models[model][1];
    panel.get('condition-note').textContent=vacuum?models.flat[2]:models[model][2];
    const traceKey=JSON.stringify([snapshot,direction,dt,traceEnabled]);
    if(traceKey!==panel.traceKey){
      panel.traceKey=traceKey;
      panel.trace=traceEnabled?Warp.rays(snapshot,extent,{direction,dt}):[];
      panel.get('integration').textContent=traceEnabled?scientific(Math.max(...panel.trace.map(ray=>ray.drift))):'Off';
    }
    const sampleKey=JSON.stringify([snapshot,layer]);
    if(sampleKey!==panel.sampleKey){
      panel.sampleKey=sampleKey;
      panel.samples=sample(panel);
    }
  }
  updateEquations(selected);
  for(const button of document.querySelectorAll('[data-field]')){
    button.disabled=button.dataset.field==='nec' && !supportsNEC;
    button.setAttribute('aria-pressed',button.dataset.field===layer);
  }
  const negativeValues=active.some(p=>p.samples.min<0), positiveValues=active.some(p=>p.samples.max>0);
  const limit=Math.max(...active.map(p=>Math.max(-p.samples.min,p.samples.max)));
  byId('legend-title').textContent=(comparing?'Shared scale · ':'')+fieldNames[layer];
  byId('legend-min').textContent=scientific(negativeValues?-limit:0);
  byId('legend-max').textContent=scientific(positiveValues?limit:0);
  byId('gradient').style.background=negativeValues && positiveValues?'linear-gradient(90deg,#e76ff7,#080f1c,#3fe0cd)':negativeValues?'linear-gradient(90deg,#e76ff7,#080f1c)':positiveValues?'linear-gradient(90deg,#080f1c,#3fe0cd)':'#28364d';
  for(const panel of active){
    colorize(panel,limit);
    resize(panel);
    paint(panel);
  }
}
function updateEquations(selected){
  const key=selected.join(',');
  if(key===metric) return;
  metric=key;
  const sections=[...new Set(selected)].map(model=>{
    const [,,,equation,interpretation,url]=models[model];
    const section=document.createElement('section'), formula=document.createElement('p'), explanation=document.createElement('p');
    if(selected.length>1){
      const heading=document.createElement('h3');
      heading.textContent=Array.from(byId('model').options).find(option=>option.value===model).textContent;
      section.append(heading);
    }
    formula.className='formula';
    formula.textContent=equation;
    explanation.textContent=interpretation;
    if(url){
      const link=document.createElement('a');
      link.href=url;
      link.textContent=model==='shell'?'Related paper ↗':'Model reference ↗';
      explanation.append(' ',link);
    }
    section.append(formula,explanation);
    return section;
  });
  byId('equations').replaceChildren(...sections);
}
function sample(panel){
  const nx=200, ny=Math.round(nx/aspect), values=new Float64Array(nx*ny);
  panel.heat.width=nx;
  panel.heat.height=ny;
  let min=0,max=0,minRho=0;
  for(let j=0;j<ny;j++) for(let i=0;i<nx;i++){
    const x=(2*(i+.5)/nx-1)*extent, y=(1-2*(j+.5)/ny)*vertical;
    const result=Warp.field(x,y,panel.snapshot), value=result[layer] || 0;
    values[j*nx+i]=value;
    min=Math.min(min,value);
    max=Math.max(max,value);
    minRho=Math.min(minRho,result.rho);
  }
  panel.get('density').textContent=scientific(minRho);
  return {min,max,values};
}
function colorize(panel,limit){
  const {heat,hc,samples}=panel;
  if(panel.coloredSamples===samples && panel.limit===limit) return;
  panel.coloredSamples=samples;
  panel.limit=limit;
  const buffer=hc.createImageData(heat.width,heat.height);
  samples.values.forEach((v,i)=>{
    const color=v<0?negative:positive;
    const intensity=v===0?0:(Math.abs(v)/limit)**.65;
    for(let c=0;c<3;c++) buffer.data[i*4+c]=background[c]+intensity*(color[c]-background[c]);
    buffer.data[i*4+3]=255;
  });
  hc.putImageData(buffer,0,0);
}
function paint({snapshot,w,h,ctx,heat,trace}){
  if(!snapshot || !w) return;
  const unit=w/(2*extent);
  const x=u=>w/2+u*unit, y=v=>h/2-v*unit;
  ctx.drawImage(heat,0,0,w,h);
  ctx.lineWidth=1;
  if(byId('grid').checked){
    ctx.beginPath();
    for(let i=Math.ceil(-extent);i<=extent;i++){
      ctx.moveTo(x(i),0);
      ctx.lineTo(x(i),h);
    }
    for(let i=Math.ceil(-vertical);i<=vertical;i++){
      ctx.moveTo(0,y(i));
      ctx.lineTo(w,y(i));
    }
    ctx.strokeStyle='rgba(168,191,226,.14)';
    ctx.stroke();
    ctx.font='11px monospace';
    ctx.fillStyle='#9eafc9';
    for(let i=-6;i<=6;i+=2) ctx.fillText(String(i),x(i)+4,h-12);
    ctx.fillText('x / ℓ',w-46,h-12);
    ctx.fillText('y / ℓ',10,17);
  }
  if(snapshot.model!=='flat'){
    ctx.beginPath();
    ctx.arc(x(0),y(0),snapshot.radius*unit,0,Math.PI*2);
    ctx.setLineDash([4,6]);
    ctx.strokeStyle='rgba(221,224,255,.55)';
    ctx.stroke();
    ctx.setLineDash([]);
  }
  for(const {path} of trace){
    ctx.beginPath();
    path.forEach(([u,v],i)=>i?ctx.lineTo(x(u),y(v)):ctx.moveTo(x(u),y(v)));
    ctx.strokeStyle='rgba(129,228,250,.52)';
    ctx.stroke();
    ctx.fillStyle='#b7f7ff';
    for(let i=Math.floor(phase)%75;i<path.length;i+=75){
      const [u,v]=path[i];
      ctx.beginPath();
      ctx.arc(x(u),y(v),1.55,0,Math.PI*2);
      ctx.fill();
    }
  }
}
function queue(){
  if(scheduled) return;
  scheduled=true;
  requestAnimationFrame(()=>{scheduled=false; update();});
}
function resize(panel){
  const {canvas,ctx}=panel;
  const {width,height}=canvas.getBoundingClientRect(), ratio=Math.min(devicePixelRatio,2);
  if(!width || !height) return;
  panel.w=width;
  panel.h=height;
  const pixelWidth=Math.round(width*ratio), pixelHeight=Math.round(height*ratio);
  if(canvas.width!==pixelWidth || canvas.height!==pixelHeight){
    canvas.width=pixelWidth;
    canvas.height=pixelHeight;
  }
  ctx.setTransform(ratio,0,0,ratio,0,0);
}
function setPause(){
  byId('pause').textContent=paused?'▶  Resume':'Ⅱ  Pause';
  byId('pause').setAttribute('aria-pressed',paused);
}
function animate(now){
  const running=panels.filter(panel=>!panel.element.hidden && panel.trace.length);
  if(!paused && running.length && now-last>32){
    phase=(phase+Math.min(now-last,100)*.026)%75;
    running.forEach(paint);
    last=now;
  }
  requestAnimationFrame(animate);
}
for(const id of [...inputs,'model','compare','second-model','rays','grid']) byId(id).addEventListener('input',queue);
for(const button of document.querySelectorAll('[data-field]')) button.addEventListener('click',()=>{layer=button.dataset.field;queue();});
byId('pause').addEventListener('click',()=>{paused=!paused;setPause();});
byId('reset').addEventListener('click',()=>{
  for(const id of inputs) byId(id).value=byId(id).defaultValue;
  byId('model').value='alcubierre';
  byId('second-model').value='natario';
  byId('compare').checked=false;
  for(const id of ['rays','grid']) byId(id).checked=true;
  paused=matchMedia('(prefers-reduced-motion: reduce)').matches;
  layer='rho';
  phase=0;
  setPause();
  queue();
});
const observer=new ResizeObserver(queue);
for(const panel of panels) observer.observe(panel.canvas);
queue();
setPause();
requestAnimationFrame(animate);
