'use strict';
const WarpNec = (() => {
  const physics=typeof module==='object'?require('./physics.js'):Warp;
  const directionList=[];
  const directionCount=192;
  const angle=Math.PI*(3-Math.sqrt(5));
  for(let i=0;i<directionCount;i++){
    const z=1-2*(i+.5)/directionCount, radial=Math.sqrt(1-z*z);
    directionList.push([radial*Math.cos(i*angle),radial*Math.sin(i*angle),z]);
  }
  directionList.push([1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]);
  const weights=directionList.map(([x,y,z])=>[2*x,2*y,2*z,x*x,2*x*y,2*x*z,y*y,2*y*z,z*z]);

  function moving(s){
    return !s.custom && (s.model==='alcubierre' || s.model==='natario');
  }
  function supported(s){
    return moving(s) || s.model==='shell' || s.model==='flat';
  }

  function tensor(x,y,z,s,relativeStep=.001){
    if(!moving(s)) throw Error('Moving-bubble stress sampling is unavailable for this metric.');
    // Stationary comoving coordinates with unit lapse and Euclidean spatial slices.
    // Coordinates are (t,x,y,z), with normal n=(1,U) and g_{0i}=-U_i.
    const position=[x,y,z], h=relativeStep*s.width, h2=h*h;
    const f=physics.flow(x,y,z,s);
    const u=[0,f[0]-s.speed,f[1],f[2]];
    const du=new Float64Array(16), ddu=new Float64Array(64);
    function at(a,offsetA,b=0,offsetB=0){
      const point=position.slice();
      point[a]+=offsetA;
      point[b]+=offsetB;
      return physics.flow(...point,s);
    }
    for(let a=1;a<4;a++){
      const hi=at(a-1,h), lo=at(a-1,-h);
      for(let i=1;i<4;i++){
        du[4*a+i]=(hi[i-1]-lo[i-1])/(2*h);
        ddu[16*a+4*a+i]=(hi[i-1]+lo[i-1]-2*f[i-1])/h2;
      }
      for(let b=1;b<a;b++){
        const pp=at(a-1,h,b-1,h), pm=at(a-1,h,b-1,-h);
        const mp=at(a-1,-h,b-1,h), mm=at(a-1,-h,b-1,-h);
        for(let i=1;i<4;i++)
          ddu[16*a+4*b+i]=ddu[16*b+4*a+i]=(pp[i-1]-pm[i-1]-mp[i-1]+mm[i-1])/(4*h2);
      }
    }

    const inverse=new Float64Array(16);
    inverse[0]=-1;
    let g00=-1;
    for(let i=1;i<4;i++){
      g00+=u[i]*u[i];
      inverse[i]=inverse[4*i]=-u[i];
      for(let j=1;j<4;j++) inverse[4*i+j]=Number(i===j)-u[i]*u[j];
    }
    const dg=new Float64Array(64), dinverse=new Float64Array(64), ddg=new Float64Array(256);
    for(let a=1;a<4;a++){
      for(let i=1;i<4;i++){
        const d=du[4*a+i];
        dg[16*a]+=2*u[i]*d;
        dg[16*a+i]=dg[16*a+4*i]=dinverse[16*a+i]=dinverse[16*a+4*i]=-d;
        for(let j=1;j<4;j++) dinverse[16*a+4*i+j]=-d*u[j]-u[i]*du[4*a+j];
        for(let b=1;b<4;b++){
          const second=ddu[16*a+4*b+i], k=64*a+16*b;
          ddg[k]+=2*(d*du[4*b+i]+u[i]*second);
          ddg[k+i]=ddg[k+4*i]=-second;
        }
      }
    }

    const gamma=new Float64Array(64), divergence=new Float64Array(16);
    for(let i=0;i<4;i++) for(let j=i;j<4;j++) for(let k=0;k<4;k++){
      let value=0, derivative=0;
      for(let l=0;l<4;l++){
        const combination=dg[16*i+4*l+j]+dg[16*j+4*l+i]-dg[16*l+4*i+j];
        value+=inverse[4*k+l]*combination;
        if(k) derivative+=dinverse[20*k+l]*combination+inverse[4*k+l]*(
          ddg[64*k+16*i+4*l+j]+ddg[64*k+16*j+4*l+i]-ddg[64*k+16*l+4*i+j]);
      }
      gamma[16*k+4*i+j]=gamma[16*k+4*j+i]=value/2;
      divergence[4*i+j]+=derivative/2;
    }
    // det(g)=-1, so Gamma^k_{ik}=0 and its derivatives vanish.
    const ricci=new Float64Array(16);
    let scalar=0;
    for(let i=0;i<4;i++) for(let j=i;j<4;j++){
      let value=divergence[4*i+j];
      for(let k=0;k<4;k++) for(let l=0;l<4;l++)
        value-=gamma[16*k+4*j+l]*gamma[16*l+4*i+k];
      ricci[4*i+j]=ricci[4*j+i]=value;
      scalar+=inverse[4*i+j]*value*(i===j?1:2);
    }

    const coordinate=ricci.map((value,index)=>{
      const i=index>>2, j=index%4;
      const g=i===0?(j===0?g00:-u[j]):j===0?-u[i]:Number(i===j);
      return (value-g*scalar/2)/(8*Math.PI);
    });
    const orthonormal=coordinate.slice();
    const normal=[1,u[1],u[2],u[3]];
    orthonormal[0]=0;
    for(let j=0;j<4;j++){
      let contraction=0;
      for(let i=0;i<4;i++) contraction+=normal[i]*coordinate[4*i+j];
      orthonormal[0]+=normal[j]*contraction;
      if(j) orthonormal[j]=orthonormal[4*j]=contraction;
    }
    return orthonormal;
  }

  function directions(t){
    const components=[t[1],t[2],t[3],t[5],t[6],t[7],t[10],t[11],t[15]];
    let minimum=Infinity, best=0, negative=0;
    for(let i=0;i<weights.length;i++){
      const w=weights[i];
      let value=t[0];
      for(let k=0;k<w.length;k++) value+=components[k]*w[k];
      if(value<minimum){minimum=value;best=i;}
      if(value < -1e-12) negative++;
    }
    return {minimum,direction:directionList[best],negative,total:weights.length};
  }

  function probe(x,y,s,refine=false){
    const t=tensor(x,y,0,s), sampled=directions(t);
    if(!refine) return sampled;
    let n=sampled.direction, minimum=sampled.minimum;
    const scale=Math.max(...Array.from(t.slice(1),Math.abs));
    // Local descent on the unit sphere, initialized from the best sampled ray.
    for(let iteration=0;scale>0 && iteration<80;iteration++){
      const gradient=n.map((_,i)=>(t[i+1]+n.reduce((sum,v,j)=>sum+t[4*(i+1)+j+1]*v,0))/scale);
      const radial=gradient.reduce((sum,v,i)=>sum+v*n[i],0);
      const trial=n.map((v,i)=>v-(gradient[i]-radial*v)/8);
      const norm=Math.hypot(...trial);
      const next=trial.map(v=>v/norm);
      const k=[1,...next];
      const value=k.reduce((sum,a,i)=>sum+a*k.reduce((row,b,j)=>row+t[4*i+j]*b,0),0);
      if(value>=minimum) break;
      minimum=value;
      n=next;
    }
    return {...sampled,refinedMinimum:minimum,refinedDirection:n};
  }
  return {moving,supported,tensor,directions,probe};
})();
if(typeof module==='object') module.exports=WarpNec;
