'use strict';
(() => {
  const el=id=>byId('sweep-'+id);
  const axes={width:['Wall thickness','ℓ'],speed:['Bubble speed','c'],radius:['Coordinate radius','ℓ']};
  const fields={density:['Minimum Eulerian density','ℓ⁻²'],positive:['Positive energy inside R','ℓ'],negative:['Negative energy inside R','ℓ']};
  const modelIds=['alcubierre','natario'], names=['Alcubierre','Natário'];
  const colors=['#65e0ca','#edabff'];
  const method='axisymmetric-presets-v1';
  const engine='5b721ade87fcae4092563e6b5df205ad123af7d8efc5b87854f5b535da768521';
  const levels=['coarse','fine'];
  let completed=null,controller=null;
  function valid(value,id){
    const input=byId(id), lo=Number(input.min),hi=Number(input.max),step=Number(input.step);
    return Number.isFinite(value) && value>=lo && value<=hi &&
      Math.abs((value-lo)/step-Math.round((value-lo)/step))<1e-7;
  }
  function positions(axis){
    const input=byId(axis),lo=Number(input.min),step=Number(input.step);
    const count=Math.round((Number(input.max)-lo)/step);
    return Array.from({length:7},(_,i)=>Number((lo+step*Math.round(i*count/6)).toFixed(3)));
  }
  const fmt=v=>v===0?'0':v.toExponential(3);
  function inspect(value){
    const {axis,parameters}=completed;
    cancelTransaction();
    for(const id of inputs) byId(id).value=id===axis?value:parameters[id];
    byId('model').value=modelIds[0];byId('second-model').value=modelIds[1];
    byId('compare').checked=true;byId('rays').checked=false;layer='rho';
    setView(false);queue();byId('tunnel').scrollIntoView();
  }
  function render(){
    if(!completed) return;
    const {rows,axis,parameters}=completed,field=el('field').value;
    const [axisTitle,axisUnit]=axes[axis],[title,unit]=fields[field];
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 740 310');
    svg.setAttribute('role','img');svg.setAttribute('aria-label',title+' versus '+axisTitle);
    function shape(type,attrs,caption){
      const node=document.createElementNS(svg.namespaceURI,type);
      for(const [key,value] of Object.entries(attrs)) node.setAttribute(key,value);
      if(caption!==undefined) node.textContent=caption;
      svg.append(node);return node;
    }
    const words=(x,y,v,color='#dde6f7')=>shape('text',{x,y,fill:color,'font-size':13},v);
    shape('rect',{width:740,height:310,fill:'#0d1624'});
    words(12,20,title+' ('+unit+')');
    words(12,42,Object.keys(axes).filter(k=>k!==axis).map(k=>axes[k][0]+' '+parameters[k]+' '+axes[k][1]).join(' · '));
    words(465,20,'Alcubierre',colors[0]);words(560,20,'Natário',colors[1]);
    words(465,42,'Solid: fine   Dashed: coarse');
    const values=rows.flatMap(row=>levels.map(level=>row[level][field]));
    const min=Math.min(0,...values),max=Math.max(0,...values);
    const points=positions(axis), x=v=>92+(v-points[0])/(points[6]-points[0])*612;
    const y=v=>max===min?151:244-(v-min)/(max-min)*186;
    for(let j=0;j<=(max===min?0:4);j++){
      const v=min+(max-min)*j/4;
      shape('line',{x1:91,x2:706,y1:y(v),y2:y(v),stroke:'#35465c'});
      words(8,y(v)+4,fmt(v));
    }
    for(const v of points) words(x(v)-13,266,String(v));
    words(300,293,axisTitle+' ('+axisUnit+')');
    for(const [i,model] of modelIds.entries()){
      const series=rows.filter(r=>r.model===model);
      for(const level of levels){
        shape('polyline',{points:series.map(r=>x(r.value)+','+y(r[level][field])).join(' '),fill:'none',stroke:colors[i],
          'stroke-width':level==='fine'?2:3,'stroke-dasharray':level==='fine'?'none':'5 4'});
      }
      for(const r of series){
        shape('circle',{cx:x(r.value),cy:y(r.fine[field]),r:5,fill:colors[i]}).addEventListener('click',()=>inspect(r.value));
      }
    }
    el('figure').replaceChildren(svg);
    const table=document.createElement('table');
    const head=table.createTHead().insertRow();
    for(const label of [axisTitle,'Model','Coarse ('+unit+')','Fine ('+unit+')','Grid change']){
      const th=document.createElement('th');th.textContent=label;head.append(th);
    }
    for(const r of rows){
      const tr=table.insertRow(),button=document.createElement('button');
      button.textContent=String(r.value);button.addEventListener('click',()=>inspect(r.value));tr.insertCell().append(button);
      const a=r.coarse[field],b=r.fine[field],change=b===0?(a===0?0:Infinity):Math.abs((a-b)/b);
      for(const v of [names[modelIds.indexOf(r.model)],fmt(a),fmt(b),Number.isFinite(change)?
        (100*change).toFixed(2)+'%'+(change>.05?' · refine':''):'fine value zero · refine']) tr.insertCell().textContent=v;
    }
    el('table').replaceChildren(table);el('results').hidden=false;
  }
  function verify(bundle){
    if(bundle.format!=='warp-sweep' || bundle.version!==1 || bundle.method!==method || bundle.engine!==engine ||
        !Object.hasOwn(axes,bundle.axis) || !Object.hasOwn(fields,bundle.field) ||
        !inputs.every(k=>valid(bundle.parameters?.[k],k)) || !Array.isArray(bundle.rows) || bundle.rows.length!==14)
      throw Error('Incompatible sweep version, engine, settings or results.');
    return Object.fromEntries(inputs.map(k=>[k,bundle.parameters[k]]));
  }
  async function run(saved){
    if(controller) return;
    controller=new AbortController();
    el('run').disabled=el('open').disabled=el('save').disabled=true;el('stop').hidden=false;
    try{
      const parameters=saved?verify(saved):currentValues(), axis=saved?saved.axis:el('axis').value,rows=[];
      for(const value of positions(axis)) for(const model of modelIds){
        el('status').textContent='Computing '+(rows.length+1)+' of 14 · '+model+' · '+axes[axis][0]+' '+value;
        const result=await WarpCompute.run({kind:'sweep',extent,aspect,snapshot:{...parameters,[axis]:value,model}},controller.signal);
        const row={model,value,...result};
        if(saved){
          const expected=saved.rows[rows.length];
          if(expected?.model!==model || expected.value!==value || !levels.every(l=>Object.keys(fields).every(f=>{
            const v=expected[l]?.[f];
            return Number.isFinite(v) && Math.abs(v-row[l][f])<=1e-12+1e-8*Math.abs(row[l][f]);
          }))) throw Error('Replay mismatch at '+model+' '+axis+'='+value+'.');
        }
        rows.push(row);
      }
      completed={format:'warp-sweep',version:1,method,engine,axis,parameters,rows};
      el('axis').value=axis;if(saved) el('field').value=saved.field;
      render();el('status').textContent=(saved?'Verified all 84 values. ':'Sweep complete. ')+
        'Grid change above 5% is flagged for refinement. Smaller changes do not establish convergence.';
    }catch(e){el('status').textContent=e.name==='AbortError'?'Sweep cancelled.':e.message;}
    finally{controller=null;el('run').disabled=el('open').disabled=false;el('save').disabled=!completed;el('stop').hidden=true;}
  }
  el('run').onclick=()=>run(null);el('stop').onclick=()=>controller?.abort();el('field').onchange=render;
  el('save').onclick=()=>{
    const csv=['model,'+completed.axis+',resolution,min_density_l^-2,positive_energy_l,negative_energy_l'];
    for(const r of completed.rows) for(const l of levels) csv.push([r.model,r.value,l,...Object.keys(fields).map(f=>r[l][f])].join(','));
    const bundle={...completed,field:el('field').value,observer:'Eulerian slice normal',models:modelIds,
      domain:{x:[-extent,extent],y:[-extent/aspect,extent/aspect],z:0,energy:'proper volume of r <= R'},
      grids:{coarse:[200,Math.round(200/aspect),96,24],fine:[400,Math.round(400/aspect),192,48],
        order:['slice columns','slice rows','ball radial cells','ball angular cells']},
      csv:csv.join('\n')+'\n',svg:new XMLSerializer().serializeToString(el('figure').firstChild)};
    const url=URL.createObjectURL(new Blob([JSON.stringify(bundle,null,2)],{type:'application/json'}));
    const a=document.createElement('a');a.href=url;a.download='warp-sweep.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);
  };
  el('open').onclick=()=>el('file').click();
  el('file').onchange=async e=>{
    const file=e.target.files[0];e.target.value='';if(!file) return;
    try{
      if(file.size>128000) throw Error('Sweep bundle exceeds 128 KB.');
      const saved=JSON.parse(await file.text());verify(saved);await run(saved);
    }catch(error){el('status').textContent=error.message;}
  };
})();
