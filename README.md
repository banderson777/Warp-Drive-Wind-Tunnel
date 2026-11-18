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

## Custom equations

Choose **Edit equations** to load an editable copy of the active model, or select a metric family in the editor. Change the radial expression and click **Apply custom equation**. The applied profile appears as **Custom equation** in both model selectors, so it can be compared with the built-in preset at the same slider values. The browser saves the last applied expressions locally when storage is available.

| Metric family | Editable functions |
| --- | --- |
| Axial shift | Radial shift profile `f(r)` |
| Divergence-free shift | Radial vector potential profile `f(r)` |
| Conformal pocket | Shift profile `f(r)` and spatial conformal scale `B(r)` |
| Ultrastatic shell | Enclosed mass `m(r)` |

Try `exp(-(r/R)^2)` in the axial shift family for a Gaussian profile. Expressions use `r` (coordinate radius), `R` (radius slider), `w` (wall scale), `v` (speed), `C` (compactness), and `pi`. Use explicit multiplication and `^` for powers. The in-app syntax guide lists supported functions. Expressions are parsed as math.

The editor supports radial functions within the four implemented metric families. Derivatives are estimated with finite differences. The engine checks sampled values and the required metric signature where it evaluates the geometry. Very narrow features can be under-resolved, and sampled diagnostics cannot certify energy conditions or physical realizability.

## Shell experiments

Open **Shell experiments** to visualize three research cases. Inspect the static Einstein cluster, the prescribed localized rotational shift, or an evolving collisionless shell. Scrub time for the ±2% radial perturbations and the control, compare both numerical resolutions in the radius history, and switch among density, clock deficit, pressure, and rotational fields where applicable.

- [Source-first shell and rotation study](research/positive_energy_shell.md)
- [Matter-sourced equilibrium and radial perturbation](research/vlasov_equilibrium.md)
- [Time evolution, numerical checks, and data regeneration](research/vlasov_evolution.md)

The **Matter-sourced counterrotation** mode solves for the first-order shift from a nonnegative kinetic distribution with compensating angular currents. [Derivation and reproduction instructions](research/vlasov_rotation.md)

## Help and 3D view

Open **Help** for an overview of the simulator and its controls. In the main viewport, choose **3D view** and drag with a mouse or one finger, or focus a plot and use the arrow keys. **Reset angle** restores the initial camera. Comparison panels share the camera.

The mesh is a reference-radius surface colored by the selected field. The photon bundle rotates selected numerical meridional paths around the model's symmetry axis. The energy and integration readouts still summarize the original slice. Switch to **2D slice** to inspect the planar field.

## Clock rates

Choose **Clock rate** for a shared 0–1 map of proper seconds per distant lab second. The clocks are held at fixed spatial coordinates in each model, so in the translating metrics they travel with the bubble. The **Center clock** readout reports the central rate, and the layer adds the sampled range inside the reference radius. Amber marks motion that is null or spacelike, where a physical stationary clock cannot exist.

In the main tunnel the lapse is one. A stationary clock has (d\tau/dt=\sqrt{-g_{tt}}) wherever its worldline is timelike. The built-in moving bubble centers, flat space, and the ultrastatic shell have rate 1 at the center. Wall and exterior rates can differ for clocks constrained to the moving coordinates. The separate **Shell experiments** use the **Clock deficit** layer for matter-sourced shells, whose nonunit lapse can slow a stationary cavity clock relative to infinity.
