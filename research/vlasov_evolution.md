# Finite-time Einstein–Vlasov shell evolution

17 November 2026 · A spherical numerical pilot

The [static matter-sourced equilibrium](vlasov_equilibrium.md) and its canonical radial dilations provide initial data. This study evolves the unperturbed model and the ±2% dilations through (t=90) in asymptotic coordinate time, using geometric units (G=c=1). Both perturbed runs show a radial rebound and roughly one oscillation. The experiment tests only this spherical matter model and these initial perturbations. The localized rotation in the [earlier study](positive_energy_shell.md) remains a prescribed metric hypothesis.

## Method

Use polar-areal coordinates with zero shift, lapse (N), and (A=1-2m/r). Each weighted numerical particle carries its areal radius (r), covariant canonical radial momentum (P), and conserved squared angular momentum (L). At fixed coordinate time the characteristic Hamiltonian is

\[
H(t,r,P,L)=N\sqrt{1+AP^2+L/r^2}.
\]

Advance (\dot r=\partial_P H), (\dot P=-\partial_r H) with explicit midpoint time stepping. Initial canonical dilation maps (r\mapsto\lambda r), (P\mapsto P/\lambda), leaving the weights and (L) fixed. Reference equilibrium samples use midpoint radial and angular quadrature and Simpson momentum-magnitude quadrature. Particles have equal weights before and after dilation, with different weights between phase-space cells.

At each time stage, deposit the energy and pressure moments onto adjacent radial cell centers. A particle of rest weight (W), local energy (E=H/N), and proper radial momentum (w=\sqrt A P) contributes (W\sqrt A E) to the cell's mass increment, (W\sqrt A w^2/E) to the integrated radial pressure moment, and (W\sqrt A L/(2r^2 E)) to the one-component tangential pressure moment. The (sqrt A) converts the count per areal-coordinate volume to a count per proper volume. The code iterates mass deposition and (A) five times at each stage, and integrates

\[
(\log N)'=\frac{m+4\pi r^3p_r}{r^2 A}
\]

inward from the Schwarzschild boundary lapse. The mass and lapse use the radial Einstein equations in polar-areal gauge. No trapped radius was encountered. Polar-areal coordinates cannot follow the solution across such a radius. This code is a pilot implementation inspired by spherical particle-in-cell work. The convergence result for the published scheme does not establish convergence for this particular discretization. [Rein and Rodewis, particle-in-cell method](https://arxiv.org/abs/math/0209336) · [Günther et al., nonlinear stability experiments](https://arxiv.org/abs/2009.08163)

## Results

The coarse runs use 180 radial cells, 10,080 weighted particles, and (Delta t=0.1). The finer runs use 360 cells, 34,944 particles, and (Delta t=0.05). Cells cover (0<r<7). The diagnostic radius is weighted by conserved particle rest mass. The finer runs contained all particles between (r=0.6607) and (r=3.7133) across the exported sample times.

| Initial data | Mean radius range, fine grid | First reversal time | Peak (2m/r), fine samples | Maximum relative ADM drift |
| --- | ---: | ---: | ---: | ---: |
| 2% compression | 1.82537–1.90072 | (t\approx37), outward to inward | 0.19229 | (2.07\times10^{-7}) |
| Unperturbed | 1.86141–1.86436 | — | 0.18861 | (2.73\times10^{-7}) |
| 2% expansion | 1.82670–1.89998 | (t\approx37), inward to outward | 0.19182 | (2.21\times10^{-7}) |

The perturbed mean radii reach the opposite extrema around (t=73)–74. The coarse runs show the same first reversal time. Across all samples, the maximum difference between matched coarse and fine mean radii is 0.00443. The unperturbed mean-radius range shrinks from 0.00764 on the coarse grid to 0.00295 on the fine grid. That residual motion is a numerical control floor. The ±2% signal is substantially larger. Relative ADM drift is measured across all integration steps and excludes the distinct initial masses of different perturbations. Particle rest weight is constant by construction.

There is no evidence of bulk collapse or loss of the modeled shell over this interval. This is a finite-time response check for one equilibrium and one family of perturbations. Longer runs, independent convergence in time and phase-space resolution, other radial disturbances, and nonspherical dynamics remain untested. No propulsion or source for sustained counterrotation follows from the spherical result.

## Explore in the wind tunnel

Open **Shell experiments**. Select **Evolving Einstein–Vlasov shell**, choose compression, expansion or control, and scrub the time slider. The slice and radial profile use the finer snapshots. The time chart overlays both numerical resolutions. Dashed circles mark the sampled innermost and outermost particles.

The same view includes the **Static Einstein cluster** and **Localized rotational shift** from the earlier study. The rotational panel shows the prescribed shift and its signed equatorial momentum density. The latter changes sign across the wall, as required for compensating angular momentum. The static modes use the cluster family, which is distinct from the time-evolved Vlasov equilibrium.

## Reproduce

From the simulator checkout:

```bash
python3 -B research/export_vlasov_profile.py > /tmp/warp-vlasov-equilibrium.json
node research/evolve_vlasov.cjs /tmp/warp-vlasov-equilibrium.json /tmp/warp-vlasov-evolution.json
python3 -B research/export_research_data.py /tmp/warp-vlasov-evolution.json dist/research-data.js
```

The generated JavaScript holds the display data, so the viewer also runs offline. Playback renders precomputed frames rather than rerunning the particle integrator.
