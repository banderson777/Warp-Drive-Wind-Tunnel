'use strict';
const WarpOptics = (() => {
  // Static, unit-lapse optical metric in isotropic radial coordinate q.
  function medium(settings,shellMass){
    const maxRadius=8, count=1200, dr=maxRadius/count;
    const M=settings.compactness*settings.radius/2;
    const outerQ=(maxRadius-M+Math.sqrt(maxRadius*(maxRadius-2*M)))/2;
    const grid=[];
    let logRatio=Math.log(outerQ/maxRadius);
    const A=r=>r?1-2*shellMass(r,settings)[0]/r:1;
    const slope=r=>r?(1/Math.sqrt(A(r))-1)/r:0;
    for(let i=count;i>=0;i--){
      const r=i*dr, n=Math.exp(-logRatio), q=r/n;
      grid.unshift({q,n,gradient:q?n*(Math.sqrt(A(r))-1)/q:0});
      if(i) logRatio-=dr*(slope(r)+4*slope(r-dr/2)+slope(r-dr))/6;
    }
    function index(q){
      if(q>=outerQ){
        const term=1+M/(2*q);
        return [term**2,-M*term/(q*q)];
      }
      let lo=0, hi=grid.length-1;
      while(hi-lo>1){
        const mid=(lo+hi)>>1;
        if(grid[mid].q<=q) lo=mid;
        else hi=mid;
      }
      const a=grid[lo], b=grid[hi], f=(q-a.q)/(b.q-a.q);
      return [a.n+f*(b.n-a.n),a.gradient+f*(b.gradient-a.gradient)];
    }
    return {index,center:grid[0].n};
  }

  function ray(index,impact,halfWidth=5){
    let state=[-halfWidth,impact,1,0];
    const path=[];
    const dt=.025;
    function slope([x,y,px,py]){
      const r=Math.hypot(x,y), p=Math.hypot(px,py);
      const [n,grad]=index(r);
      const factor=r?p*grad/(n*n*r):0;
      return [px/(n*p),py/(n*p),factor*x,factor*y];
    }
    for(let i=0;i<2400;i++){
      path.push(state.slice(0,2));
      if(state[0]>halfWidth || Math.abs(state[1])>halfWidth || state[0]<-halfWidth-.05) break;
      const a=slope(state), b=slope(state.map((v,j)=>v+dt*a[j]/2));
      state=state.map((v,j)=>v+dt*b[j]);
    }
    return {path,deflection:Math.atan2(state[3],state[2])*180/Math.PI};
  }
  return {medium,ray};
})();
if(typeof module==='object') module.exports=WarpOptics;
