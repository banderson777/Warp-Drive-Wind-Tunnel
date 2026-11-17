# Warp Photon Wind Tunnel Simulator

An interactive browser laboratory for prescribed general-relativistic metrics. Open `dist/index.html` in a modern browser. The simulator runs locally without a build or package installation.

- Minkowski control, Alcubierre bubble, divergence-free Natário bubble, Van Den Broeck conformal pocket, and an ultrastatic matter shell.
- Meridional heatmaps of Eulerian density, volume expansion, and bubble flow. The static shell and vacuum also have local NEC maps.
- Test photons evolved in the symmetry plane with a stationary null Hamiltonian and fourth-order Runge–Kutta. The interface reports normalized drift in the conserved Hamiltonian. A finite integration window can truncate plotted paths.
- In-app equations and a research library covering proposals beyond the implemented models, including the Fuchs constant-velocity shell and open-source Warp Factory and Warpax. The browser engine implements the displayed equations directly.

The pocket uses a moderate conformal scale of four to expose its structure on screen. The ultrastatic shell is a comparison metric with radial tension, not a reproduction of the Fuchs solution. The engine evaluates selected diagnostics of prescribed metrics. It does not evolve matter or solve for a realizable propulsion mechanism.

## Numerical checks

Run `node verify.cjs` from this directory. Checks cover reference field signs, zero expansion, the flat control, and typical subluminal and superluminal photon integration cases.

## Comparison experiments

Enable **Compare two models** and choose the comparison metric. Both panels use the same coordinate domain, field units and color scale. They share the ray launch positions, initial momenta and integrator time step. A translating metric at or above light speed switches both beams to launch from the right. The common constraints match coordinates and momenta across these geometries. They do not imply that physical rulers or distant observer frames agree across all metrics.

Compare Alcubierre and Natário at the default settings in the Expansion layer, then switch to Energy density. Natário has zero expansion while its wall still has negative Eulerian density. The Local NEC layer is available in comparison mode when both metrics support it.

The numerical checks also compare a non-axial Minkowski trajectory with its exact straight line after 250 integration steps and evaluate the Alcubierre and Natário densities against independent closed-form values at the bubble equator. They verify that a superluminal Alcubierre run and the Minkowski control receive identical initial photon positions.

## Model references

Open **Model equations and sources** in the simulator for annotated references for each selected model. Comparison mode displays sources for both models.

| Model | Theory and follow-up |
| --- | --- |
| Minkowski control | [Einstein’s special relativity paper](https://physics.umd.edu/courses/Phys371/AnlageFall19/Einstein_1905_relativity.pdf) · [Cambridge notes on Minkowski spacetime and geodesics](https://www.damtp.cam.ac.uk/user/tong/gr/grhtml/S1.html) |
| Alcubierre bubble | [Original metric](https://arxiv.org/abs/gr-qc/0009013) · [Energy conditions](https://arxiv.org/abs/gr-qc/0406083) · [Semiclassical stability](https://arxiv.org/abs/0904.0141) |
| Natário bubble | [Zero-expansion construction](https://arxiv.org/abs/gr-qc/0110086) · [Null energy condition](https://arxiv.org/abs/2105.03079) · [Negative-energy bound, preprint](https://arxiv.org/abs/2609.36211) |
| Van Den Broeck pocket | [Original pocket geometry](https://arxiv.org/abs/gr-qc/9905084) · [Companion discussion](https://arxiv.org/abs/gr-qc/9906050) · [Observer-robust energy checks, preprint](https://arxiv.org/abs/2602.18023) |
| Static matter shell | [Spherical metric and stress–energy, Section III](https://epizodyspace.ru/bibl/inostr-yazyki/ajph/1988/morris_thorne.pdf) · [Subluminal shell theory](https://arxiv.org/abs/2102.06824) · [Related moving-shell proposal](https://arxiv.org/abs/2405.02709) |
