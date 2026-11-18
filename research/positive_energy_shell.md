# Source-first warp-shell study

17 November 2026 · Exploratory calculations in classical general relativity

## Results

The simulator's ultrastatic shell has a flat cavity and a positive mass profile. Holding the lapse fixed forces radial tension even outside its matter wall. Replacing that lapse with the one sourced by an **Einstein cluster** gives a flat cavity, a vacuum Schwarzschild exterior, and a shell that satisfies the classical null, weak, dominant, and strong energy conditions. The Einstein-cluster solution itself is established research. This study applies it to the simulator's smooth shell profile, derives a clock-rate cost bound, and tests a localized rotational shift against the Einstein equations. Priority for these applications has not been established. [Böhmer and Harko, Einstein clusters](https://arxiv.org/abs/0705.1756)

For a shell extending from 0.8 to 1.2 times its midpoint radius and with dimensionless mass 0.1, the cavity clock runs **10.5209% slower** than a distant clock. Its ADM mass at a midpoint radius of 10 m is **1.3466 × 10²⁷ kg**. A compact rotational shift preserves the cavity and exterior and produces a calculated difference in counterpropagating guided-light travel times. Neither effect transports the cavity.

## Static benchmark

Use G = c = 1 and the static spherical line element

\[
ds^2=-N(r)^2dt^2 + \frac{dr^2}{A(r)}+r^2d\Omega^2,
\qquad A(r)=1-\frac{2m(r)}r,\qquad \Phi=\ln N.
\]

Write a and b for the inner and outer wall radii. Set m = 0 in the cavity, m = M outside the wall, and m = M(10q³ − 15q⁴ + 6q⁵) in the wall with q = (r − a)/(b − a). The resulting m is twice continuously differentiable and m′ ≥ 0. M is the exterior ADM mass in geometric units.

The spherical Einstein equations give ρ = m′/(4πr²) and 4πr³pᵣ = r(r − 2m)Φ′ − m. Setting Φ′ = 0 would force pᵣ = −m/(4πr³), including in the nominal exterior. Instead, prescribe **pᵣ = 0** and integrate inward from the Schwarzschild value N(b) = √(1 − 2M/b). The radial equation and stress conservation then give

\[
\Phi'=\frac{m}{r(r-2m)},\qquad
p_t=\frac{\rho r\Phi'}{2},\qquad
v_{\rm orbit}^2=r\Phi'=\frac{m}{r-2m}.
\]

The lapse is constant inside a, so the cavity is flat after a constant time rescaling. The shell and exterior join without a surface stress layer. A sufficient compactness condition, 2m(r)/r < 1/3, gives timelike circular particle orbits and 0 ≤ pₜ < ρ/8 wherever ρ is positive. All four classical energy conditions follow from these diagonal stress inequalities. Mass density and both pressures vanish in the exterior.

In the fixed static metric, circular geodesics have squared specific angular momentum L² = mr²/(r − 3m). Its derivative has numerator r³m′ + mr(r − 6m) and a positive denominator. This is positive wherever m > 0 under the same compactness condition and gives local radial test-orbit stability. The criterion does not test collective perturbations of the particle distribution. An idealized kinetic source is a collisionless ensemble on circular orbits with uniformly distributed orbital planes and phases. Averaging the two tangent directions gives pₜ/ρ = v²/2. [Einstein-cluster stress and particle interpretation](https://arxiv.org/abs/0705.1756)

### Clock-rate cost and travel time

At fixed a, b and M, the wall integral of m/[r(r − 2m)] increases when cumulative mass is moved inward. Bounding that integral using 0 ≤ m ≤ M gives

\[
\sqrt{1-2M/a}\;\le N(a)\le\sqrt{1-2M/b}
\quad\text{for }a>2M.
\]

Thus a target fractional clock deficit δ requires an ADM mass of at least (a c²/2G)(2δ − δ²) in SI units. For a = 8 m, even a **1%** deficit requires at least **1.07 × 10²⁶ kg** for this class. A 1,000 kg shell with a = 8 m and b = 12 m gives a deficit of **7.47 × 10⁻²⁶**, or **6.45 × 10⁻²¹ s per day**, relative to infinity. These numbers apply to the model and do not assume practical clock sensitivity.

The static metric also obeys N ≤ 1, A ≤ 1. For any future-directed causal trajectory, dt is at least the Euclidean spatial line element formed from the same areal Cartesian coordinates. Between two fixed points in those coordinates, the travel time measured by the asymptotic time coordinate is therefore at least their Euclidean separation in units with c = 1. A slow cavity clock does not yield a shortcut for a distant observer.

## Hypothesis and test for a controllable shift

A localized shift should be easier to source **inside the dense part of an existing shell**, where the background stress tensor has a strict dominant-energy margin. Use an axisymmetric, stationary azimuthal shift \(\beta^\phi=\epsilon\Omega(r)\) in the metric (d\phi+\beta^\phi dt), keeping A and N fixed. Choose Ω supported strictly within the matter band, with smooth matching to zero. The numerical example takes R = (a + b)/2 = 1, uses Ω = [4x(1 − x)]⁴/R for 0 < x < 1, and sets x = (r/R − 0.9)/0.2. Elsewhere Ω = 0.

This changes the metric only where the static density is strictly positive. For sufficiently small |ε|, the full stress tensor defined by the Einstein tensor retains the dominant energy condition. The argument is continuity on the compact support, where the unperturbed strict margin has a positive minimum. The entire unchanged exterior and cavity are vacuum. This is a geometric existence statement. It does not give a numerical global amplitude guarantee or prove that a specific matter system generates the perturbed stress tensor. The exact Schwarzschild exterior also fixes the net ADM angular momentum to zero.

### Constraint budget and independent tensor check

In the 3+1 convention (ds^2=-N^2dt^2+\gamma_{ij}(dx^i+\beta^i dt)(dx^j+\beta^jdt)), the shift gives K = 0 and (K_{r\phi}=r^2\sin^2\theta\,\epsilon\Omega'/(2N)). The Hamiltonian and momentum constraints give

\[
\rho_E=\frac{m'}{4\pi r^2}-
\frac{\epsilon^2 A r^2\sin^2\theta\,\Omega'^2}{32\pi N^2},
\qquad
j_{\hat\phi}=\frac{\epsilon\sqrt{A}\sin\theta}{16\pi r^3}
\frac{d}{dr}\left(\frac{r^4\sqrt{A}}{N}\Omega'\right).
\]

The signed angular momentum density integrated against the axial Killing vector and proper volume gives zero, as the radial derivative integrates to vanishing boundary terms. The source must supply compensating angular momentum within the wall. The condition ρ_E ≥ |j| for the Eulerian observer gives a **necessary** amplitude ceiling. Its tightest angular value is at the equator. A radial grid search gives `|ε| ≈ 0.00231825` at r/R ≈ 1.00319 for this profile. This ceiling applies to the prescribed profile and cannot certify the full dominant energy condition. [Gourgoulhon, 3+1 constraint equations](https://arxiv.org/abs/gr-qc/0703035)

An independent four-dimensional finite-difference Einstein tensor calculation at ε = 0.0001 reproduces the constraint energy and momentum to within **1.29 × 10⁻⁸** in geometric density units at the tested step size. For a stress tensor with Eulerian density ρ_E, spatial momentum j and stress matrix S, a sufficient all-observer DEC criterion is ρ_E ≥ 2|j| + ‖S‖. The spatial energy flux magnitude is bounded by |j| + ‖S‖ for any observer velocity of magnitude at most one, while its temporal component is at least ρ_E − |j|, after removal of the common Lorentz factor. Using the Frobenius norm as an upper bound, the minimum relative slack on 75 sample points was **0.86261**. The sampled check supports the small-shift calculation and does not certify the grid gaps.

For light guided in both directions on a fixed equatorial circle, the difference in asymptotic-coordinate round-trip times is

\[
\left|\Delta t\right| =
\frac{4\pi r^2 |\epsilon\Omega(r)|}{N(r)^2-r^2\epsilon^2\Omega(r)^2}.
\]

This follows from the two tangential null roots. The guide and observer are at fixed coordinates and the denominator is positive in the example. At r = R = 10 m and ε = 10⁻⁴, the predicted difference is **5.20 × 10⁻¹¹ s** in asymptotic time. A clock on the guide multiplies this by its local stationary lapse √(N² − r²β²). The example uses the same enormous mass listed above. The signal is a stationary frame-dragging observable involving the wall, rather than a change in the light crossing time of the flat cavity.

| Radial intervals | Cavity clock deficit | Necessary shift ceiling |
| ---: | ---: | ---: |
| 400 | 0.105208650 | 0.0023183334 |
| 1,600 | 0.105208650 | 0.0023182475 |
| 6,400 | 0.105208650 | 0.0023182458 |

## From prescribed geometry to a constructible source

1. **Static source.** Populate the cavity's surrounding annulus with a collisionless orbit distribution and solve for its self-gravity. The circular-orbit ensemble is the ideal limit. A realistic finite radial velocity dispersion changes pᵣ and the lapse. Solve the Einstein–Vlasov system with a nonnegative distribution, verify the two vacuum joins, and measure growth rates under perturbation. Spherical static Einstein–Vlasov equilibria with finite extent are established. Existence and stability for the specific broadened profile must be tested. [Rein, static Einstein–Vlasov solutions](https://arxiv.org/abs/gr-qc/9304028)
2. **Controllable rotation.** In a stationary, axisymmetric numerical source model, use a distribution over conserved quantities such as E and Lᶻ. An odd imbalance in Lᶻ can generate an azimuthal current at first order, while even moments respond at higher order in the imbalance. Test whether counterrotating portions of the distribution can support a nonzero wall shift with zero net angular momentum. Allow the computed lapse and spatial metric to respond, rather than constraining them to the kinematic ansatz. Reject the hypothesis for a tested family if the required source has no nonnegative distribution or the equilibrium is unstable. The predicted guided-light delay and static clock ratio provide benchmark observables.
3. **Transport.** Translating this cavity would require a time-dependent solution and momentum balance, including a source of thrust. Subluminal shell constructions provide comparison cases. Fuchs et al. report compliance for a prescribed moving shell, while Le reports in versions 1 and 2 of a preprint violations in an outer smoothing tail of a tested construction. A radiative-steering preprint studies a distinct, radiating thin-shell system. Neither comparison supplies the matter dynamics of the thick cluster studied here. Generic unit-lapse, flat-slice warp proposals also face a separate null-energy obstruction. [Fuchs et al.](https://arxiv.org/abs/2405.02709) · [Boundary-cost preprint](https://arxiv.org/abs/2605.25417v2) · [Radiative steering preprint](https://arxiv.org/abs/2606.22531) · [Generic warp-drive NEC analysis](https://arxiv.org/abs/2105.03079)

The mass bound gives a reason to prioritize weak-field benchmarks and computational source models over a vehicle-scale experiment. A weak-field laboratory comparison would need to distinguish gravitational rotation effects from mechanical Sagnac and ordinary optical-path changes. No strong-field assembly, collective stability, steering mechanism, or superluminal transport is demonstrated here.

## Reproduce

From the simulator checkout, run:

```bash
python3 research/cluster_shell.py
python3 research/check_stress.py
```

Both scripts use the Python standard library. The first integrates the lapse and checks the analytic bound, test-orbit condition, compactness, and grid convergence. The second computes the four-dimensional Einstein tensor at sampled points and compares constraint projections against the analytic expressions.
