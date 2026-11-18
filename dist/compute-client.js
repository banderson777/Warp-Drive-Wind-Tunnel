'use strict';
const WarpCompute = (() => {
  const workerUrl=new URL('compute-worker.js',document.currentScript.src);
  const abort=()=>new DOMException('Calculation cancelled.','AbortError');

  async function run(job,signal){
    if(signal && signal.aborted) throw abort();
    if(job.kind==='panel' && !job.snapshot.custom) return WarpComputeCore.runSync(job);
    if(workerUrl.protocol==='file:' || typeof Worker==='undefined')
      return WarpComputeCore.runCooperative(job,signal);
    let worker;
    try{worker=new Worker(workerUrl);}
    catch(error){return WarpComputeCore.runCooperative(job,signal);}
    try{
      return await new Promise((resolve,reject)=>{
        function finish(callback,value){
          clearTimeout(timer);
          worker.terminate();
          if(signal) signal.removeEventListener('abort',cancel);
          callback(value);
        }
        const cancel=()=>finish(reject,abort());
        const timer=setTimeout(()=>finish(reject,Error('The calculation exceeded the 15-second limit.')),WarpComputeCore.timeout);
        if(signal) signal.addEventListener('abort',cancel,{once:true});
        worker.onmessage=({data})=>data.error?finish(reject,Error(data.error)):finish(resolve,data.value);
        worker.onerror=()=>finish(reject,Error('The calculation worker failed to start or stopped unexpectedly.'));
        try{worker.postMessage(job);}
        catch(error){finish(reject,error);}
      });
    }finally{
      worker.terminate();
    }
  }
  return {run};
})();
