# A matter-sourced relativistic shell with finite velocity dispersion

17 November 2026 · Numerical follow-up to [the source-first shell study](positive_energy_shell.md)

## What was solved

The earlier study prescribed a mass profile and used particles on circular orbits to explain its stresses. Here a nonnegative collisionless particle distribution determines the mass, metric, and pressure profiles together. The numerical solution has a flat vacuum cavity, a matter annulus with finite radial velocity dispersion, and a Schwarzschild exterior. Static Einstein–Vlasov shells are established results. The benchmark, parameter sweep, and radial dilation calculation below are new work for this project. [Rein, static shells](https://arxiv.org/abs/math-ph/9810014) · [Andréasson and Rein, steady-state families](https://arxiv.org/abs/gr-qc/0611053)

## Distribution and field equations

Set (G=c=1) and use unit particle rest mass. In the static metric (ds^2=-e^{2\mu}dt^2+(1-2m/r)^{-1}dr^2+r^2d\Omega^2), take

\[
f(E,L)=\max(1-E/E_0,0)\,\mathbf 1_{L>L_0},
\qquad E=e^\mu\sqrt{1+|p|^2},
\qquad L=r^2|p_\perp|^2.
\]

Here (p) is the momentum measured in the orthonormal frame and (L) is squared angular momentum. The distribution solves the static Vlasov equation because both arguments are conserved along the geodesics. It is a bounded distribution with a sharp angular-momentum cutoff. A smooth cutoff would define a different family.

With (y=\ln E_0-\mu), the integration starts at (a=\sqrt{L_0/(e^{2y_0}-1)}), where the angular momentum floor first permits particles. The coupled equations are (m'=4\pi r^2\rho) and (y'=-(m+4\pi r^3p_r)/[r(r-2m)]). For fixed momentum magnitude the permitted polar cosine lies in ([-z,z]), with (z=\sqrt{1-L_0/(r^2|p|^2)}). Angular moments are integrated analytically. The remaining quadrature uses (s=\sqrt{|p|^2-L_0/r^2}), which removes the square-root threshold. For example, the energy and radial pressure integrands are proportional to (s^2\sqrt{1+|p|^2}\,f) and (s^4 f/(3\sqrt{1+|p|^2})), respectively.

The outer boundary (b) is the numerically located zero of (y-\tfrac12\ln(1+L_0/r^2)) beyond the populated annulus. The exterior fixes (E_0=e^{y(b)}\sqrt{1-2M/b}). To exclude a second shell, the program checks the extrema of the lowest exterior energy squared, ((1-2M/r)(1+L_0/r^2)), and the limit at infinity. At the inner join, (m=0) and (\mu) is constant. At both joins, (ho,p_r,p_t) vanish. The matter satisfies (0\le p_r+2p_t\le\rho) because each particle is massive and its speed is below light speed. The resulting diagonal stress tensor satisfies the classical null, weak, strong, and dominant energy conditions.

## Benchmark and design tradeoff

The distribution amplitude is one in the fiducial units and the reference has (y_0=0.10, L_0=0.10).

| Observable | Fine numerical result |
| --- | ---: |
| Inner and outer areal radii | 0.672060679, 3.609598515 |
| ADM mass | 0.259564632 |
| Maximum (2m/r) | 0.18782968 |
| Cavity clock deficit relative to infinity | 15.95467% |
| Peak energy-weighted radial RMS speed | 0.139104 c |
| Maximum (p_r/\rho) | 0.01934995 |
| Binding fraction (1-M/M_{\rm rest}) | 2.82645% |

The maximum absolute anisotropic hydrostatic balance residual was (8.2\times10^{-12}) in the solver's geometric units on interior grid points above the density floor. Halving the radial step and doubling momentum quadrature twice changed the ADM mass by about (1.1\times10^{-7}). The pressure term accounted for an additional 0.232 percentage points of clock deficit when compared to evaluating the lapse with the same mass function and (p_r=0). This is a diagnostic at fixed (m(r)).

Scaling the midpoint radius to 10 m while preserving compactness gives an inner radius of 3.14 m, an outer radius of 16.86 m, and ADM mass **(1.63\times10^{27}) kg**. This is a geometric rescaling, with the density scale and angular-momentum cutoff rescaled as well. The result leaves the earlier engineering obstacle in place.

A cutoff sweep at fixed (y_0=0.10) and fixed dimensionless distribution amplitude gives the following tradeoff. The ratios change because the cutoff is varied relative to the length scale set by the amplitude.

| (L_0) | Cavity fraction (a/b) | Exterior compactness (2M/b) | Peak radial RMS speed / c |
| ---: | ---: | ---: | ---: |
| 0.1 | 0.186 | 0.144 | 0.139 |
| 1.6 | 0.438 | 0.249 | 0.112 |
| 6.4 | 0.570 | 0.302 | 0.098 |
| 25.6 | 0.684 | 0.346 | 0.083 |
| 102.4 | 0.775 | 0.381 | 0.070 |

Within this sampled family, a larger geometric cavity fraction comes with higher wall compactness and lower radial dispersion. A separate sequence with fixed microscopic parameters shows binding fraction rising from 0.98% at (y_0=0.03) to 3.92% at (y_0=0.22), then falling. This is a diagnostic for selecting equilibria to perturb. It does not establish the stability boundary for this family. [Numerical binding-energy criterion research](https://arxiv.org/abs/2009.08163)

## A particle-number-preserving radial perturbation

The canonical map (r\mapsto\lambda r, P_r\mapsto P_r/\lambda) preserves phase-space volume and (L). Transport the equilibrium distribution with this map while keeping it even in radial momentum. The radial current then vanishes and the initial extrinsic curvature can be zero. Solve the Hamiltonian constraint afresh on each dilated initial slice. The new physical radial momentum is the old value multiplied by (sqrt{A_{\rm new}/A_{\rm old}}/\lambda), with (A=1-2m/r). Transverse momentum scales as (1/\lambda). The Jacobian from the new momentum measure cancels the proper-volume factor in the particle number, so the rest mass is unchanged along this perturbation family.

The finite-difference curvature of ADM mass along the family is approximately **0.01021** in fiducial mass units. Compression and expansion both raised ADM mass at the three tested amplitudes. At ±1% the increase was about (5.1\times10^{-7}) in fiducial mass units. Replaying the equilibrium with the perturbation integrator and recomputing the result at a finer grid check error in the baseline and curvature.

This is a positive quadratic energy response in one phase-space direction. It leaves other radial modes, nonspherical modes, and time evolution to be tested. The next discriminating step is to evolve these constraint-satisfying initial data with a spherical Einstein–Vlasov integrator and measure the wall response. A separate axisymmetric solve is needed for the proposed counterrotation. [Energy–Casimir perturbation framework](https://arxiv.org/abs/1205.6198)

## Reproduce

Run from the simulator checkout:

```bash
python3 -B research/vlasov_shell.py
python3 -B research/vlasov_dilation.py
```

Both scripts use the Python standard library. The equilibrium program checks energy inequalities, vacuum matching, hydrostatic residual and numerical convergence. The dilation program constructs a new constrained geometry for each trial and checks particle-number replay and the sign of the ADM energy response.
