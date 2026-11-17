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
