const assert = require('assert');
const Warp = require('./dist/physics');
const settings = { speed: .65, radius: 2.1, width: .37, compactness: .4 };
const flat = { ...settings, model: 'flat', speed: 0 };
const alcubierre = { ...settings, model: 'alcubierre' };
const natario = { ...settings, model: 'natario' };
const shell = { ...settings, model: 'shell', speed: 0 };
const pocket = { ...settings, model: 'pocket' };
const R = settings.radius;
assert.strictEqual(Warp.field(0, 0, flat).rho, 0);
assert(Warp.field(0, R, alcubierre).rho < 0);
assert(Warp.field(R, 0, alcubierre).expansion < 0);
assert(Warp.field(0, R, natario).rho < 0);
assert.strictEqual(Warp.field(0, R, natario).expansion, 0);
assert(Warp.field(0, R, shell).rho > 0);
assert(Warp.field(3, 0, shell).nec < 0);
const staticPocket = { ...pocket, speed: 0 };
assert(Warp.field(.4 * R, 0, staticPocket).rho > 0);
assert(Warp.field(.56 * R, 0, staticPocket).rho < 0);
for (const model of [flat, shell, alcubierre, natario, pocket, staticPocket,
  { ...alcubierre, speed: 1.5 }, { ...natario, speed: 1.5 }, { ...pocket, speed: 1.5 }]) {
  const rays = Warp.rays(model, 6.2);
  assert.strictEqual(rays.length, 15);
  for (const { path, drift } of rays) {
    assert(path.length > 5 && path.every(point => point.every(Number.isFinite)));
    assert(drift < .002);
    if (model === flat) assert(path.every(point => point[1] === path[0][1]));
  }
}
console.log('Field and ray checks passed.');

// Closed-form Minkowski benchmark, including non-axial momentum.
const initial = [-2, .8, 3, 4];
const dt = .02;
let state = initial;
let maxPositionError = 0;
for (let i = 1; i <= 250; i++) {
  state = Warp.step(state, dt, flat);
  const t = i * dt;
  maxPositionError = Math.max(maxPositionError,
    Math.hypot(state[0] - (-2 + .6 * t), state[1] - (.8 + .8 * t)));
}
assert(maxPositionError < 1e-8);
assert.deepStrictEqual(state.slice(2), [3, 4]);

// Closed-form Eulerian densities at the equator r = R, z = 0.
const w = settings.width;
const v = settings.speed;
const tanh = Math.tanh(2 * R / w);
const sechSquared = 1 - tanh * tanh;
const normalization = 2 * Math.tanh(R / w);
const firstDerivative = -tanh * tanh / (w * normalization);
const secondDerivative = -2 * tanh * sechSquared / (w * w * normalization);
const expectedAlcubierre = -(v * v * firstDerivative * firstDerivative) / (32 * Math.PI);
const expectedNatario = -(v * v * (2 * firstDerivative + R * secondDerivative)**2) / (128 * Math.PI);
const measuredAlcubierre = Warp.field(0, R, alcubierre).rho;
const measuredNatario = Warp.field(0, R, natario).rho;
assert(Math.abs(measuredAlcubierre - expectedAlcubierre) < 1e-12);
assert(Math.abs(measuredNatario - expectedNatario) < 1e-8);

// A superluminal run and the control must use the same injection side.
const fast = {...alcubierre, speed: 1.5};
const launch = {
  direction: Math.min(Warp.rayDirection(flat), Warp.rayDirection(fast)),
  dt: Math.min(Warp.rayTimeStep(flat), Warp.rayTimeStep(fast))
};
assert.strictEqual(launch.direction, -1);
const fastRays = Warp.rays(fast, 6.2, launch);
const controlRays = Warp.rays(flat, 6.2, launch);
assert.deepStrictEqual(fastRays.map(ray => ray.path[0]), controlRays.map(ray => ray.path[0]));
assert(controlRays.every(ray => ray.path[1][0] < ray.path[0][0]));

console.log('Minkowski maximum position error:', maxPositionError.toExponential(3), 'ℓ');
console.log('Alcubierre equatorial density:', measuredAlcubierre.toExponential(6), 'ℓ⁻²');
console.log('Natário equatorial density:', measuredNatario.toExponential(6), 'ℓ⁻²');
console.log('Matched photon launch checks passed.');

// Equation parsing and built-in profile equivalence.
const Equations = require('./dist/equations');
assert.strictEqual(Equations.compile('-2^2 + 2^3^2')(0, settings), 508);
assert.strictEqual(Equations.compile('clamp(1e-2 + r, 0, 1)')(2, settings), 1);
for (const invalid of ['','r +','Math.sin(r)','eval(r)','2r','min(r)','1e999']) {
  assert.throws(() => Equations.compile(invalid));
}
for (const base of [alcubierre,natario,pocket,shell]) {
  const custom = Equations.create(base.model, Equations.defaults[base.model]);
  const edited = { ...base, custom };
  Warp.validate(edited, 6.2);
  for (const [x,y] of [[0,0],[.6,.6],[0,R],[.2,R],[3,0]]) {
    const original = Warp.field(x, y, base), equivalent = Warp.field(x, y, edited);
    for (const key of ['rho','expansion','shift']) {
      assert(Math.abs(original[key]-equivalent[key]) < 2e-4, base.model+' '+key);
    }
    assert(Math.abs(Warp.hamiltonian([x,y,.6,.8],edited)-Warp.hamiltonian([x,y,.6,.8],base)) < 1e-6);
  }
}
const zero = {...alcubierre,custom:Equations.create('alcubierre',{f:'0'})};
const gaussian = {...alcubierre,custom:Equations.create('alcubierre',{f:'exp(-(r/R)^2)'})};
assert.equal(Math.abs(Warp.field(0, R, zero).rho),0);
assert(Warp.field(0, R, gaussian).rho < 0);
assert(Warp.rays(gaussian,6.2).every(ray=>ray.path.length>5 && ray.drift < .002));
assert.throws(()=>Warp.validate({...pocket,custom:Equations.create('pocket',{f:'0',B:'0'})},6.2),/positive/);
assert.throws(()=>Warp.validate({...shell,custom:Equations.create('shell',{m:'r'})},6.2),/2m|regular shell/);
assert.throws(()=>Warp.validate({...alcubierre,custom:Equations.create('alcubierre',{f:'1/r'})},6.2),/finite/);
console.log('Custom equations and preset equivalence checks passed.');

// The 3D view keeps calculated paths and expands only the transverse angle.
const View3D = require('./dist/view3d');
const sampleTrace = Warp.rays(alcubierre, 6.2);
const bundle = View3D.rayBundle(sampleTrace);
assert.equal(bundle.length, 41);
assert.equal(bundle[0].path, sampleTrace[7].path);
assert(bundle.slice(1,9).every(ray=>ray.path===sampleTrace[8].path));
assert.equal(new Set(bundle.slice(1,9).map(ray=>ray.angle)).size, 8);
const center = [400,200,0];
const projection = View3D.project(800,400,6.2,View3D.defaultCamera);
assert.deepEqual(projection([0,0,0]),center);
assert.notDeepEqual(projection([2,1,0]),View3D.project(800,400,6.2,{yaw:0,pitch:0})([2,1,0]));
console.log('3D photon bundle and camera checks passed.');

// Fixed-coordinate proper time is observer-specific and vanishes at the null boundary.
for(const model of [flat,shell,alcubierre,natario,pocket,{...alcubierre,speed:1.5}]){
  assert.equal(Warp.clockRate(0,0,model),1);
}
assert.equal(Warp.clockRate(20,0,flat),1);
assert.equal(Warp.clockRate(20,0,shell),1);
assert(Math.abs(Warp.clockRate(20,0,alcubierre)-Math.sqrt(1-settings.speed**2))<1e-12);
assert.equal(Warp.clockRate(20,0,{...alcubierre,speed:1}),null);
assert.equal(Warp.clockRate(20,0,{...alcubierre,speed:1.5}),null);
assert(Math.abs(Warp.clockRate(0,0,zero)-Math.sqrt(1-settings.speed**2))<1e-12);
assert.equal(Warp.clockRate(0,0,{...zero,speed:1.5}),null);
assert.equal(Warp.clockRate(0,0,{...pocket,custom:Equations.create('pocket',{f:'0',B:'4'})}),null);
console.log('Clock rates, moving and static centers, and null boundaries passed.');

// The spherical null-energy probe reproduces the exact directional extrema.
for(const radius of [0,R,3]){
  const radial=Warp.nullEnergy(radius,1,shell);
  const tangent=Warp.nullEnergy(radius,0,shell);
  assert.equal(Math.min(radial,tangent),Warp.field(radius,0,shell).nec);
  assert(Math.abs(Warp.nullEnergy(radius,Math.SQRT1_2,shell)-(radial+tangent)/2)<1e-12);
}
assert.equal(Warp.nullEnergy(R,.5,flat),0);
assert.equal(Warp.nullEnergy(R,.5,alcubierre),null);

const Optics = require('./dist/lab-optics');
const index = Optics.medium(shell,Warp.shell);
assert(index.center>1);
assert(index.index(4)[0]<index.center);
const far = 20, mass = shell.compactness*shell.radius/2;
assert.equal(index.index(far)[0],(1+mass/(2*far))**2);
assert.equal(Optics.ray(()=>[1,0],1).deflection,0);
assert(Optics.ray(index.index,1).deflection<0);
// Match the optical ray to the spacetime ray at the same coordinate times.
const opticalRay=Optics.ray(index.index,.65*R);
const [qx,qy]=opticalRay.path[0], q=Math.hypot(qx,qy);
const [n,dndq]=index.index(q);
const radial=[qx/q,qy/q];
// For X=n(q)Q, the inverse-transpose Jacobian takes the launch covector
// (1,0) to areal Cartesian coordinates with radial eigenvalue 1/(n+qn').
const correction=radial[0]*(1/(n+q*dndq)-1/n);
let areal=[n*qx,n*qy,1/n+correction*radial[0],correction*radial[1]];
let opticalError=0;
for(const [x,y] of opticalRay.path){
  const [factor]=index.index(Math.hypot(x,y));
  opticalError=Math.max(opticalError,Math.hypot(areal[0]-factor*x,areal[1]-factor*y));
  areal=Warp.step(areal,.025,shell);
}
assert.equal(opticalRay.path.length,474);
assert(Math.abs(opticalRay.deflection+10.6401)<.001);
assert(opticalError<5e-5,'Optical/spacetime trajectory discrepancy: '+opticalError);
console.log('Shell optical trajectory maximum discrepancy:',opticalError.toExponential(4),'ℓ');
console.log('Directional NEC and graded-index optics checks passed.');

// Reject loose JSON types before looking up a family or accepting formulas.
assert.throws(()=>Equations.create(['alcubierre'],{f:'0'}),/supported metric family/);
assert.throws(()=>Equations.create('alcubierre',null),/formula object/);
assert.throws(()=>Equations.create('alcubierre',[]),/formula object/);
assert.throws(()=>Equations.create('alcubierre',Object.create({f:'0'})),/Expected a number/);
const iterator=Warp.trace(alcubierre,6.2);
let partial=iterator.next();
assert.equal(partial.done,false);
while(!partial.done) partial=iterator.next();
assert.deepEqual(partial.value,sampleTrace);
console.log('Strict equation input and resumable photon integration checks passed.');

// Replay the independent reference samples against the shipped field engine.
const fs = require('fs');
const path = require('path');
const benchmarks = path.join(__dirname,'dist','benchmarks');
const Nec = require('./dist/nec');
const tensorIndices=[0,1,2,3,5,6,7,10,11,15];
for(const name of ['alcubierre','natario']){
  const {parameters,models}=JSON.parse(fs.readFileSync(path.join(benchmarks,name+'.json'),'utf8'));
  assert.equal(models[0],name);
  const benchmark={...parameters,model:name};
  for(const grid of [25,49]){
    const [header,...rows]=fs.readFileSync(path.join(benchmarks,name+'-'+grid+'.csv'),'utf8').trim().split('\n');
    assert.equal(rows.length,grid*grid);
    assert(header.startsWith('x_l,y_l,rho_wind_tunnel,rho_warpax,delta_rho,'));
    let maxDensity=0, maxHalfStep=0, maxTensor=0, maxTensorHalf=0, maxSampledError=0;
    for(const row of rows){
      const columns=row.split(',').map(Number);
      const [x,y,recorded,rho,,recordedExpansion,expansion]=columns;
      const observed=Warp.field(x,y,benchmark);
      assert(Math.abs(observed.rho-recorded)<1e-11);
      assert(Math.abs(observed.expansion-recordedExpansion)<2e-12);
      assert(Math.abs(observed.expansion-expansion)<2e-12);
      maxDensity=Math.max(maxDensity,Math.abs(observed.rho-rho));
      if(name==='natario') maxHalfStep=Math.max(maxHalfStep,Math.abs(Warp.field(x,y,benchmark,0.00005).rho-rho));
      const actual=Nec.tensor(x,y,0,benchmark);
      const finerTensor=Nec.tensor(x,y,0,benchmark,.0005);
      const expected=new Float64Array(16);
      tensorIndices.forEach((index,i)=>{
        expected[index]=expected[(index%4)*4+(index>>2)]=columns[10+i];
        maxTensor=Math.max(maxTensor,Math.abs(actual[index]-expected[index]));
        maxTensorHalf=Math.max(maxTensorHalf,Math.abs(finerTensor[index]-expected[index]));
      });
      const sampled=Nec.directions(actual);
      maxSampledError=Math.max(maxSampledError,Math.abs(sampled.minimum-Nec.directions(expected).minimum));
      assert(sampled.direction.every(Number.isFinite));
      assert(Math.abs(Math.hypot(...sampled.direction)-1)<1e-12);
    }
    assert(maxDensity<(name==='natario'?2e-9:2e-12));
    if(name==='natario') assert(maxHalfStep<.35*maxDensity);
    assert(maxTensor<5e-7);
    assert(maxSampledError<1.5e-6);
    assert(maxTensorHalf<.35*maxTensor);
    console.log(name,grid+'×'+grid,'max stress error',maxTensor.toExponential(3),
      'half-step',maxTensorHalf.toExponential(3));
  }
}
const offAxis=Nec.probe(.2,R,natario);
assert(offAxis.minimum<-.1 && offAxis.negative>0);
const zeroTensor=Nec.tensor(R,R,0,{...alcubierre,speed:0});
assert(zeroTensor.every(value=>value===0));
assert(Nec.supported(shell) && !Nec.supported(zero) && !Nec.supported(pocket));
console.log('Warpax field, full stress tensor, and sampled null map checks passed on both grids.');

// Review regressions through the same panel sampler used in the browser.
const fsReview=require('fs'), vmReview=require('vm');
const reviewEngine=vmReview.runInNewContext(fsReview.readFileSync(require.resolve('./dist/compute-core.js'),'utf8')+
  '\nWarpComputeCore',{Warp,WarpEquations:Equations,WarpNec:Nec});
for(const coefficient of [.001,0,-.001]){
  const custom=Equations.create('shell',{m:String(coefficient)+'*r^3'});
  const s={...shell,custom};
  Warp.validate(s,6.2);
  const density=3*coefficient/(4*Math.PI);
  for(const r of [0,.0001,.001,.1]){
    assert(Math.abs(Warp.field(r,0,s).rho-density)<1e-12);
    assert(Math.abs(Warp.nullEnergy(r,1,s)-coefficient/(2*Math.PI))<1e-12);
  }
  const job={kind:'panel',field:'rho',extent:6.2,aspect:1.65,
    snapshot:{...shell,custom:{family:'shell',formulas:custom.formulas}},rays:false,options:{maxSteps:1}};
  const {samples}=reviewEngine.runSync(job);
  assert.equal(samples.minRho,Math.min(...samples.values));
  const study=reviewEngine.runSync({...job,kind:'numerics',options:{dt:.02,maxSteps:1}});
  for(const minimum of [study.coarse,study.fine]) assert(Math.abs(minimum-density)<1e-12);
}
for(const a of ['0.001','1e-15']) assert.throws(()=>Warp.validate({...shell,
  custom:Equations.create('shell',{m:a+'*r^2'})},6.2),/regular shell/);
const flatVolume=4*Math.PI*R**3/3;
for(const B of [1,2]){
  const integrals=Warp.ballIntegrals({...pocket,speed:0,custom:Equations.create('pocket',{B:String(B),f:'0'})});
  assert(Math.abs(integrals.volume/flatVolume-B**3)<1e-12);
  assert.equal(integrals.positive,0);
  assert.equal(integrals.negative,0);
}
const pocketBall=Warp.ballIntegrals(pocket);
assert(pocketBall.volume>flatVolume && pocketBall.positive>0 && pocketBall.negative<0);
assert(Warp.rays(flat,6.2,{maxSteps:1}).every(ray=>ray.termination==='step limit'));
console.log('Custom center, sampled minima, proper volumes, signed energies and ray termination checks passed.');

const refined=Nec.probe(.4,R,natario,true);
assert(refined.refinedMinimum<=refined.minimum);
assert(Math.abs(Math.hypot(...refined.refinedDirection)-1)<1e-12);
