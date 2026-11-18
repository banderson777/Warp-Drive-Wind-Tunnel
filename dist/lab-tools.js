'use strict';
(() => {
  const version=1, observer='fixed-model-coordinate';
  const modelNames=id=>Array.from(byId('model').options).find(o=>o.value===id).textContent;
  const activeIds=()=>[byId('model').value,...(byId('compare').checked?[byId('second-model').value]:[])];
  const activeSettings=()=>activeIds().map(id=>settingsFor(id,currentValues()));
  function numericalSettings(settings){
    return {extent,aspect,fieldGrid:[200,Math.round(200/aspect)],
      photonIntegrator:'RK4',dt:Math.min(...settings.map(Warp.rayTimeStep)),
      direction:Math.min(...settings.map(Warp.rayDirection)),maxSteps:2300};
  }

  function snapshot(){
    return {format:'warp-drive-wind-tunnel',version,observer,
      models:[byId('model').value,byId('second-model').value],
      compare:byId('compare').checked,parameters:currentValues(),
      field:layer,view:in3D?'3d':'2d',camera:{...camera},
      rays:byId('rays').checked,grid:byId('grid').checked,
      custom:{family:custom.family,formulas:custom.formulas},
      numerical:numericalSettings(activeSettings())};
  }

  function restore(run){
    if(!run || run.format!=='warp-drive-wind-tunnel' || run.version!==version || run.observer!==observer)
      throw Error('Choose a version 1 Warp Drive Wind Tunnel experiment.');
    const allowed=[...Object.keys(models),'custom'];
    if(!Array.isArray(run.models) || run.models.length!==2 || !run.models.every(m=>allowed.includes(m)) ||
      !Object.prototype.hasOwnProperty.call(fieldNames,run.field) || !['2d','3d'].includes(run.view) ||
      !['compare','rays','grid'].every(k=>typeof run[k]==='boolean')) throw Error('The experiment settings are incomplete.');
    for(const id of inputs){
      const el=byId(id), value=run.parameters && run.parameters[id];
      const steps=(value-Number(el.min))/Number(el.step);
      if(!Number.isFinite(value) || value<Number(el.min) || value>Number(el.max) || Math.abs(steps-Math.round(steps))>1e-7)
        throw Error('Invalid slider value for '+id+'.');
    }
    if(!run.camera || !Number.isFinite(run.camera.yaw) || !Number.isFinite(run.camera.pitch) ||
      Math.abs(run.camera.pitch)>1.5) throw Error('Invalid camera angles.');
    if(!run.custom || !run.custom.formulas) throw Error('The custom equation data is missing.');
    const candidate=WarpEquations.create(run.custom.family,run.custom.formulas);
    const selected=run.compare?run.models:run.models.slice(0,1);
    const parameters=Object.fromEntries(inputs.map(id=>[id,run.parameters[id]]));
    const settings=selected.map(id=>{
      const model=id==='custom'?candidate.family:id;
      const s={...parameters,model,speed:['flat','shell'].includes(model)?0:parameters.speed};
      if(id==='custom'){
        s.custom=candidate;
        Warp.validate(s,extent);
      }
      return s;
    });
    if(run.field==='nec' && settings.some(s=>!['flat','shell'].includes(s.model))) throw Error('Local NEC is unavailable for these models.');
    const expected=numericalSettings(settings);
    const actual=run.numerical;
    if(!actual || !Object.keys(expected).every(key=>JSON.stringify(expected[key])===JSON.stringify(actual[key])))
      throw Error('The recorded numerical settings do not match this experiment version.');
    custom=candidate;
    loadEditor(custom.family,custom.formulas);
    try{localStorage.setItem(storageKey,JSON.stringify(custom));}catch(error){/* optional storage */}
    for(const id of inputs) byId(id).value=run.parameters[id];
    byId('model').value=run.models[0];
    byId('second-model').value=run.models[1];
    for(const key of ['compare','rays','grid']) byId(key).checked=run[key];
    layer=run.field;
    camera.yaw=run.camera.yaw%(2*Math.PI);
    camera.pitch=run.camera.pitch;
    phase=0;
    setView(run.view==='3d');
    queue();
  }

  function download(name,content,type){
    const url=URL.createObjectURL(new Blob([content],{type}));
    const link=document.createElement('a');
    link.href=url;
    link.download=name;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),30000);
  }
  function status(message,error=false){
    const node=byId('experiment-status');
    node.classList.toggle('error',error);
    node.textContent=message;
  }
  byId('export-run').addEventListener('click',()=>{
    download('warp-experiment.json',JSON.stringify(snapshot(),null,2)+'\n','application/json');
    status('Saved the current experiment settings.');
  });
  byId('open-run').addEventListener('click',()=>byId('run-file').click());
  byId('run-file').addEventListener('change',async event=>{
    const input=event.currentTarget, file=input.files[0];
    if(!file) return;
    try{
      if(file.size>32000) throw Error('Experiment files must be smaller than 32 KB.');
      restore(JSON.parse(await file.text()));
      status('Opened '+file.name+'.');
    }catch(error){status(error.message,true);}
    input.value='';
  });

  function exported(callback){
    try{update();callback();}
    catch(error){status(error.message,true);}
  }
  byId('export-field').addEventListener('click',()=>exported(()=>{
    const rows=['panel,model,x_l,y_l,z_l,field,value'];
    const ids=activeIds();
    for(const [i,panel] of panels.slice(0,ids.length).entries()){
      const nx=panel.heat.width, ny=panel.heat.height;
      for(const [j,value] of panel.samples.values.entries()){
        const x=(2*(j%nx+.5)/nx-1)*extent, y=(1-2*(Math.floor(j/nx)+.5)/ny)*vertical;
        rows.push([i+1,ids[i],x,y,0,layer,Number.isFinite(value)?value:''].join(','));
      }
    }
    download('warp-field.csv',rows.join('\n')+'\n','text/csv');
    status('Exported meridional field samples. Blank values mark unavailable measurements.');
  }));
  byId('export-rays').addEventListener('click',()=>exported(()=>{
    if(!byId('rays').checked) throw Error('Turn on Trace photon paths before exporting photon data.');
    const rows=['panel,model,ray,step,t_l,x_l,y_l,z_l'];
    const ids=activeIds(), {dt}=numericalSettings(activeSettings());
    for(const [i,panel] of panels.slice(0,ids.length).entries())
      for(const [ray,{path}] of panel.trace.entries())
        for(const [step,[x,y]] of path.entries()) rows.push([i+1,ids[i],ray,step,step*dt,x,y,0].join(','));
    download('warp-photons.csv',rows.join('\n')+'\n','text/csv');
    status('Exported the underlying meridional photon paths.');
  }));

  const lessons={
    flat:['The vacuum control has no wall. Predict the path of a photon launched off axis.',
      'All rays are straight and parallel. The energy density and Hamiltonian drift are zero to numerical precision.'],
    expansion:['Predict whether zero volume expansion removes the need for negative energy.',
      'Natário has zero expansion everywhere. Switch to Energy density and compare the negative wall values with Alcubierre.'],
    clocks:['Predict whether a clock at the center of a translating bubble ticks at the same rate as a clock at infinity.',
      'The built-in Alcubierre center accumulates 1 second per lab second. The static Einstein-cluster cavity accumulates about 0.8948 seconds per distant second. Scroll to Shell experiments to see the preselected Clock deficit field.']
  };
  function describeLesson(){
    const [question,result]=lessons[byId('guided-lab').value];
    byId('guided-prediction').textContent=question;
    byId('guided-result').textContent=result;
  }
  byId('guided-lab').addEventListener('change',describeLesson);
  byId('load-lab').addEventListener('click',()=>{
    const lesson=byId('guided-lab').value;
    byId('reset').click();
    byId('model').value=lesson==='flat'?'flat':'alcubierre';
    byId('compare').checked=lesson==='expansion';
    if(lesson==='expansion') layer='expansion';
    if(lesson==='clocks'){
      layer='clock';
      byId('shell-model').value='cluster';
      byId('shell-model').dispatchEvent(new Event('change'));
      byId('shell-field').value='clock';
      byId('shell-field').dispatchEvent(new Event('change'));
    }
    queue();
    byId('tunnel').scrollIntoView();
    byId('view-slice').focus({preventScroll:true});
  });
  describeLesson();

  function resultRow(container,label,value){
    const p=document.createElement('p'), heading=document.createElement('strong');
    heading.textContent=label+' ';
    p.append(heading,value);
    container.append(p);
  }
  function minimumDensity(s,nx){
    const ny=Math.round(nx/aspect);
    let minimum=0;
    for(let j=0;j<ny;j++) for(let i=0;i<nx;i++){
      const rho=Warp.field((2*(i+.5)/nx-1)*extent,(1-2*(j+.5)/ny)*vertical,s).rho;
      if(!Number.isFinite(rho)) throw Error('Density sampling encountered a nonfinite value.');
      minimum=Math.min(minimum,rho);
    }
    return minimum;
  }
  byId('run-numerics').addEventListener('click',()=>{
    const node=byId('numerics-results'), button=byId('run-numerics');
    const ids=activeIds(), settings=activeSettings(), {dt,direction,maxSteps}=numericalSettings(settings);
    button.disabled=true;
    node.textContent='Computing both resolutions…';
    setTimeout(()=>{
      node.replaceChildren();
      try{
        for(const [i,s] of settings.entries()){
          const coarse=minimumDensity(s,200), fine=minimumDensity(s,400);
          const first=Warp.rays(s,extent,{direction,dt,maxSteps});
          const second=Warp.rays(s,extent,{direction,dt:dt/2,maxSteps:maxSteps*2});
          let deviation=0, matched=0;
          for(const [j,{path}] of first.entries()) for(let k=0;k<path.length && k*2<second[j].path.length;k++){
            const point=second[j].path[k*2];
            deviation=Math.max(deviation,Math.hypot(point[0]-path[k][0],point[1]-path[k][1]));
            matched++;
          }
          resultRow(node,modelNames(ids[i]),'Density minimum '+scientific(coarse)+' → '+scientific(fine)+
            ' ℓ⁻² (200 → 400 columns). Largest matched-time photon difference '+scientific(deviation)+
            ' ℓ over '+matched+' samples. Halved-step Hamiltonian drift '+scientific(Math.max(...second.map(r=>r.drift)))+'.');
        }
      }catch(error){node.textContent=error.message;}
      finally{button.disabled=false;}
    },30);
  });

  function updateNull(){
    const node=byId('null-results'), r=Number(byId('null-radius').value);
    byId('null-radius-out').textContent=r.toFixed(2)+' ℓ';
    node.replaceChildren();
    const settings=activeSettings(), ids=activeIds();
    for(const [i,s] of settings.entries()){
      try{
        if(!['flat','shell'].includes(s.model)){
          resultRow(node,modelNames(ids[i]),'Directional tensor sampling unavailable for this model.');
          continue;
        }
        const angles=Array.from({length:19},(_,j)=>Warp.nullEnergy(r,Math.cos(j*Math.PI/36),s));
        const negatives=angles.flatMap((value,j)=>value<0?[j*5]:[]);
        const range=negatives.length?' Violating sampled angles: '+negatives[0]+'°–'+negatives[negatives.length-1]+'° from radial.':'';
        resultRow(node,modelNames(ids[i]),negatives.length+'/19 sampled angles violate NEC.'+range+' Radial '+
          scientific(angles[0])+', tangential '+scientific(angles[18])+', sampled min '+
          scientific(Math.min(...angles))+' ℓ⁻².');
      }catch(error){resultRow(node,modelNames(ids[i]),error.message);}
    }
  }
  byId('null-radius').addEventListener('input',updateNull);
  document.addEventListener('tunnel-settings',updateNull);
  updateNull();

  const C_LIGHT=299792458, G_SI=6.67430e-11;
  function physicalScale(){
    const radius=Number(byId('physical-radius').value), kind=byId('scale-model').value;
    const node=byId('scale-results');
    if(!Number.isFinite(radius) || radius<1e-6 || radius>1e12){
      node.textContent='Enter a midpoint radius between 10⁻⁶ m and 10¹² m.';
      return;
    }
    const cluster=kind==='cluster';
    const source=WarpKineticRotation;
    const compactMass=cluster?WarpResearchData.mass:.259564632/((source.bounds[0]+source.bounds[1])/2);
    const mass=compactMass*radius*C_LIGHT**2/G_SI;
    const deficit=cluster?WarpResearchData.deficit:1-source.profile[0][1];
    let report='ADM mass '+mass.toExponential(4)+' kg. Cavity lag '+(100*deficit).toFixed(3)+' s per 100 s at infinity.';
    if(kind==='kinetic'){
      const delay=source.peakDelay*radius/10, guide=source.delayRadius*radius/10;
      // Convert the asymptotic time difference to the stationary guide clock.
      const j=Math.min(source.profile.length-1,Math.floor(source.delayRadius/10*
        ((source.bounds[0]+source.bounds[1])/2)/WarpResearchData.outer*source.profile.length));
      const local=delay*source.profile[j][1];
      const omega=local*C_LIGHT**2/(4*Math.PI*guide**2);
      report+=' Guided-light delay '+delay.toExponential(4)+' s at infinity. A flat circular guide at the same radius would produce a comparable local Sagnac delay at '+omega.toExponential(3)+' rad/s.';
    }
    node.textContent=report;
  }
  byId('physical-radius').addEventListener('input',physicalScale);
  byId('scale-model').addEventListener('change',physicalScale);
  physicalScale();

  let optics;
  function drawOptics(){
    if(!optics) return;
    const canvas=byId('optics-plot'), {width:w,height:h}=canvas.getBoundingClientRect();
    if(!w || !h) return;
    const dpr=Math.min(2,devicePixelRatio);
    canvas.width=Math.round(w*dpr); canvas.height=Math.round(h*dpr);
    const ctx=canvas.getContext('2d');
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.fillStyle='#080f1c';ctx.fillRect(0,0,w,h);
    const unit=(w-44)/10;
    const x=t=>26+unit*(t+5), y=t=>h*.36-t*unit;
    function line(points,transformY,color,dash=[]){
      ctx.strokeStyle=color;ctx.setLineDash(dash);ctx.beginPath();
      points.forEach(([a,b],i)=>i?ctx.lineTo(x(a),transformY(b)):ctx.moveTo(x(a),transformY(b)));
      ctx.stroke();ctx.setLineDash([]);
    }
    ctx.save();
    ctx.beginPath();ctx.rect(26,20,w-44,h*.72-20);ctx.clip();
    for(const ray of optics.rays){
      if(byId('optics-uniform').checked) line(ray.control.path,y,'#a2aec6',[4,4]);
      line(ray.graded.path,y,'#75e6d7');
    }
    ctx.restore();
    const baseline=h-14;
    const nScale=Math.max(.001,optics.center-1);
    const nY=n=>baseline-(n-1)/nScale*h*.18;
    const profile=Array.from({length:161},(_,i)=>{const a=i/16-5;return [a,optics.index(Math.abs(a))[0]];});
    line([[-5,1],[5,1]],nY,'#344664');
    line(profile,nY,'#e5a6ec');
    ctx.fillStyle='#c0cbe2';ctx.font='11px monospace';
    ctx.fillText('Ray paths · isotropic x / ℓ',12,15);
    ctx.fillText('n(x)',8,h*.77);
  }
  byId('optics-run').addEventListener('click',()=>{
    const settings=currentValues();
    const medium=WarpOptics.medium(settings,Warp.shell);
    const rays=[.3,.65,1.0].map(f=>{
      const offset=f*settings.radius;
      return {graded:WarpOptics.ray(medium.index,offset),control:WarpOptics.ray(()=>[1,0],offset)};
    });
    optics={...medium,rays};
    byId('optics-plot').hidden=false;
    byId('optics-result').textContent='Center index '+medium.center.toFixed(4)+
      '. Deflection at 0.65 R launch offset: '+rays[1].graded.deflection.toFixed(2)+
      '° in the graded medium, 0° in the uniform control. Teal shows graded rays, dashed gray the control, and purple the index profile.';
    drawOptics();
  });
  byId('optics-uniform').addEventListener('change',drawOptics);
  new ResizeObserver(drawOptics).observe(byId('optics-plot'));
})();
