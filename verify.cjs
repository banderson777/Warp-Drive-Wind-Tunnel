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
