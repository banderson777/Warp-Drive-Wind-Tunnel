'use strict';
(() => {
  const data=globalThis.WarpResearchData;
  const kinetic=globalThis.WarpKineticRotation;
  const response=globalThis.WarpSecondOrder;
  const secondOrder={'second-rest':response.fixedRestMass,'second-center':response.fixedCentralY};
  const radialExtent=mode=>mode==='vlasov' || mode==='kinetic' || secondOrder[mode]?4.4:1.6;
  const find=id=>document.getElementById('shell-'+id);
  const model=find('model'), run=find('run'), field=find('field'), frame=find('frame');
  const beamColors=['#75e6d7','#c0cbe2','#f1a2ed'];
  const fields={
    rho:['Energy density ρ','ℓ⁻²',0],
    clock:['Lapse deficit 1 − N','fraction',1],
    pr:['Radial pressure pᵣ','ℓ⁻²',2],
    pt:['Tangential pressure pₜ','ℓ⁻²',3],
    spin:['Azimuthal shift β^φ','ℓ⁻¹',4],
    current:['Azimuthal momentum density j','ℓ⁻²',5],
    deltaClock:['Lapse-deficit change Δ(1 − N)','fraction',0],
    deltaMass:['Enclosed mass change Δm','ℓ',1]
  };
  const options={vlasov:['rho','clock','pr','pt'],cluster:['rho','clock','pt'],rotation:['spin','current','rho','clock'],kinetic:['spin','current','clock'],
    'second-rest':['deltaClock','deltaMass'],'second-center':['deltaClock','deltaMass']};
  const descriptions={
    vlasov:'A self-gravitating collisionless shell evolved from constrained initial data. Scrub time to examine the changing matter and clock-rate profiles.',
    cluster:'Circular particle orbits support a static shell around a flat cavity. The shell has tangential pressure and a vacuum Schwarzschild exterior.',
    rotation:'A small azimuthal shift is prescribed inside the dense part of the static wall. The momentum-density field changes sign across the wall, with zero total angular momentum.',
    kinetic:'A collisionless shell with oppositely biased orbit populations. The first-order matter currents cancel the exterior angular momentum while inertial frames still rotate inside.',
    'second-rest':'Spherical-average mass and lapse corrections at second order, with total particle rest mass held fixed.',
    'second-center':'Spherical-average mass and lapse corrections at second order, with the central cutoff parameter held fixed. Total particle rest mass can change.'
  };
  const limits={
    vlasov:'This short spherical pilot cannot test nonspherical modes or establish long-term stability. A flat cavity clock deficit describes gravitational time dilation.',
    cluster:'The circular-orbit source is an idealization with zero radial pressure. The comparison between cavity and distant clocks is normalized at infinity.',
    rotation:'The shift is a stationary metric hypothesis. The displayed momentum is the constraint value in the equatorial plane. A self-consistent rotating particle distribution has yet to be constructed.',
    kinetic:'The kinetic current sources the shift at first order. The separate second-order views show the spherical-average response. Stability and exterior multipoles remain open.',
    'second-rest':'The projection includes only the spherical average. The quadrupole forcing is nonzero and its exterior field is still unknown.',
    'second-center':'The projection includes only the spherical average. Compare this response with the fixed-particle-rest-mass case on the same field scale.'
  };
  const map=find('map'), profile=find('profile'), history=find('history');
  const image=document.createElement('canvas');
  image.width=224;
  image.height=136;
  const raster=image.getContext('2d');
  const fmt=x=>x===0?'0':Math.abs(x)<.01?x.toExponential(2):x.toFixed(3);
  function value(row,key){
    return key==='clock'?1-row[1]:row[fields[key][2]];
  }
  const staticProfiles={cluster:data.static,rotation:data.rotation,kinetic:kinetic.profile,
    'second-rest':secondOrder['second-rest'].profile,'second-center':secondOrder['second-center'].profile};
  const fieldExtent={};
  for(const [mode,keys] of Object.entries(options)){
    fieldExtent[mode]={};
    for(const key of keys){
      let hi=0,lo=0;
      const profiles=mode==='vlasov'?data.runs.flatMap(r=>r.frames.map(f=>f.profile)):
        secondOrder[mode]?Object.values(secondOrder).map(result=>result.profile):[staticProfiles[mode]];
      const maxRadius=radialExtent(mode);
      for(const rows of profiles){
        const visible=Math.ceil(maxRadius/data.outer*rows.length);
        for(let i=0;i<visible;i++){
          const val=value(rows[i],key);
          lo=Math.min(lo,val);
          hi=Math.max(hi,val);
        }
      }
      const amplitude=Math.max(-lo,hi);
      fieldExtent[mode][key]=lo<0?[-amplitude,amplitude]:[0,amplitude];
    }
  }
  function canvasContext(canvas){
    const w=canvas.clientWidth,h=canvas.clientHeight;
    const dpr=Math.min(devicePixelRatio,2);
    if(canvas.width!==Math.round(w*dpr) || canvas.height!==Math.round(h*dpr)){
      canvas.width=Math.round(w*dpr);
      canvas.height=Math.round(h*dpr);
    }
    const ctx=canvas.getContext('2d');
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,w,h);
    return {ctx,w,h};
  }
  function radial(rows,r,key){
    const x=Math.max(0,Math.min(rows.length-1,r/data.outer*rows.length-.5));
    const i=Math.floor(x), j=Math.min(i+1,rows.length-1);
    return value(rows[i],key)*(1-x+i)+value(rows[j],key)*(x-i);
  }
  function drawMap(rows,key,radius,amplitude,bounds){
    const {ctx,w,h}=canvasContext(map);
    const img=raster.createImageData(image.width,image.height);
    for(let y=0;y<image.height;y++) for(let x=0;x<image.width;x++){
      const r=radius*Math.hypot((2*(x+.5)/image.width-1)*w/h,(1-2*(y+.5)/image.height));
      const k=4*(y*image.width+x);
      if(r>data.outer*(1-.5/rows.length)){
        img.data.set([43,46,52,255],k);
        continue;
      }
      const val=radial(rows,r,key);
      const intensity=amplitude?Math.min(1,Math.abs(val)/amplitude):0;
      const color=val<0?[230,112,246]:[63,224,205];
      for(let c=0;c<3;c++) img.data[k+c]=[8,15,28][c]+intensity*(color[c]-[8,15,28][c]);
      img.data[k+3]=255;
    }
    raster.putImageData(img,0,0);
    ctx.drawImage(image,0,0,w,h);
    ctx.strokeStyle='rgba(215,230,251,.65)';
    ctx.setLineDash([3,5]);
    for(const r of bounds){
      ctx.beginPath();
      ctx.arc(w/2,h/2,r*h/(2*radius),0,2*Math.PI);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.fillStyle='#c0cbe2';
    ctx.font='11px monospace';
    ctx.fillText(secondOrder[model.value]?'Spherical average':'z = 0',10,17);
    ctx.fillText('x / ℓ',w-41,h-11);
  }
  function graph(canvas,xRange,yRange,xUnit,yUnit){
    const {ctx,w,h}=canvasContext(canvas);
    const x=v=>68+(w-83)*(v-xRange[0])/(xRange[1]-xRange[0]);
    const y=v=>h-25-(h-40)*(v-yRange[0])/(yRange[1]-yRange[0]);
    ctx.font='10px monospace';
    for(let i=0;i<=4;i++){
      const a=xRange[0]+(xRange[1]-xRange[0])*i/4;
      const b=yRange[0]+(yRange[1]-yRange[0])*i/4;
      ctx.strokeStyle='#26354d';
      ctx.beginPath();
      ctx.moveTo(x(a),y(yRange[0])); ctx.lineTo(x(a),y(yRange[1]));
      ctx.moveTo(x(xRange[0]),y(b)); ctx.lineTo(x(xRange[1]),y(b)); ctx.stroke();
      ctx.fillStyle='#bdc9de';
      ctx.textAlign='right'; ctx.fillText(fmt(b),x(xRange[0])-7,y(b)+3);
      ctx.textAlign='center'; ctx.fillText(fmt(a),x(a),h-11);
    }
    ctx.textAlign='left';
    ctx.fillText(yUnit,3,11);
    ctx.fillText(xUnit,3,h-11);
    return {ctx,x,y};
  }
  function line(ctx,x,y,points,color,dashes=[]){
    ctx.strokeStyle=color;
    ctx.lineWidth=1.4;
    ctx.setLineDash(dashes);
    ctx.beginPath();
    points.forEach(([a,b],i)=>i?ctx.lineTo(x(a),y(b)):ctx.moveTo(x(a),y(b)));
    ctx.stroke();
    ctx.setLineDash([]);
  }
  function drawHistory(activeTime){
    const radii=data.comparison.flatMap(series=>series.series.map(point=>point[1]));
    const min=Math.min(...radii),max=Math.max(...radii);
    const tEnd=data.runs[0].frames.at(-1).t;
    const {ctx,x,y}=graph(history,[0,tEnd],[min-.006,max+.006],'t / ℓ','r / ℓ');
    for(const entry of data.comparison){
      const index=[.98,1,1.02].indexOf(entry.scale);
      line(ctx,x,y,entry.series,beamColors[index],entry.label==='coarse'?[4,4]:[]);
    }
    ctx.strokeStyle='#f2f5ff';
    ctx.beginPath();
    ctx.moveTo(x(activeTime),y(min-.006));
    ctx.lineTo(x(activeTime),y(max+.006));
    ctx.stroke();
  }
  let playback=null;
  function stop(){
    if(playback!==null) clearInterval(playback);
    playback=null;
    find('play').textContent='Play';
  }
  function draw(){
    const mode=model.value, key=field.value, dynamic=mode==='vlasov';
    const selected=data.runs.find(x=>x.scale===Number(run.value));
    const snapshot=selected.frames[Number(frame.value)];
    const rows=dynamic?snapshot.profile:staticProfiles[mode];
    const [lo,hi]=fieldExtent[mode][key], radius=radialExtent(mode);
    const bounds=dynamic?[snapshot.inner,snapshot.outer]:secondOrder[mode]?response.bounds:
      mode==='kinetic'?kinetic.bounds:[.8,1.2];
    drawMap(rows,key,radius,Math.max(Math.abs(lo),hi),bounds);
    const {ctx,x,y}=graph(profile,[0,radius],hi===lo?[0,1]:[lo,hi],'r / ℓ',fields[key][1]);
    const points=Array.from({length:161},(_,i)=>{
      const r=i*radius/160;
      return [r,radial(rows,r,key)];
    });
    line(ctx,x,y,points,'#75e6d7');
    find('low').textContent=fmt(lo);
    find('high').textContent=fmt(hi);
    find('units').textContent=fields[key][1];
    find('gradient').style.background=lo<0?'linear-gradient(90deg,#e670f6,#080f1c,#3fe0cd)':'linear-gradient(90deg,#080f1c,#3fe0cd)';
    if(dynamic){
      find('readout').textContent='Mean radius '+snapshot.mean.toFixed(5)+' ℓ · Cavity clock deficit '+
        (snapshot.deficit*100).toFixed(3)+'% · Max. ADM drift '+selected.maxDrift.toExponential(2);
      find('time-out').textContent=snapshot.t.toFixed(0)+' ℓ';
      drawHistory(snapshot.t);
    }else if(secondOrder[mode]){
      const result=secondOrder[mode];
      find('readout').textContent='Center clock deficit change '+fmt(result.cavityDeficitChange)+
        ' · ADM mass change '+fmt(result.admChange)+' ℓ · Bias amplitude η = '+response.eta;
    }else if(mode==='kinetic'){
      find('readout').textContent='Cavity shift '+kinetic.cavityBeta.toExponential(3)+' ℓ⁻¹ · Peak guided-light delay '+
        (kinetic.peakDelay*1e12).toFixed(2)+' ps at a 10 m midpoint radius';
    }else{
      find('readout').textContent='Cavity clock deficit '+(data.deficit*100).toFixed(3)+'% · ADM mass '+
        data.mass.toFixed(3)+' ℓ'+(mode==='rotation'?' · Shift amplitude ε = '+data.epsilon:'');
    }
    map.setAttribute('aria-label',fields[key][0]+(secondOrder[mode]?' spherical-average slice for ':' equatorial slice for ')+model.selectedOptions[0].textContent);
    profile.setAttribute('aria-label',fields[key][0]+' radial profile for '+model.selectedOptions[0].textContent);
  }
  function changeModel(){
    stop();
    const mode=model.value,dynamic=mode==='vlasov';
    field.replaceChildren(...options[mode].map(key=>new Option(fields[key][0],key)));
    find('run-label').hidden=!dynamic;
    find('evolution').hidden=!dynamic;
    map.setAttribute('aria-label',secondOrder[mode]?'Spherical average of selected field':'Equatorial slice of selected field');
    find('map-title').textContent=secondOrder[mode]?'Spherical-average field':'Equatorial slice';
    find('description').textContent=descriptions[mode];
    find('limits').textContent=limits[mode];
    draw();
  }
  frame.max=data.runs[0].frames.length-1;
  model.addEventListener('change',changeModel);
  run.addEventListener('change',()=>{stop();draw();});
  field.addEventListener('change',draw);
  frame.addEventListener('input',()=>{stop();draw();});
  find('play').addEventListener('click',()=>{
    if(playback!==null){stop();return;}
    if(frame.value===frame.max) frame.value='0';
    find('play').textContent='Pause';
    playback=setInterval(()=>{
      if(frame.value===frame.max){stop();return;}
      frame.value=Number(frame.value)+1;
      draw();
    },170);
  });
  const observer=new ResizeObserver(draw);
  for(const canvas of [map,profile,history]) observer.observe(canvas);
  changeModel();
})();
