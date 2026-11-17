'use strict';
// Spherical particle-in-cell pilot in polar-areal gauge.
// The particles carry canonical P_r, angular momentum squared L, and rest weight.
const fs = require('node:fs');
const assert = require('node:assert/strict');

function particles(equilibrium, scale, radialNodes, momentumNodes) {
  const radius=[], momentum=[], angular=[], weight=[];
  const { a,b,l0,profile }=equilibrium;
  let j=0;
  const dr=(b-a)/radialNodes;
  for(let i=0;i<radialNodes;i++){
    const r=a+(i+.5)*dr;
    while(profile[j+1][0]<r) j++;
    const left=profile[j], right=profile[j+1], f=(r-left[0])/(right[0]-left[0]);
    const m=left[1]+f*(right[1]-left[1]), y=left[2]+f*(right[2]-left[2]);
    const A=1-2*m/r, floor=l0/(r*r), vmax2=Math.expm1(2*y)-floor, cap=Math.exp(y);
    if(vmax2<=0) continue;
    const ds=Math.sqrt(vmax2)/momentumNodes;
    for(let k=1;k<momentumNodes;k++){
      const s=k*ds, p2=floor+s*s;
      const distribution=(vmax2-s*s)/(cap*(cap+Math.sqrt(1+p2)));
      // Analytic azimuthal integration and midpoint sampling of the signed polar cosine.
      const mass=16*Math.PI**2*r*r*s*s*dr*ds*distribution*(k%2?4:2)/(3*momentumNodes*Math.sqrt(A));
      for(let l=0;l<momentumNodes;l++){
        const w=s*(2*(l+.5)/momentumNodes-1);
        radius.push(r*scale);
        momentum.push(w/(Math.sqrt(A)*scale));
        angular.push(r*r*(p2-w*w));
        weight.push(mass);
      }
    }
  }
  return [radius,momentum,angular,weight].map(x=>Float64Array.from(x));
}

function evolve(equilibrium,{scale,cells,radialNodes,momentumNodes,dt,duration}) {
  const outer=7, dx=outer/cells;
  const [r,p,L,weight]=particles(equilibrium,scale,radialNodes,momentumNodes);
  const rest=weight.reduce((sum,v)=>sum+v,0);
  const arrays=Array.from({length:9},()=>new Float64Array(cells));
  const [A,alpha,mass,dm,pr,alphaPrime,APrime,rho,pt]=arrays;
  const midR=new Float64Array(r.length), midP=new Float64Array(r.length);
  A.fill(1);
  const index=new Int32Array(r.length), fraction=new Float64Array(r.length);
  let adm,maxConstraintCorrection=0;
  function metric(radii,momenta){
    for(let k=0;k<r.length;k++){
      const x=radii[k]/dx-.5, i=Math.floor(x);
      if(i<0 || i>=cells-1) throw Error('Particle reached the numerical boundary.');
      index[k]=i;
      fraction[k]=x-i;
    }
    for(let sweep=0;sweep<5;sweep++){
      dm.fill(0); pr.fill(0); pt.fill(0);
      for(let k=0;k<r.length;k++){
        const i=index[k], f=fraction[k];
        const g=A[i]+f*(A[i+1]-A[i]), w2=g*momenta[k]**2;
        const transverse=L[k]/radii[k]**2;
        const E=Math.sqrt(1+w2+transverse), jac=weight[k]*Math.sqrt(g);
        const energy=jac*E, pressure=jac*w2/E, tangent=jac*transverse/(2*E);
        dm[i]+=(1-f)*energy; dm[i+1]+=f*energy;
        pr[i]+=(1-f)*pressure; pr[i+1]+=f*pressure;
        pt[i]+=(1-f)*tangent; pt[i+1]+=f*tangent;
      }
      adm=0;
      let correction=0;
      for(let i=0;i<cells;i++){
        const R=(i+.5)*dx;
        mass[i]=adm+dm[i]/2;
        adm+=dm[i];
        const updated=1-2*mass[i]/R;
        if(updated<=0) throw Error('Polar-areal evolution approached a trapped radius.');
        correction=Math.max(correction,Math.abs(A[i]-updated));
        A[i]=updated;
        APrime[i]=2*(mass[i]/R-dm[i]/dx)/R;
        alphaPrime[i]=(mass[i]+R*pr[i]/dx)/(R*R*updated); // derivative of log lapse
        rho[i]=dm[i]/(4*Math.PI*R*R*dx);
      }
      if(sweep===4) maxConstraintCorrection=Math.max(correction,maxConstraintCorrection);
    }
    let logAlpha=.5*Math.log1p(-2*adm/outer);
    for(let i=cells-1;i>=0;i--){
      const half=alphaPrime[i]*dx/2;
      alpha[i]=Math.exp(logAlpha-half);
      logAlpha-=2*half;
      alphaPrime[i]*=alpha[i];
    }
  }

  function advance(fromR,fromP,toR,toP,step){
    for(let k=0;k<r.length;k++){
      const R=fromR[k], P=fromP[k], i=index[k], f=fraction[k];
      const g=A[i]+f*(A[i+1]-A[i]), N=alpha[i]+f*(alpha[i+1]-alpha[i]);
      const gPrime=APrime[i]+f*(APrime[i+1]-APrime[i]);
      const NPrime=alphaPrime[i]+f*(alphaPrime[i+1]-alphaPrime[i]);
      const E=Math.sqrt(1+g*P*P+L[k]/(R*R));
      // The base arrays can alias the output in the final midpoint update.
      toR[k]=r[k]+step*N*g*P/E;
      toP[k]=p[k]+step*(-NPrime*E-N*(gPrime*P*P-2*L[k]/R**3)/(2*E));
    }
  }

  const trimmed=v=>Number(v.toPrecision(7));
  const frames=[];
  const n=Math.round(duration/dt), stride=Math.round(1/dt), plotBins=100;
  let peakCompactness=0, maxDrift=0, initialMass;
  for(let k=0;k<=n;k++){
    metric(r,p);
    if(k===0) initialMass=adm;
    maxDrift=Math.max(maxDrift,Math.abs(adm-initialMass)/initialMass);
    if(k%stride===0){
      let mean=0, inner=Infinity, outermost=0, comp=0;
      for(let j=0;j<r.length;j++){
        mean+=r[j]*weight[j];
        inner=Math.min(inner,r[j]); outermost=Math.max(outermost,r[j]);
      }
      for(const g of A) comp=Math.max(comp,1-g);
      peakCompactness=Math.max(peakCompactness,comp);
      const profile=Array.from({length:plotBins},(_,j)=>{
        const i=Math.min(cells-1,Math.floor(j*cells/plotBins));
        const radius=(i+.5)*dx, volume=4*Math.PI*radius*radius*dx;
        return [rho[i],alpha[i],pr[i]/volume,pt[i]/volume,0].map(trimmed);
      });
      frames.push({t:trimmed(k*dt),mean:trimmed(mean/rest),inner:trimmed(inner),
        outer:trimmed(outermost),mass:trimmed(adm),deficit:trimmed(1-alpha[0]),profile});
    }
    if(k===n) break;
    advance(r,p,midR,midP,dt/2);
    metric(midR,midP);
    advance(midR,midP,r,p,dt);
  }
  return {scale,cells,dt,outer,bins:plotBins,particles:r.length,rest,initialMass,
    maxDrift,maxConstraintCorrection,peakCompactness,frames};
}

function main() {
  const [, , input, output]=process.argv;
  if(!input || !output) throw Error('Usage: node evolve_vlasov.cjs EQUILIBRIUM.json OUTPUT.json');
  const equilibrium=JSON.parse(fs.readFileSync(input,'utf8'));
  const experiments=[];
  for(const [label,config] of Object.entries({
    coarse:{cells:180,radialNodes:112,momentumNodes:10,dt:.1},
    fine:{cells:360,radialNodes:192,momentumNodes:14,dt:.05}
  })){
    for(const scale of [.98,1,1.02]){
      const result=evolve(equilibrium,{...config,scale,duration:90});
      experiments.push({...result,label});
      const means=result.frames.map(frame=>frame.mean);
      console.log(label,scale,result.particles,'max drift',result.maxDrift.toExponential(4),
        'constraint iteration',result.maxConstraintCorrection.toExponential(4),
        'mean radius range',Math.min(...means),Math.max(...means),
        'outermost',Math.max(...result.frames.map(f=>f.outer)));
      assert(result.maxDrift<.002 && result.maxConstraintCorrection<1e-5);
      assert(Math.abs(result.rest/equilibrium.restMass-1)<.006);
      assert(Math.abs(result.initialMass/equilibrium.mass-1)<.006);
    }
  }
  fs.writeFileSync(output,JSON.stringify(experiments));
}

if(require.main===module) main();
module.exports={evolve};
