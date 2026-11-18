# Warp Drive Wind Tunnel

An interactive browser laboratory for prescribed general-relativistic metrics. Open `dist/index.html` in a modern browser. The simulator runs locally without a build or package installation.

[Quick start](#quick-start) · [Controls and readouts](#controls-and-readouts) · [Experiment tools](#experiment-tools) · [Independent benchmarks](#independent-solver-benchmarks) · [Clock rates](#clock-rates) · [Custom equations](#custom-equations) · [Shell experiments](#shell-experiments) · [Reproduction](#reproduce-the-research) · [Model references](#model-references)

## Quick start

1. Open `dist/index.html`. The **Help** button summarizes the interface. Close it with **Close** or Escape.
2. Start with **Alcubierre bubble** and **Energy density**. Change **Bubble speed** or **Wall scale** to see the field and photon paths update.
3. Enable **Compare two models** and choose **Natário bubble**. Compare **Expansion** and then **Energy density**.
4. Choose **3D view** to rotate the bubble and photon bundle. Choose **Clock rate** to compare the center and wall.
5. Open **Shell experiments** for the matter-sourced models and recorded time evolution.

The calculation and packaged research data work offline. The simulator uses system fonts. External papers require internet access.

## Models and assumptions

- Minkowski control, Alcubierre bubble, divergence-free Natário bubble, Van Den Broeck conformal pocket, and an ultrastatic matter shell.
- Meridional heatmaps of Eulerian density, volume expansion, and bubble flow. The Alcubierre and Natário presets, static shell, and vacuum also have local NEC maps.
- Test photons evolved in the symmetry plane with a stationary null Hamiltonian and fourth-order Runge–Kutta. The interface reports normalized drift in the conserved Hamiltonian. A finite integration window can truncate plotted paths.
- In-app equations and a research library covering proposals beyond the implemented models, including the Fuchs constant-velocity shell and open-source Warp Factory and Warpax. The browser engine implements the displayed equations directly.

| Main-tunnel model | Interpretation |
| --- | --- |
| Minkowski control | Flat spacetime with straight null paths, zero stress–energy, and unit clock rate. |
| Alcubierre bubble | Axial shift with a smooth radial wall. The wall shows contraction and expansion and negative Eulerian energy density away from the axis. |
| Natário bubble | Divergence-free shift with zero expansion. The wall still has shear and negative Eulerian energy density. |
| Van Den Broeck pocket | A conformally enlarged interior with a moderate scale factor of four and a softened transition for visual inspection. |
| Static matter shell | An ultrastatic, curved-space comparison with positive wall density and radial tension. The Fuchs moving-shell proposal is covered in the research references. |

The main engine evaluates prescribed metrics and evolves test photons. The time-evolved collisionless matter runs appear separately in **Shell experiments**. The models are mathematical experiments. A propulsion system would require a realizable source, dynamical stability, and a demonstrated way to create and steer the geometry.

## Controls and readouts

| Control | What it changes |
| --- | --- |
| **Spacetime model** | Select a built-in metric or the last applied **Custom equation**. |
| **Bubble speed** | Sets the prescribed coordinate speed of a translating bubble, from 0 to 2 in units of light speed. |
| **Bubble radius** | Sets the coordinate reference radius, including the dashed circle in 2D and mesh in 3D. |
| **Wall scale** | Sets the profile transition scale. Its exact meaning depends on the metric or custom formula. |
| **Compactness 2M/R** | Sets the mass scale of the static matter shell. For custom equations it is available as `C`. |
| **Trace photon paths** | Computes and displays test-photon paths. |
| **Show coordinate grid** | Shows the grid in 2D and the coordinate axes in 3D. |
| **Pause / Resume** | Controls the moving markers on the computed paths. Metric controls continue to work while paused. |
| **Reset configuration** | Restores the default main-tunnel settings, including the 2D view and camera. The saved custom profile remains available. |

Geometric units set (G=c=1). Lengths use a fiducial unit **ℓ**, times use **ℓ/c** in SI units, and geometric energy density uses **ℓ⁻²**. The 2D plots sample the meridional plane at (z=0). In moving models, the coordinates follow the bubble and photon motion is shown relative to it.

| Field layer | Meaning |
| --- | --- |
| **Energy density** | Energy measured by the observers normal to the spatial slices. A negative value is evidence of weak-energy-condition violation for that observer. |
| **Expansion** | The local volume expansion or contraction of the normal observer congruence. |
| **Shift speed** | Magnitude of the modeled bubble flow. Clock rate uses the motion relative to the normal observers instead. |
| **Clock rate** | Proper seconds per distant lab second for a clock held at a fixed model position. |
| **Local NEC** | Lowest sampled null contraction for the built-in Alcubierre and Natário bubbles. Flat space and the ultrastatic shell use their exact directional extrema. Available when every displayed model supports the map. |

Use the field legend for units and signs. For signed maps, purple indicates negative values and teal positive values. Field maps emphasize weak features with a nonlinear color scale. The clock map uses a fixed range shared across all runs.

**Min. Eulerian density** is a sampled slice minimum. **Energy condition** gives the built-in condition result or a sampled result for custom profiles. An undetermined result leaves the condition open. **Ray integration** reports the largest absolute change in stationary photon Hamiltonian normalized by the larger of 1 or the initial Hamiltonian magnitude. Finite ray-integration time can truncate paths. The **Center clock** and the interior range are described under [Clock rates](#clock-rates).

## Comparison experiments

Enable **Compare two models** and choose the comparison metric. Both panels use the same coordinate domain, field units and color scale. They share the ray launch positions, initial momenta and integrator time step. A translating metric at or above light speed switches both beams to launch from the right. The common constraints match coordinates and momenta across these geometries. They do not imply that physical rulers or distant observer frames agree across all metrics.

Compare Alcubierre and Natário at the default settings in the Expansion layer, then switch to Energy density. Natário has zero expansion while its wall still has negative Eulerian density. The Local NEC layer is available in comparison mode when both metrics support it.

The numerical checks also compare a non-axial Minkowski trajectory with its exact straight line after 250 integration steps and evaluate the Alcubierre and Natário densities against independent closed-form values at the bubble equator. They verify that a superluminal Alcubierre run and the Minkowski control receive identical initial photon positions.

## Help and 3D view

Open **Help** for an overview of the simulator and its controls. In the main viewport, choose **3D view** and drag with a mouse or one finger, or focus a plot and use the arrow keys. **Reset angle** restores the initial camera. Comparison panels share the camera.

The mesh is a reference-radius surface colored by the selected field. The photon bundle rotates selected numerical meridional paths around the model's symmetry axis. The energy and integration readouts still summarize the original slice. Switch to **2D slice** to inspect the planar field.

## Clock rates

Choose **Clock rate** for a shared 0–1 map of proper seconds per distant lab second. The clocks are held at fixed spatial coordinates in each model, so in the translating metrics they travel with the bubble. The **Center clock** readout reports the central rate, and the layer adds the sampled range inside the reference radius. Amber marks motion that is null or spacelike, where a physical stationary clock cannot exist.

In the main tunnel the lapse is one. A clock held at fixed coordinates has rate $d\tau/dt=\sqrt{-g_{tt}}$ wherever its worldline is timelike. The built-in translating Alcubierre, Natário, and Van Den Broeck bubbles have rate **1** at the exact center, including at superluminal coordinate speeds. Wall and exterior rates depend on the position of the clock and the geometry. Stationary clocks in the Minkowski control and ultrastatic shell have rate **1** throughout. The range shown inside the reference radius comes from samples and the exact center. Very narrow features can lie between samples. In 3D the wire mesh samples the rate at the reference radius.

The separate **Shell experiments** display **Clock deficit** as $1-N$, where $N$ is the lapse normalized at infinity. A 10.52% deficit means a cavity clock accumulates about 89.48 seconds for every 100 seconds at infinity in that static benchmark. In the evolving shell the readout uses the lapse on each time slice. Rotational studies show the background lapse, consistent with the first-order kinetic model. A rate map describes the stated observers and coordinate time convention.

## Custom equations

Choose **Edit equations** to load an editable copy of the active model, or select a metric family in the editor. Change the radial expression and click **Apply custom equation**. The applied profile appears as **Custom equation** in both model selectors, so it can be compared with the built-in preset at the same slider values. The browser saves the last applied expressions locally when storage is available.

| Metric family | Editable functions |
| --- | --- |
| Axial shift | Radial shift profile `f(r)` |
| Divergence-free shift | Radial vector potential profile `f(r)` |
| Conformal pocket | Shift profile `f(r)` and spatial conformal scale `B(r)` |
| Ultrastatic shell | Enclosed mass `m(r)` |

Try `exp(-(r/R)^2)` in the axial shift family for a Gaussian profile. Expressions use `r` (coordinate radius), `R` (radius slider), `w` (wall scale), `v` (speed), `C` (compactness), and `pi`. Expressions are parsed as math. Use explicit multiplication, parentheses, decimal or scientific notation, and the operators `+ - * / ^`. Supported functions are `sin`, `cos`, `tanh`, `exp`, `log`, `sqrt`, `abs`, `min`, `max`, `clamp(x, lo, hi)`, and `smooth5(x)` (a clamped quintic smoothstep). **Load family preset** restores the selected family's editable defaults. Invalid expressions leave the last applied formula active. The simulator checks the proposed field and selected photon paths before it saves a custom profile.

The editor supports radial functions within the four implemented metric families. Derivatives are estimated with finite differences. The engine checks sampled values and the required metric signature where it evaluates the geometry. Very narrow features can be under-resolved, and sampled diagnostics cannot certify energy conditions or physical realizability.

## Shell experiments

Choose a **Research model** and a **Field**. The equatorial slice shows the spatial pattern, the radial profile gives values versus areal radius, and the readout summarizes the selected experiment. Dashed circles indicate the reference wall boundaries for stationary runs or the sampled inner and outer particle radii for evolving runs.

| Research model | What to inspect | Scope and result |
| --- | --- | --- |
| **Static Einstein cluster** | Energy density, tangential pressure, and clock deficit | Idealized circular particle orbits support a static wall around a flat cavity. The cavity clock is 10.52% slower than a clock at infinity. |
| **Evolving Einstein–Vlasov shell** | Energy density, radial and tangential pressure, and clock deficit over time | Collisionless matter defines the self-gravitating shell. The equilibrated reference has a 15.95% cavity clock deficit. The ±2% radial perturbations rebounded and completed roughly one oscillation over 90 simulation time units. |
| **Localized rotational shift** | Azimuthal shift, signed momentum density, energy density, and clock deficit | A prescribed stationary perturbation of the Einstein-cluster geometry. The momentum density is a constraint diagnostic in the equatorial plane. |
| **Matter-sourced counterrotation** | Azimuthal shift, signed momentum density, and clock deficit | A first-order stationary shift sourced by a nonnegative kinetic distribution. The exterior angular momentum cancels at first order. The solution predicts a 2.27 ps peak guided-light round-trip difference at a 10 m midpoint radius. |

For time evolution, choose **2% compression**, **Unperturbed control**, or **2% expansion**, then select **Play** or scrub **Time**. The slice and profile use the fine run. The time chart overlays the fine curves (solid) and coarse curves (dashed) for all three initial conditions. Its radius is weighted by particle rest mass. **Max. ADM drift** reports the largest relative change in the run's total gravitational mass, a numerical conservation check. These are precomputed snapshots from a short spherical pilot. Long-term stability, nonspherical perturbations, and finite-amplitude counterrotation remain open.

### Reproduce the research

Use Python 3 and Node.js from the repository root. The programs use their standard libraries.

```sh
python3 -B research/cluster_shell.py
python3 -B research/check_stress.py
python3 -B research/vlasov_shell.py
python3 -B research/vlasov_dilation.py
python3 -B research/export_vlasov_profile.py > /tmp/warp-vlasov-equilibrium.json
node research/evolve_vlasov.cjs /tmp/warp-vlasov-equilibrium.json /tmp/warp-vlasov-evolution.json
python3 -B research/export_research_data.py /tmp/warp-vlasov-evolution.json dist/research-data.js
python3 -B research/vlasov_rotation.py dist/research-rotation.js
```

Use an existing temporary directory in place of `/tmp` on platforms where that path is unavailable. The export commands regenerate the browser data used by the offline player. The packaged data is sufficient for playback.

- [Source-first shell, mass bound, and prescribed rotation](research/positive_energy_shell.md)
- [Matter-sourced equilibrium and radial perturbation](research/vlasov_equilibrium.md)
- [Time evolution, numerical checks, and data regeneration](research/vlasov_evolution.md)
- [First-order matter-sourced counterrotation](research/vlasov_rotation.md)

## Numerical checks

Run `node verify.cjs` from this directory. Checks cover reference field signs, zero expansion, the flat control, and typical subluminal and superluminal photon integration cases, custom equation parsing and preset equivalence, 3D path sampling, and clock behavior at centers and null boundaries.

### Browser security and computation

Custom field and ray calculations and numerical checks use cancellable workers on HTTP(S). Opening the HTML directly uses a cooperative fallback that yields to the interface. Each asynchronous panel or numerical check has a 15-second time budget. A settings change supersedes the current plot computation. The active plot or numerical check can also be cancelled in the interface.

The page uses a document Content Security Policy to restrict executable resources to same-origin files and block network requests from its scripts. Experiment files are read locally and formulas are evaluated by the math parser. External research links open as normal navigation.

### Repository layout

- `dist/index.html` opens the simulator. `dist/app.js` manages the main tunnel, `dist/physics.js` implements the metrics and ray integration, `dist/equations.js` parses custom profiles, and `dist/view3d.js` draws the orbitable view.
- `dist/compute-core.js` supplies the numerical jobs. The worker and local-file fallback use the same calculation logic.
- `dist/research-view.js` renders the shell experiments using `dist/research-data.js` and `dist/research-rotation.js`.
- `research/` contains the solvers, data exporters, and derivations. `verify.cjs` exercises the main-tunnel numerical engine.

## Experiment tools

- **Save experiment / Open experiment** round-trip a versioned JSON file. It records both model choices, comparison state, sliders, custom formulas, selected field, clock observer convention, camera, grid, ray toggle, and numerical settings. Photon launch positions follow from the recorded radius, extent, and direction. Open the file in the same version of the simulator to restore the main tunnel. Imports validate exact field and family names, slider ranges, and the renderable results before replacing the current experiment. An opened profile stays in the current session. Use **Apply custom equation** to save it locally.
- **Field CSV** exports the selected meridional field with panel, model, coordinates, and value. A blank value means there is no fixed-coordinate clock at that sample. **Photon CSV** exports the computed slice paths with ray index, integration step, and coordinate time. Save the experiment JSON too if the CSV needs to be reproduced. Coordinates and times use geometric units.
- **Guided labs** loads one of three built-in configurations for straight null paths, Natário expansion, or comparing a bubble center clock with a matter-shell cavity clock. Predict the outcome before opening **Expected result**.
- **Numerical checks** compares minimum Eulerian density on grids with 200 and 400 columns and recomputes photon paths with half the coordinate time step. The report compares positions only at times present in both trajectories, and includes the finer run's normalized Hamiltonian drift. Agreement checks sensitivity to these particular settings.
- **Directional null energy** probes a point in the 2D slice. Use the axial and transverse sliders or click the **Local NEC** map. The amber cross marks the probe location. For Alcubierre and Natário the probe compares Eulerian density with the lowest contraction among 198 sampled directions and reports the corresponding unit vector in the local spatial frame. For the ultrastatic shell and flat control it evaluates $T_{ab}k^ak^b=\rho+p_r\cos^2\theta+p_t\sin^2\theta$ in the local orthonormal frame for 19 angles from radial to tangential at the selected radius. Spherical symmetry supplies the equivalent remaining directions. The shell probe includes custom shells. Moving custom metrics and the Van Den Broeck pocket retain their existing diagnostics.
- **Physical scale** rescales the Einstein-cluster, Einstein–Vlasov, or counterrotating benchmark at fixed compactness. Enter a midpoint radius in meters to see ADM mass and cavity clock lag. The counterrotating case also gives the asymmetric guided-light delay and the rotation rate of an ideal flat circular guide producing the same local Sagnac delay. This comparison uses the small-rotation limit and the guide's local clock.
- **Graded-index optics** solves the geometric-optics analog of the built-in static shell at the current radius, wall scale, and compactness. Its isotropic radius $q$ satisfies $d\ln q/dr=1/(r\sqrt{1-2m(r)/r})$ and is normalized at infinity. The effective index is $n(q)=r/q$ for the unit-lapse shell. Teal traces solve the gradient-index ray equations, dashed gray traces show the uniform control, and the purple curve shows $n(x)$ through the center. The optical model preserves spatial ray paths in isotropic coordinates. It models material refraction and supplies no gravitational source. [Optical geometry background](https://arxiv.org/abs/1010.3416)

## Independent solver benchmarks

In **Experiment tools**, download the Alcubierre or Natário experiment and reopen it with **Open experiment**. The fixtures use the same built-in profiles, speed (0.65 c), radius (2.1 ℓ), and wall scale (0.37 ℓ). The companion CSVs compare the actual browser engine to [Warpax](https://github.com/anindex/warpax) on two nested grids and include the reference orthonormal stress tensor. The directional NEC implementation also replays the reference stress tensors and verifies all ten independent components. The grids in the CSVs are independent benchmark domains. Reopening the experiment restores the standard viewport and numerical settings.

[Comparison method, results, and how to regenerate the datasets](research/benchmark_warpax.md) · [Benchmark files](dist/benchmarks)

## Model references

Open **Model equations and sources** in the simulator for annotated references for each selected model. Comparison mode displays sources for both models.

| Model | Theory and follow-up |
| --- | --- |
| Minkowski control | [Einstein’s special relativity paper](https://physics.umd.edu/courses/Phys371/AnlageFall19/Einstein_1905_relativity.pdf) · [Cambridge notes on Minkowski spacetime and geodesics](https://www.damtp.cam.ac.uk/user/tong/gr/grhtml/S1.html) |
| Alcubierre bubble | [Original metric](https://arxiv.org/abs/gr-qc/0009013) · [Energy conditions](https://arxiv.org/abs/gr-qc/0406083) · [Semiclassical stability](https://arxiv.org/abs/0904.0141) |
| Natário bubble | [Zero-expansion construction](https://arxiv.org/abs/gr-qc/0110086) · [Null energy condition](https://arxiv.org/abs/2105.03079) · [Negative-energy bound, preprint](https://arxiv.org/abs/2609.36211) |
| Van Den Broeck pocket | [Original pocket geometry](https://arxiv.org/abs/gr-qc/9905084) · [Companion discussion](https://arxiv.org/abs/gr-qc/9906050) · [Observer-robust energy checks, preprint](https://arxiv.org/abs/2602.18023) |
| Static matter shell | [Spherical metric and stress–energy, Section III](https://epizodyspace.ru/bibl/inostr-yazyki/ajph/1988/morris_thorne.pdf) · [Subluminal shell theory](https://arxiv.org/abs/2102.06824) · [Related moving-shell proposal](https://arxiv.org/abs/2405.02709) |
