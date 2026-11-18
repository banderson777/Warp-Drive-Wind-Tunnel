'use strict';
// Shared by the worker and cooperative local-file fallback.
const WarpComputeCore = (() => {
  const timeout=15000;
  const needsWorker=job=>job.kind!=='panel' || job.snapshot.custom ||
    (job.field==='nec' && WarpNec.moving(job.snapshot));
  function valueAt(x,y,s,field,existing){
    if(field==='clock') return Warp.clockRate(x,y,s);
    if(field==='nec' && WarpNec.moving(s)) return WarpNec.probe(x,y,s).minimum;
    return (existing || Warp.field(x,y,s))[field];
  }
  function* sample(s,field,extent,aspect,nx){
    const ny=Math.round(nx/aspect), vertical=extent/aspect;
    const values=field===null?null:new Float64Array(nx*ny);
    let min=0,max=0,minRho=Infinity,minNec=0,unavailable=false;
    const center=field==='clock'?Warp.clockRate(0,0,s):null;
    let insideMin=center===null?Infinity:center, insideMax=center===null?0:center;
    let insideUnavailable=center===null;
    for(let j=0;j<ny;j++){
      for(let i=0;i<nx;i++){
        const x=(2*(i+.5)/nx-1)*extent, y=(1-2*(j+.5)/ny)*vertical;
        const result=Warp.field(x,y,s);
        if(!Number.isFinite(result.rho)) throw Error('The sampled density overflows the numeric range.');
        minRho=Math.min(minRho,result.rho);
        if(field===null) continue;
        const value=valueAt(x,y,s,field,result);
        if(field==='clock' && Math.hypot(x,y)<s.radius){
          if(value===null) insideUnavailable=true;
          else{
            insideMin=Math.min(insideMin,value);
            insideMax=Math.max(insideMax,value);
          }
        }
        if(value===null && field==='clock'){
          values[j*nx+i]=NaN;
          unavailable=true;
          continue;
        }
        if(!Number.isFinite(value)) throw Error('The sampled field overflows the numeric range.');
        values[j*nx+i]=value;
        min=Math.min(min,value);
        max=Math.max(max,value);
        if(result.nec!==null) minNec=Math.min(minNec,result.nec);
      }
      yield;
    }
    return {nx,ny,min,max,values,minRho,minNec,unavailable,insideMin,insideMax,insideUnavailable};
  }

  function* calculate(job){
    const {snapshot,kind,field,extent,aspect,options}=job;
    const s=snapshot.custom?{...snapshot,custom:WarpEquations.create(snapshot.custom.family,snapshot.custom.formulas)}:snapshot;
    if(s.custom) Warp.validate(s,extent);
    if(kind==='panel'){
      const samples=yield* sample(s,field,extent,aspect,200);
      if(field==='nec' && WarpNec.moving(s)) samples.surface=[];
      if(s.custom || samples.surface){
        // Verify the actual 3D mesh positions as well as the meridional grid.
        for(let i=0;i<=14;i++){
          const angle=Math.PI*i/14, x=s.radius*Math.cos(angle), y=s.radius*Math.sin(angle);
          const meshValue=valueAt(x,y,s,field);
          if(samples.surface) samples.surface.push(meshValue);
          if(meshValue!==null && !Number.isFinite(meshValue)) throw Error('The 3D mesh overflows the numeric range.');
        }
      }
      samples.ball=Warp.ballIntegrals(s);
      const trace=job.rays?yield* Warp.trace(s,extent,options):[];
      return {samples,trace};
    }
    if(kind!=='numerics') throw Error('Unknown computation.');
    const coarse=(yield* sample(s,null,extent,aspect,200)).minRho;
    const fine=(yield* sample(s,null,extent,aspect,400)).minRho;
    const first=yield* Warp.trace(s,extent,options);
    const second=yield* Warp.trace(s,extent,{...options,dt:options.dt/2,maxSteps:options.maxSteps*2});
    let deviation=0,matched=0;
    for(const [j,{path}] of first.entries()) for(let k=0;k<path.length && k*2<second[j].path.length;k++){
      const point=second[j].path[k*2];
      deviation=Math.max(deviation,Math.hypot(point[0]-path[k][0],point[1]-path[k][1]));
      matched++;
    }
    return {coarse,fine,deviation,matched,drift:Math.max(...second.map(ray=>ray.drift))};
  }

  function runSync(job){
    const steps=calculate(job);
    let result=steps.next();
    while(!result.done) result=steps.next();
    return result.value;
  }
  async function runCooperative(job,signal){
    const steps=calculate(job);
    const deadline=performance.now()+timeout;
    for(;;){
      if(signal && signal.aborted) throw new DOMException('Calculation cancelled.','AbortError');
      const start=performance.now();
      if(start>deadline) throw Error('The calculation exceeded the 15-second limit.');
      let result;
      do{
        result=steps.next();
        if(result.done) return result.value;
      }while(performance.now()-start<8);
      await new Promise(resolve=>setTimeout(resolve,0));
    }
  }
  return {runSync,runCooperative,timeout,needsWorker};
})();
