'use strict';
importScripts('equations.js','physics.js','compute-core.js');
self.onmessage=({data})=>{
  try{
    const value=WarpComputeCore.runSync(data);
    const transfer=value.samples?[value.samples.values.buffer]:[];
    self.postMessage({value},transfer);
  }catch(error){
    self.postMessage({error:error.message});
  }
};
