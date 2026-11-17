'use strict';
const Warp = (() => {
  // Geometrized units, x along the bubble's direction of travel.
  const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
  const sech2 = x => 1 - Math.tanh(x)**2;
  function profile(r, {radius:R, width:w}) {
    const a = (r+R)/w, b = (r-R)/w, norm = 2*Math.tanh(R/w);
    return [(Math.tanh(a)-Math.tanh(b))/norm, (sech2(a)-sech2(b))/(w*norm)];
  }
  function shell(r, {radius:R, width:w, compactness:C}) {
    const q = clamp((r-R+w/2)/w, 0, 1), M = C*R/2;
    return [M*q**3*(10-15*q+6*q*q), M*30*q*q*(1-q)**2/w];
  }
  function pocket(r,s) {
    const width=.23*s.radius, q=clamp((r-.35*s.radius)/width,0,1);
    const B=4-3*q**3*(10-15*q+6*q*q);
    return [B,-90*q*q*(1-q)**2/width,-180*q*(1-q)*(1-2*q)/width**2];
  }
  function flow(x,y,z,s) {
    if(s.model==='flat' || s.model==='shell') return [0,0,0];
    const r=Math.hypot(x,y,z), [f,df]=profile(r,s);
    // Natário flow is curl(v f(r) (e_x × r)/2).
    const g=s.model==='natario' && r ? df/(2*r) : 0;
    return [s.speed*(f+g*(y*y+z*z)), -s.speed*g*x*y, -s.speed*g*x*z];
  }
  function field(x,y,s) {
    const r=Math.hypot(x,y);
    if(s.model==='shell') {
      const [m,dm]=shell(r,s);
      const rho=r ? dm/(4*Math.PI*r*r) : 0;
      const pressure=r ? -m/(4*Math.PI*r**3) : 0;
      return {rho, expansion:0, shift:0, nec:rho+Math.min(pressure,-(rho+pressure)/2)};
    }
    const shift=Math.hypot(...flow(x,y,0,s));
    if(s.model==='flat') return {rho:0,expansion:0,shift,nec:0};
    if(s.model==='alcubierre' || s.model==='pocket') {
      const [,df]=profile(r,s);
      const d=s.speed*df/(r||1);
      const [B,dB,ddB]=s.model==='pocket'?pocket(r,s):[1,0,0];
      const isotropic=s.speed*(profile(r,s)[0]-1)*dB*x/((r||1)*B);
      const curvature=-4*(ddB+2*dB/(r||1))/B**3+2*dB*dB/B**4;
      return {rho:(curvature+6*isotropic**2+4*isotropic*d*x-d*d*y*y/2)/(16*Math.PI),
        expansion:d*x+3*isotropic,shift:B*shift,nec:null};
    }
    const p=[x,y,0], h=0.0001*s.width;
    const gradients=p.map((_,axis)=>{
      const a=p.slice(), b=p.slice();
      a[axis]+=h;
      b[axis]-=h;
      const fa=flow(...a,s), fb=flow(...b,s);
      return fa.map((value,i)=>(value-fb[i])/(2*h));
    });
    let norm=0;
    for(let i=0;i<3;i++) for(let j=0;j<3;j++) norm+=((gradients[i][j]+gradients[j][i])/2)**2;
    return {rho:-norm/(16*Math.PI),expansion:0,shift,nec:null};
  }
  function hamiltonian([x,y,px,py],s) {
    if(s.model==='shell') {
      const r=Math.hypot(x,y), [m]=shell(r,s);
      const pr=r ? (x*px+y*py)/r : 0;
      return Math.sqrt(px*px+py*py-(r ? 2*m/r : 0)*pr*pr);
    }
    const [ux,uy]=flow(x,y,0,s);
    const B=s.model==='pocket'?pocket(Math.hypot(x,y),s)[0]:1;
    return Math.hypot(px,py)/B+(ux-(s.model==='flat' ? 0 : s.speed))*px+uy*py;
  }
  function derivative(p,s) {
    const gradient=p.map((value,i)=>{
      const e=1e-5*Math.max(1,Math.abs(value)), a=p.slice(), b=p.slice();
      a[i]+=e;
      b[i]-=e;
      return (hamiltonian(a,s)-hamiltonian(b,s))/(2*e);
    });
    return [gradient[2],gradient[3],-gradient[0],-gradient[1]];
  }
  function step(p,h,s) {
    const add=(k,f)=>p.map((v,i)=>v+f*h*k[i]);
    const a=derivative(p,s), b=derivative(add(a,.5),s), c=derivative(add(b,.5),s), d=derivative(add(c,1),s);
    return p.map((v,i)=>v+h*(a[i]+2*b[i]+2*c[i]+d[i])/6);
  }
  function rayDirection(s) {
    // At v ≥ c forward photons cannot approach from the left in this frame.
    return s.model!=='flat' && s.model!=='shell' && s.speed>=1 ? -1 : 1;
  }
  function rayTimeStep(s) {
    return Math.min(s.width/10,s.model==='pocket'?.009:.045)/(1+s.speed);
  }
  function rays(s,extent,{direction=rayDirection(s),dt=rayTimeStep(s)}={}) {
    return Array.from({length:15},(_,i)=>{
      let p=[-direction*extent*.995,(i-7)*s.radius*.24,direction,0];
      const path=[];
      const H=hamiltonian(p,s);
      let drift=0;
      for(let n=0;n<2300;n++) {
        if(Math.abs(p[0])>extent*1.04 || Math.abs(p[1])>extent || !p.every(Number.isFinite)) break;
        path.push(p.slice(0,2));
        const next=step(p,dt,s);
        drift=Math.max(drift,Math.abs(hamiltonian(next,s)-H)/Math.max(1,Math.abs(H)));
        if(Math.hypot(next[0]-p[0],next[1]-p[1])<1e-7) break;
        p=next;
      }
      return {path,drift};
    });
  }
  return {profile,shell,flow,field,hamiltonian,step,rayDirection,rayTimeStep,rays};
})();
if(typeof module==='object') module.exports=Warp;
