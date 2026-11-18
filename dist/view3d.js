'use strict';
const WarpView3D = (() => {
  const defaultCamera={yaw:.46,pitch:.32};
  const tau=2*Math.PI;
  function project(w,h,extent,{yaw,pitch}){
    const cy=Math.cos(yaw), sy=Math.sin(yaw), cp=Math.cos(pitch), sp=Math.sin(pitch);
    const scale=Math.min(w/2.25,h/1.42)/extent;
    return ([x,y,z])=>{
      const u=cy*x+sy*z, q=cy*z-sy*x;
      const v=cp*y-sp*q, depth=sp*y+cp*q;
      const perspective=20/(20-depth);
      return [w/2+u*scale*perspective,h/2-v*scale*perspective,depth];
    };
  }

  function rayBundle(trace){
    if(!trace.length) return [];
    const middle=Math.floor(trace.length/2);
    const lines=[{path:trace[middle].path,angle:0}];
    for(const offset of [1,2,4,6,7]){
      const ray=trace[middle+offset];
      if(!ray) continue;
      for(let i=0;i<8;i++) lines.push({path:ray.path,angle:tau*i/8});
    }
    return lines;
  }

  function prepare(panel,camera,extent,field,grid){
    const {snapshot,w,h,trace,limit}=panel;
    const toScreen=project(w,h,extent,camera);
    const behind=[],front=[];
    function edge(a,b,value){
      (a[2]+b[2]<0?behind:front).push({a,b,value});
    }
    if(snapshot.model!=='flat'){
      const r=snapshot.radius;
      const rings=14, azimuths=40;
      const mesh=Array.from({length:rings+1},(_,i)=>{
        const angle=Math.PI*i/rings, x=r*Math.cos(angle), y=r*Math.sin(angle);
        const value=panel.samples.surface?panel.samples.surface[i]:
          field==='clock'?Warp.clockRate(x,y,snapshot):Warp.field(x,y,snapshot)[field];
        return {
          value,
          points:Array.from({length:azimuths},(_,j)=>{
            const t=tau*j/azimuths;
            return toScreen([x,y*Math.cos(t),y*Math.sin(t)]);
          })
        };
      });
      for(let i=0;i<=rings;i++){
        const ring=mesh[i];
        for(let j=0;j<azimuths;j++){
          if(i>0 && i<rings) edge(ring.points[j],ring.points[(j+1)%azimuths],ring.value);
          if(i>0 && j%4===0){
            const prev=mesh[i-1];
            edge(prev.points[j],ring.points[j],prev.value===null || ring.value===null?null:(prev.value+ring.value)/2);
          }
        }
      }
    }
    const paths=rayBundle(trace).map(({path,angle})=>{
      const cos=Math.cos(angle), sin=Math.sin(angle);
      const point=index=>{
        const [x,y]=path[index];
        return toScreen([x,y*cos,y*sin]);
      };
      const projected=[];
      for(let i=0;i<path.length;i+=3) projected.push(point(i));
      if(path.length>0 && (path.length-1)%3!==0) projected.push(point(path.length-1));
      return {projected,point,length:path.length};
    });
    const axes=grid?[
      [[-extent,0,0],[extent,0,0],'x'],
      [[0,-extent/2,0],[0,extent/2,0],'y'],
      [[0,0,-extent/2],[0,0,extent/2],'z']
    ].map(([from,to,label])=>[toScreen(from),toScreen(to),label]):[];
    return {behind,front,paths,axes,limit};
  }

  function mesh(ctx,edges,limit,foreground){
    for(const {a,b,value} of edges){
      const intensity=limit?Math.min(1,(Math.abs(value)/limit)**.65):0;
      const color=value===null?'219,151,72':intensity<.015?'150,168,202':value<0?'231,111,247':'63,224,205';
      const alpha=value===null?(foreground?.75:.3):foreground?.25+.55*intensity:.10+.20*intensity;
      ctx.strokeStyle='rgba('+color+','+alpha+')';
      ctx.beginPath();
      ctx.moveTo(a[0],a[1]);
      ctx.lineTo(b[0],b[1]);
      ctx.stroke();
    }
  }

  function staticScene(panel,scene){
    const {ctx,w,h}=panel;
    ctx.fillStyle='#080f1c';
    ctx.fillRect(0,0,w,h);
    ctx.lineWidth=1;
    ctx.font='11px monospace';
    ctx.setLineDash([3,5]);
    for(const [a,b,label] of scene.axes){
      ctx.strokeStyle='#41526b';
      ctx.fillStyle='#a4b1c8';
      ctx.beginPath();
      ctx.moveTo(a[0],a[1]);
      ctx.lineTo(b[0],b[1]);
      ctx.stroke();
      ctx.fillText(label,b[0]+4,b[1]-4);
    }
    ctx.setLineDash([]);
    mesh(ctx,scene.behind,scene.limit,false);
    ctx.lineWidth=.9;
    ctx.strokeStyle='rgba(129,228,250,.47)';
    for(const {projected:path} of scene.paths){
      if(path.length<2) continue;
      ctx.beginPath();
      ctx.moveTo(path[0][0],path[0][1]);
      for(let i=1;i<path.length;i++) ctx.lineTo(path[i][0],path[i][1]);
      ctx.stroke();
    }
    mesh(ctx,scene.front,scene.limit,true);
  }

  function draw(panel,camera,extent,field,grid,phase){
    const {canvas,w,h,ctx}=panel;
    const key=[camera.yaw,camera.pitch,w,h,canvas.width,canvas.height,panel.sampleKey,panel.traceKey,field,grid,panel.limit].join('|');
    if(!panel.scene3d || panel.scene3d.key!==key){
      const scene=prepare(panel,camera,extent,field,grid);
      const backdrop=panel.scene3d ? panel.scene3d.backdrop : document.createElement('canvas');
      backdrop.width=canvas.width;
      backdrop.height=canvas.height;
      const background=backdrop.getContext('2d');
      background.setTransform(canvas.width/w,0,0,canvas.height/h,0,0);
      staticScene({ctx:background,w,h},scene);
      panel.scene3d={key,scene,backdrop};
    }
    const {scene,backdrop}=panel.scene3d;
    ctx.drawImage(backdrop,0,0,w,h);
    ctx.fillStyle='#b7f7ff';
    ctx.beginPath();
    for(const {length,point} of scene.paths){
      for(let i=Math.floor(phase)%75;i<length;i+=75){
        const [x,y,depth]=point(i), r=depth>0?1.35:1;
        ctx.moveTo(x+r,y);
        ctx.arc(x,y,r,0,tau);
      }
    }
    ctx.fill();
  }

  return {defaultCamera,draw,project,rayBundle};
})();
if(typeof module==='object') module.exports=WarpView3D;
