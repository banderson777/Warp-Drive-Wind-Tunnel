'use strict';
// Read a point list and evaluate the shipped browser engine without a DOM.
const fs=require('fs');
const Warp=require('../dist/physics.js');

const {model,parameters,points}=JSON.parse(fs.readFileSync(0,'utf8'));
const settings={...parameters,model};
const values=points.map(([x,y])=>{
  const {rho,expansion}=Warp.field(x,y,settings);
  return [rho,expansion,Warp.field(x,y,settings,0.00005).rho];
});
process.stdout.write(JSON.stringify(values));
