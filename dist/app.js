'use strict';
const byId=id=>document.getElementById(id);
const inputs=['speed','radius','width','compactness'];
const models={
  alcubierre:['A translating bubble with flat spatial slices.','NEC violated','For nonzero speed in this model.','ds² = −dt² + [dx + v(1 − f)dt]² + dy² + dz²','The wall’s transverse shear gives ρ = −v²(f′y/r)²/(32π) on this slice. Expansion θ = vf′x/r. An axial photon emitted toward the front has coordinate speed 1 − v(1 − f), which can vanish in the wall for v > 1.'],
  natario:['A translating bubble with divergence-free flow.','NEC violated','For this nontrivial zero-expansion flow.','u = ∇ × [vf(r)(eₓ × r⃗)/2],  ds² = −dt² + |d𝐫 − (u − veₓ)dt|²','The radial profile is used as a vector potential. The volume expansion vanishes everywhere, while shear requires negative Eulerian energy. The local flow can exceed the prescribed bubble speed.'],
  pocket:['A large proper interior behind a small coordinate radius.','WEC violated','Negative Eulerian density in the conformal wall.','ds² = −dt² + B(r)²{[dx + v(1 − f)dt]² + dy² + dz²}','Uses the Van Den Broeck metric ansatz with a softened teaching profile: B = 4 in the pocket and transitions to 1 across a quintic wall. The Hamiltonian constraint includes the intrinsic curvature of the B²-scaled spatial slices. This choice shows the geometry at moderate scales. The paper explores much larger scale ratios.'],
  shell:['Unit cavity clock rate. Radial tension and radial NEC violation extend to infinity. The research Einstein cluster has a vacuum exterior and a 10.52% cavity clock deficit.','NEC violated','Radial null contraction is negative outside the wall.','ds² = −dt² + dr²/(1 − 2m(r)/r) + r²dΩ²','The mass function smoothly rises from zero to M across the shell. The density is m′/(4πr²), radial pressure is −m/(4πr³), and tangential pressure is (m − rm′)/(8πr³). Local NEC shows ρ + min(pᵣ, pₜ). This idealized shell has constant lapse and serves as a comparison with published subluminal shell metrics.'],
  flat:['The special-relativistic control for the optical experiment.','Vacuum','Null energy condition saturated.','ds² = −dt² + dx² + dy² + dz²','The stress–energy and shift vanish. Photons follow straight lines.']
};
const modelSources={
  alcubierre:[
    ['Alcubierre (1994) · The warp drive','Original metric, bubble profile, and energy density.','https://arxiv.org/abs/gr-qc/0009013'],
    ['Lobo & Visser (2004) · Fundamental limitations','Energy-condition violations in the Alcubierre and Natário metrics.','https://arxiv.org/abs/gr-qc/0406083'],
    ['Finazzi, Liberati & Barceló (2009) · Semiclassical instability','Quantum stress–energy and horizons in a dynamical warp-drive model.','https://arxiv.org/abs/0904.0141']
  ],
  natario:[
    ['Natário (2002) · Warp drive with zero expansion','Construction of a divergence-free shift and its geometric interpretation.','https://arxiv.org/abs/gr-qc/0110086'],
    ['Santiago, Schuster & Visser (2022) · Null energy condition','Energy-condition constraints for the broader Natário class.','https://arxiv.org/abs/2105.03079'],
    ['Sharp negative-energy bound (2026 preprint)','A lower bound on integrated negative Eulerian energy for zero-expansion walls under prescribed matching conditions.','https://arxiv.org/abs/2609.36211']
  ],
  pocket:[
    ['Van Den Broeck (1999) · A warp drive with more reasonable total energy requirements','Original conformal pocket and its energy estimates.','https://arxiv.org/abs/gr-qc/9905084'],
    ['Van Den Broeck (1999) · On the (im)possibility of warp bubbles','Companion discussion of the pocket geometry and its physical limitations.','https://arxiv.org/abs/gr-qc/9906050'],
    ['Observer-robust energy checks (2026 preprint)','Numerical comparison of energy conditions across several metrics, including the Van Den Broeck pocket.','https://arxiv.org/abs/2602.18023']
  ],
  shell:[
    ['Morris & Thorne (1988) · Static spherical metric and stress–energy','Section III gives the spherical shape and redshift functions used to derive the shell equations. Here the redshift function is zero and the shape function is 2m(r).','https://epizodyspace.ru/bibl/inostr-yazyki/ajph/1988/morris_thorne.pdf'],
    ['Bobrick & Martire (2021) · Introducing physical warp drives','Classifies warp spacetimes and studies subluminal matter shells.','https://arxiv.org/abs/2102.06824'],
    ['Fuchs et al. (2024) · Constant velocity physical warp drive solution','Related moving-shell proposal that combines a matter shell and a shift field.','https://arxiv.org/abs/2405.02709']
  ],
  flat:[
    ['Einstein (1905) · On the electrodynamics of moving bodies','Foundations of special relativity, including the invariance of light speed.','https://physics.umd.edu/courses/Phys371/AnlageFall19/Einstein_1905_relativity.pdf'],
    ['David Tong · Geodesics in spacetime','University of Cambridge lecture notes on the Minkowski metric, null intervals, and geodesics.','https://www.damtp.cam.ac.uk/user/tong/gr/grhtml/S1.html']
  ]
};
const library=[
  ['1994','Alcubierre · Hyper-fast travel','The original prescribed translating bubble and its required stress–energy.','https://arxiv.org/abs/gr-qc/0009013'],
  ['1996','Ford & Roman · Quantum inequalities','Bounds negative-energy magnitude and sampling duration for a specified quantum field and observer.','https://arxiv.org/abs/gr-qc/9510071'],
  ['1996','Everett · Warp drive and causality','Examines closed causal loops in a construction using superluminal travel.','https://doi.org/10.1103/PhysRevD.53.7365'],
  ['1997','Pfenning & Ford · Warp-wall constraints','Applies a quantum inequality to the negative energy in an Alcubierre wall.','https://arxiv.org/abs/gr-qc/9702026'],
  ['1997','Everett & Roman · Krasnikov tubes','Examines causal access to the bubble wall and closed timelike curves in a two-tube geometry.','https://arxiv.org/abs/gr-qc/9702049'],
  ['2021','Fell & Heisenberg · Energy in shift geometries','Explores positive Eulerian energy in prescribed geometries. Other observers require separate stress tests.','https://arxiv.org/abs/2104.06488'],
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
const fieldNames={rho:'Eulerian density ρ · ℓ⁻²',expansion:'Volume expansion θ · ℓ⁻¹',shift:'Bubble flow (lab frame) · c',clock:'Stationary clock rate · dτ/dt',nec:'Minimum null contraction · ℓ⁻²'};
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

const shapeLabels={
  f:'f(r) · Shift profile',
  B:'B(r) · Spatial conformal scale',
  m:'m(r) · Enclosed mass'
};
const storageKey='warp-tunnel-equations-v1';
let custom=WarpEquations.create('alcubierre',WarpEquations.defaults.alcubierre);
try{
  const saved=JSON.parse(localStorage.getItem(storageKey));
  if(saved) custom=WarpEquations.create(saved.family,saved.formulas);
}catch(error){
  // Local storage may be disabled or contain an earlier invalid draft.
}

function currentValues(){
  return Object.fromEntries(inputs.map(id=>[id,Number(byId(id).value)]));
}
function settingsFor(model,values,profile=custom){
  const family=model==='custom'?profile.family:model;
  return {...values,model:family,speed:['flat','shell'].includes(family)?0:values.speed,
    ...(model==='custom'?{custom:profile}: {})};
}
function loadEditor(family,formulas){
  byId('equation-family').value=family;
  const fields=Object.entries(formulas).map(([key,value])=>{
    const row=document.createElement('div'), label=document.createElement('label'), input=document.createElement('textarea');
    input.id='expression-'+key;
    input.name=key;
    input.value=value;
    input.rows=2;
    input.maxLength=600;
    input.spellcheck=false;
    input.required=true;
    label.htmlFor=input.id;
    label.textContent=family==='natario' && key==='f'?'f(r) · Vector potential profile':shapeLabels[key];
    row.append(label,input);
    return row;
  });
  byId('equation-fields').replaceChildren(...fields);
  byId('equation-status').textContent='';
}
const panelCache=new Map();
const cancelled=()=>new DOMException('Calculation cancelled.','AbortError');
let transaction=null;
function beginTransaction(){
  if(transaction) transaction.abort();
  transaction=new AbortController();
  return transaction;
}
function cancelTransaction(){
  if(transaction) transaction.abort();
}
function panelJob(snapshot,field,rays,options){
  const input={...snapshot};
  if(snapshot.custom) input.custom={family:snapshot.custom.family,formulas:snapshot.custom.formulas};
  return {kind:'panel',snapshot:input,field,rays,options,extent,aspect};
}
function traceOptions(settings){
  return {direction:Math.min(...settings.map(Warp.rayDirection)),
    dt:Math.min(...settings.map(Warp.rayTimeStep)),maxSteps:2300};
}
function panelJobs(settings,field,rays){
  const options=traceOptions(settings);
  return settings.map(s=>panelJob(s,field,rays,options));
}
async function getPanelData(jobs,signal){
  const results=[];
  for(const job of jobs){
    if(signal && signal.aborted) throw cancelled();
    const key=JSON.stringify(job);
    let result=panelCache.get(key);
    if(!result){
      result=await WarpCompute.run(job,signal);
      if(signal && signal.aborted) throw cancelled();
      if(panelCache.size>=4) panelCache.delete(panelCache.keys().next().value);
      panelCache.set(key,result);
    }
    results.push({key,...result});
  }
  return results;
}

async function applyEquation(event){
  event.preventDefault();
  const status=byId('equation-status'), controller=beginTransaction();
  const comparing=byId('compare').checked;
  const replacePrimary=!comparing || byId('second-model').value!=='custom';
  const selected=[replacePrimary?'custom':byId('model').value];
  if(comparing) selected.push(byId('second-model').value);
  try{
    const family=byId('equation-family').value;
    const candidate=WarpEquations.create(family,Object.fromEntries(new FormData(event.currentTarget)));
    const values=currentValues(), settings=selected.map(id=>settingsFor(id,values,candidate));
    const field=layer==='nec' && settings.some(s=>!WarpNec.supported(s))?'rho':layer;
    status.classList.remove('error');
    status.textContent='Validating the equation and calculating the view…';
    await getPanelData(panelJobs(settings,field,byId('rays').checked),controller.signal);
    if(controller.signal.aborted) throw cancelled();
    custom=candidate;
    try{localStorage.setItem(storageKey,JSON.stringify(candidate));}catch(error){/* Storage is optional. */}
    if(replacePrimary) byId('model').value='custom';
    status.textContent='Applied to the tunnel. Adjust the sliders or compare with a preset.';
    queue();
  }catch(error){
    if(transaction!==controller) return;
    status.classList.add('error');
    status.textContent=error.message+' The last applied equation is still active.';
  }finally{
    if(transaction===controller) transaction=null;
  }
}

async function update(signal){
  const comparing=byId('compare').checked;
  const primary=byId('model').value;
  const selected=comparing?[primary,byId('second-model').value]:[primary];
  const active=panels.slice(0,selected.length);
  const values=currentValues();
  const settings=selected.map(model=>settingsFor(model,values));
  const supportsNEC=settings.every(WarpNec.supported);
  const field=layer==='nec' && !supportsNEC?'rho':layer;
  const traceEnabled=byId('rays').checked, jobs=panelJobs(settings,field,traceEnabled);
  const progress=byId('plot-progress');
  progress.hidden=!jobs.some(job=>WarpComputeCore.needsWorker(job) && !panelCache.has(JSON.stringify(job)));
  const results=await getPanelData(jobs,signal);
  if(signal.aborted) throw cancelled();
  layer=field;
  progress.hidden=true;
  byId('comparison-controls').hidden=!comparing;
  byId('plots').classList.toggle('comparing',comparing);
  panels[1].element.hidden=!comparing;
  for(const id of inputs){
    const needed=settings.some(s=>{
      if(s.model==='flat') return false;
      if(id==='speed') return s.model!=='shell';
      if(id==='compactness') return s.model==='shell' || Boolean(s.custom);
      return true;
    });
    byId(id+'-row').hidden=!needed;
    byId(id+'-out').textContent=values[id].toFixed(2)+({speed:' c',radius:' ℓ',width:' ℓ',compactness:''}[id]);
  }
  byId('model-note').textContent=primary==='custom'?'Custom profile · '+custom.family:models[primary][0];
  const {direction}=jobs[0].options;
  byId('launch-note').hidden=!comparing || !traceEnabled;
  byId('launch-note').textContent=direction===1?'Photons enter both views from the left.':'Photons enter both views from the right at the selected bubble speed.';
  for(const [index,panel] of active.entries()){
    const snapshot=settings[index], model=snapshot.model;
    const title=byId(index?'second-model':'model').selectedOptions[0].textContent;
    panel.snapshot=snapshot;
    panel.get('title').textContent=title;
    panel.get('title').hidden=!comparing;
    panel.canvas.setAttribute('aria-label',title+' · '+fieldNames[layer]+(in3D?' 3D rotational view':' cross-section'));
    const center=Warp.clockRate(0,0,snapshot);
    panel.get('clock').textContent=center===null?'Unavailable':center.toFixed(6)+' s/s';
    panel.get('clock-note').textContent=center===null?'Fixed-center motion is not timelike.':
      snapshot.custom?'Proper seconds per coordinate second.':center===1?'Matches distant lab time.':'Proper seconds per distant lab second.';
    const vacuum=snapshot.speed===0 && !['shell','pocket'].includes(model);
    panel.get('condition').textContent=vacuum?'Vacuum':models[model][1];
    panel.get('condition-note').textContent=vacuum?models.flat[2]:models[model][2];
    const {key,samples,trace}=results[index];
    if(panel.sampleKey!==key){
      panel.trace=trace;
      panel.traceKey=key;
      panel.sampleKey=key;
      panel.samples=samples;
      panel.get('volume').textContent=scientific(samples.ball.volume);
      panel.get('energy').textContent=scientific(samples.ball.positive)+' / '+scientific(samples.ball.negative);
      panel.get('terminations').textContent=['domain exit','step limit','small step'].map(reason=>{
        const count=trace.filter(ray=>ray.termination===reason).length;
        return count?count+' '+reason:'';
      }).filter(Boolean).join(' · ');
      panel.heat.width=samples.nx;
      panel.heat.height=samples.ny;
      panel.get('density').textContent=scientific(samples.minRho);
      panel.get('integration').textContent=traceEnabled?scientific(Math.max(...trace.map(ray=>ray.drift))):'Off';
    }
    panel.field=field;
    const clockRange=panel.get('clock-range');
    clockRange.hidden=layer!=='clock' || model==='flat';
    if(!clockRange.hidden){
      const {insideMin,insideMax,insideUnavailable}=panel.samples;
      const range=insideMin===Infinity?'No stationary clocks sampled':
        insideMin.toFixed(3)+'–'+insideMax.toFixed(3)+' s/s';
      clockRange.textContent='Inside reference radius: '+range+
        (insideUnavailable && insideMin!==Infinity?' · some positions unavailable':'')+'.';
    }
    if(snapshot.custom){
      const violation=snapshot.model==='shell'?panel.samples.minNec < -1e-10:panel.samples.minRho < -1e-10;
      panel.get('condition').textContent=violation?(snapshot.model==='shell'?'NEC violated':'WEC violated'):'Undetermined';
      panel.get('condition-note').textContent=violation?'Negative value on the sampled slice.':'Sampling alone cannot certify energy conditions.';
    }
  }
  updateEquations(selected);
  for(const button of document.querySelectorAll('[data-field]')){
    button.disabled=button.dataset.field==='nec' && !supportsNEC;
    button.setAttribute('aria-pressed',button.dataset.field===layer);
  }
  const negativeValues=active.some(p=>p.samples.min<0), positiveValues=active.some(p=>p.samples.max>0);
  const clock=layer==='clock';
  const limit=clock?1:Math.max(...active.map(p=>Math.max(-p.samples.min,p.samples.max)));
  byId('clock-note').hidden=!clock;
  byId('nec-note').hidden=field!=='nec' || !settings.some(WarpNec.moving);
  byId('clock-key').hidden=!clock || !active.some(p=>p.samples.unavailable);

  byId('legend-title').textContent=(comparing?'Shared scale · ':'')+fieldNames[layer];
  byId('legend-min').textContent=scientific(negativeValues?-limit:0);
  byId('legend-max').textContent=scientific(clock || positiveValues?limit:0);
  byId('gradient').style.background=clock?'linear-gradient(90deg,#080f1c,#3fe0cd)':negativeValues && positiveValues?'linear-gradient(90deg,#e76ff7,#080f1c,#3fe0cd)':negativeValues?'linear-gradient(90deg,#e76ff7,#080f1c)':positiveValues?'linear-gradient(90deg,#080f1c,#3fe0cd)':'#28364d';
  byId('plots').hidden=false;
  byId('field-legend').hidden=false;
  for(const panel of active){
    colorize(panel,limit);
    resize(panel);
    paint(panel);
  }
  document.dispatchEvent(new Event('tunnel-settings'));
}
function updateEquations(selected){
  const key=JSON.stringify([selected,custom.family,custom.formulas]);
  if(key===metric) return;
  metric=key;
  const sections=[...new Set(selected)].map(model=>{
    const family=model==='custom'?custom.family:model;
    const [,,,equation,interpretation]=models[family];
    const section=document.createElement('section'), formula=document.createElement('p'), explanation=document.createElement('p');
    if(selected.length>1){
      const heading=document.createElement('h3');
      heading.textContent=Array.from(byId('model').options).find(option=>option.value===model).textContent;
      section.append(heading);
    }
    formula.className='formula';
    formula.textContent=equation;
    explanation.textContent=model==='custom'?'The metric family uses the applied radial functions below.':interpretation;
    section.append(formula,explanation);
    if(model==='custom'){
      for(const [name,expression] of Object.entries(custom.formulas)){
        const line=document.createElement('p');
        line.className='formula';
        line.textContent=name+'(r) = '+expression;
        section.append(line);
      }
    }
    const sourceHeading=document.createElement(selected.length>1?'h4':'h3');
    sourceHeading.textContent='Sources and further reading';
    const sources=document.createElement('ul');
    sources.className='model-sources';
    for(const [title,note,url] of modelSources[family]){
      const item=document.createElement('li'), link=document.createElement('a');
      const description=document.createElement('p');
      link.href=url;
      link.textContent=title;
      description.textContent=note;
      item.append(link,description);
      sources.append(item);
    }
    section.append(sourceHeading,sources);
    return section;
  });
  byId('equations').replaceChildren(...sections);
}
function colorize(panel,limit){
  const {heat,hc,samples}=panel;
  if(panel.coloredSamples===samples && panel.limit===limit) return;
  panel.coloredSamples=samples;
  panel.limit=limit;
  const buffer=hc.createImageData(heat.width,heat.height);
  samples.values.forEach((v,i)=>{
    if(Number.isNaN(v)){
      const stripe=(i%heat.width+Math.floor(i/heat.width))%7<2;
      const color=stripe?[141,91,40]:[51,35,30];
      buffer.data.set([...color,255],i*4);
      return;
    }
    const color=v<0?negative:positive;
    const intensity=v===0?0:Math.abs(v)/limit;
    for(let c=0;c<3;c++) buffer.data[i*4+c]=background[c]+intensity*(color[c]-background[c]);
    buffer.data[i*4+3]=255;
  });
  hc.putImageData(buffer,0,0);
}
let in3D=false;
const camera={...WarpView3D.defaultCamera};
function paint(panel){
  if(!panel.snapshot || !panel.w) return;
  if(in3D) WarpView3D.draw(panel,camera,extent,panel.field,byId('grid').checked,phase);
  else paintSlice(panel);
}
function setView(spatial){
  in3D=spatial;
  byId('view-slice').setAttribute('aria-pressed',!spatial);
  byId('view-space').setAttribute('aria-pressed',spatial);
  byId('view-label').textContent=spatial?'AXISYMMETRIC GEOMETRY':'MERIDIONAL SLICE';
  byId('view-title').textContent=spatial?'Spacetime in 3D':'Spacetime cross-section';
  byId('reset-camera').hidden=!spatial;
  byId('orbit-note').hidden=!spatial;
  byId('plots').classList.toggle('orbit',spatial);
  for(const panel of panels){
    panel.get('slice').hidden=spatial;
    panel.canvas.tabIndex=spatial?0:-1;
    if(spatial) panel.canvas.setAttribute('aria-describedby','orbit-note');
    else panel.canvas.removeAttribute('aria-describedby');
  }
  queue();
}
function turn(yaw,pitch){
  camera.yaw=(camera.yaw+yaw)%(2*Math.PI);
  camera.pitch=Math.max(-1.5,Math.min(1.5,camera.pitch+pitch));
  if(!byId('plots').hidden) panels.filter(p=>!p.element.hidden).forEach(paint);
}
function bindOrbit(canvas){
  let pointer=null, previousX, previousY;
  canvas.addEventListener('pointerdown',event=>{
    if(!in3D || pointer!==null || event.button!==0) return;
    pointer=event.pointerId;
    previousX=event.clientX;
    previousY=event.clientY;
    canvas.setPointerCapture(pointer);
    canvas.classList.add('dragging');
  });
  canvas.addEventListener('pointermove',event=>{
    if(event.pointerId!==pointer || !in3D) return;
    const dx=event.clientX-previousX, dy=event.clientY-previousY;
    previousX=event.clientX;
    previousY=event.clientY;
    turn(dx*.009,dy*.009);
  });
  canvas.addEventListener('lostpointercapture',()=>{
    pointer=null;
    canvas.classList.remove('dragging');
  });
  canvas.addEventListener('keydown',event=>{
    if(!in3D) return;
    const moves={ArrowLeft:[-.09,0],ArrowRight:[.09,0],ArrowUp:[0,-.09],ArrowDown:[0,.09]};
    if(!Object.prototype.hasOwnProperty.call(moves,event.key)) return;
    event.preventDefault();
    turn(...moves[event.key]);
  });
}
function paintSlice({snapshot,w,h,ctx,heat,trace,field}){
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
  if(field==='nec'){
    const px=x(Number(byId('null-x').value)), py=y(Number(byId('null-y').value));
    ctx.strokeStyle='#ffce8a';
    ctx.beginPath();
    ctx.moveTo(px-5,py);ctx.lineTo(px+5,py);
    ctx.moveTo(px,py-5);ctx.lineTo(px,py+5);
    ctx.stroke();
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
let renderController=null;
function queue(){
  if(renderController) renderController.abort();
  if(scheduled) return;
  scheduled=true;
  requestAnimationFrame(async()=>{
    scheduled=false;
    const controller=new AbortController();
    renderController=controller;
    const error=byId('plot-error'), plots=byId('plots'), legend=byId('field-legend');
    try{
      await update(controller.signal);
      if(!controller.signal.aborted) error.hidden=true;
    }catch(cause){
      if(cause.name==='AbortError') return;
      error.textContent='The tunnel could not evaluate these settings. '+cause.message;
      error.hidden=false;
      plots.hidden=true;
      legend.hidden=true;
      byId('launch-note').hidden=true;
      byId('clock-note').hidden=true;
      byId('nec-note').hidden=true;
    }finally{
      if(renderController===controller){
        renderController=null;
        byId('plot-progress').hidden=true;
      }
    }
  });
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
  const running=byId('plots').hidden?[]:panels.filter(panel=>!panel.element.hidden && panel.trace.length);
  if(!paused && running.length && now-last>32){
    phase=(phase+Math.min(now-last,100)*.026)%75;
    running.forEach(paint);
    last=now;
  }
  requestAnimationFrame(animate);
}
for(const id of [...inputs,'model','compare','second-model','rays','grid']) byId(id).addEventListener('input',()=>{cancelTransaction();queue();});
for(const button of document.querySelectorAll('[data-field]')) button.addEventListener('click',()=>{cancelTransaction();layer=button.dataset.field;queue();});
byId('pause').addEventListener('click',()=>{paused=!paused;setPause();});
byId('cancel-calculation').addEventListener('click',()=>{
  if(!renderController) return;
  renderController.abort();
  const error=byId('plot-error');
  error.textContent='Calculation cancelled. Change a setting to try again.';
  error.hidden=false;
  byId('plots').hidden=true;
  byId('field-legend').hidden=true;
});
byId('reset').addEventListener('click',()=>{
  cancelTransaction();
  for(const id of inputs) byId(id).value=byId(id).defaultValue;
  byId('model').value='alcubierre';
  byId('second-model').value='natario';
  byId('compare').checked=false;
  for(const id of ['rays','grid']) byId(id).checked=true;
  paused=matchMedia('(prefers-reduced-motion: reduce)').matches;
  Object.assign(camera,WarpView3D.defaultCamera);
  setView(false);
  layer='rho';
  phase=0;
  setPause();
  queue();
});
document.querySelector('.model-source-jump').addEventListener('click',()=>{byId('model-notes').open=true;});
byId('equation-form').addEventListener('submit',applyEquation);
byId('equation-fields').addEventListener('input',cancelTransaction);
byId('equation-family').addEventListener('change',()=>{
  cancelTransaction();
  const family=byId('equation-family').value;
  loadEditor(family,WarpEquations.defaults[family]);
});
byId('load-preset').addEventListener('click',()=>{
  cancelTransaction();
  const family=byId('equation-family').value;
  loadEditor(family,WarpEquations.defaults[family]);
});
byId('edit-model').addEventListener('click',()=>{
  cancelTransaction();
  const selected=byId('model').value;
  if(selected==='custom') loadEditor(custom.family,custom.formulas);
  else if(selected!=='flat') loadEditor(selected,WarpEquations.defaults[selected]);
  else loadEditor('alcubierre',{f:'0'});
});
loadEditor(custom.family,custom.formulas);
byId('open-help').addEventListener('click',()=>byId('sim-help').showModal());
byId('view-space').addEventListener('click',()=>{cancelTransaction();setView(true);});
byId('view-slice').addEventListener('click',()=>{cancelTransaction();setView(false);});
byId('reset-camera').addEventListener('click',()=>{
  Object.assign(camera,WarpView3D.defaultCamera);
  turn(0,0);
});
for(const panel of panels) bindOrbit(panel.canvas);
const observer=new ResizeObserver(()=>{
  for(const panel of panels){
    if(panel.element.hidden || byId('plots').hidden) continue;
    resize(panel);
    paint(panel);
  }
});
for(const panel of panels) observer.observe(panel.canvas);
queue();
setPause();
requestAnimationFrame(animate);
