# Second-order spherical-average response of the counterrotating shell

18 November 2026

The [first-order calculation](vlasov_rotation.md) solves for the shift sourced by a collisionless particle distribution with zero exterior angular momentum at that order. This follow-up solves for the **spherical-average** changes to mass and lapse at second order in the signed bias amplitude `η`. It compares a family with a fixed central cutoff parameter to one with fixed total particle rest mass. Conventional slow-rotation theory separates second-order monopole and quadrupole sectors. Here the source uses collisionless particle moments. [Hartle, slow-rotation equations](https://the-center-of-gravity.com/documents/130/Hartle-Thorne_Slowly-Rotating-Relativistic-Stars-Part-I.pdf) · [Einstein–Vlasov rotation](https://arxiv.org/abs/1212.5028)

## Numerical results

For the same reference shell and bias amplitude `η = 0.02`, the changes relative to the static model are:

| Constraint along the family | ADM mass change (ℓ) | Particle rest mass change (ℓ) | Center clock deficit change |
| --- | ---: | ---: | ---: |
| Fixed central cutoff parameter | +1.76249 × 10⁻⁹ | +1.88531 × 10⁻⁹ | +8.86993 × 10⁻¹⁰ |
| Fixed total particle rest mass | +2.07881 × 10⁻¹⁰ | 0 by construction | −6.58067 × 10⁻⁹ |

The static center clock deficit is 0.159546729. A negative change means the center clock runs slightly faster than the corresponding static center clock, using distant time in both cases. At fixed particle rest mass the ADM mass rises by about eight parts in ten billion. Both changes refer to a perturbation of the existing high-mass shell.

We crossed 400 and 800 radial intervals with 24 and 40 momentum quadrature subdivisions. The table shows each change as a percentage of the magnitude of the 800 × 40 result. Each column varies one setting while holding the other at its finer value.

| Observable | Radial refinement, 400 → 800 | Momentum refinement, 24 → 40 |
| --- | ---: | ---: |
| ADM mass change, fixed central cutoff | 0.00134% | 0.01002% |
| Center clock deficit change, fixed central cutoff | 0.00005% | 0.00610% |
| ADM mass change, fixed particle rest mass | 0.00099% | 0.00935% |
| Center clock deficit change, fixed particle rest mass | 0.00150% | 0.01065% |

Momentum refinement produced the larger change in all four observables. All four grid combinations preserved the signs. These differences measure sensitivity over the tested interval. Those four runs use the same static background step (0.002) and background momentum quadrature (64).

### Static background sensitivity

Holding the first- and second-order grids at 800 radial intervals and 40 momentum subdivisions, we recomputed the equilibrium used by both calculations. Each column reports the absolute difference relative to the magnitude of the original correction. The original background uses radial step 0.002 and 64 momentum subdivisions.

| Observable | Halve radial step only | Double momentum subdivisions only | Refine both |
| --- | ---: | ---: | ---: |
| ADM mass change, fixed central cutoff | 0.00007196% | 0.00001581% | 0.00008777% |
| Center clock deficit change, fixed central cutoff | 0.00003840% | 0.00001874% | 0.00005714% |
| ADM mass change, fixed particle rest mass | 0.00028941% | 0.00014865% | 0.00043806% |
| Center clock deficit change, fixed particle rest mass | 0.00004184% | 0.00011258% | 0.00007074% |

Both clock corrections retain their signs throughout. For the fixed-rest-mass clock, the separate refinements shift the answer in opposite directions, which explains the smaller combined difference. The table measures sensitivity to discretization at this equilibrium. The spherical projection and truncation at second order are shared by every run; errors from those assumptions require separate physical calculations.
### Finite-bias matter check across the wall

We integrated the local distribution with its displaced energy cutoff at five interior radii. The wall fraction is $(r-a)/(b-a)$, where $a$ and $b$ are the static shell boundaries. At each radius we computed equatorial energy density, radial pressure and particle rest density at zero and opposite signed biases. Dividing the even difference by twice the squared bias estimates the equatorial quadratic coefficient. Multiplying by $2/3$ gives the predicted spherical-average coefficient for a quadratic source proportional to $\sin^2\theta$.

| Wall fraction | Maximum relative discrepancy at bias 0.02 | At bias 0.20 |
| --- | ---: | ---: |
| 5% | 0.000024% | 0.000022% |
| 25% | 0.000311% | 0.000286% |
| 50% | 0.000398% | 0.000371% |
| 75% | 0.000535% | 0.000551% |
| 95% | 0.004230% | 0.000030% |

Entries are rounded upward across the three moments at direct quadrature resolution 64. The script also runs resolution 32 and evaluates the predicted coefficients separately at 80 subdivisions. At 95% of the wall and bias 0.02, the density signal is only a few parts in a trillion of the background. Increasing quadrature resolution there does not consistently improve the relative difference: extracting the coefficient requires subtracting nearly equal moments. The larger test bias amplifies the signal.

Both tests hold the background and first-order shift profile fixed. They check the direct kinetic source in the interior of the wall. Neither the moving support boundaries nor a finite-bias solution of the coupled Einstein–Vlasov equations is determined by this comparison. The separate four-dimensional curvature check tests the signs of the geometric contributions.

## Projected equations

Use unit conventions $G=c=1$. Write $m=m_0+\eta^2m_2$, $y=y_0+\eta^2y_2$, and $\beta=\eta b(r)$, where $y=\log E_0-\log N$. Let $N_0$ be the static lapse and $A=1-2m_0/r$. The zeroth-order field and distribution are the [static Vlasov equilibrium](vlasov_equilibrium.md).

At a given point in phase space let $E_*=N_0\sqrt{1+|p|^2}$, $Q=L/(L+3L_0)-\kappa$, and let $L_z$ be axial angular momentum. At fixed background $y$, the even, order-$\eta^2$ coefficient from expanding the biased distribution is

$$
\frac{b Q L_z^2}{E_0\sqrt L}\,\mathbf 1_{E_*<E_0}
+ \frac{b^2 L_z^2}{2E_0}\,\delta(E_0-E_*) .
$$

The delta term is the displaced energy cutoff. Angular averaging gives $\langle L_z^2\rangle=L/3$. Integrating the projected coefficient against the local energy, radial pressure, and rest-density weights gives $\rho_{\rm rot}$, $p_{\rm rot}$, and $n_{\rm rot}$. The response of the background moments to $y_2$ is included through $\rho_y$, $p_y$, and $n_y$, obtained by differentiating the static cutoff distribution.

The shift changes the geometric energy density and radial pressure by $-q$ and $+q$ respectively in the spherical average, where $q=A r^2 b'^2/(48\pi N_0^2)$. The two projected radial Einstein equations give

$$
m'_2=4\pi r^2(\rho_y y_2+\rho_{\rm rot}+q),
$$

$$
y'_2=-\frac{m_2+4\pi r^3(p_y y_2+p_{\rm rot}-q)}{r^2 A}
-\frac{2m_2(\log N_0)'}{rA}.
$$

The inner vacuum has $m_2=0$. For fixed central $y$ use $y_2=0$ there. To hold total particle rest mass fixed, integrate the proper-volume rest density correction, including the perturbation of $A^{-1/2}$, then add the homogeneous response with the central $y_2$ chosen to cancel that integral. At the outer wall, match the spherical lapse to Schwarzschild and normalize at infinity. The exterior has a corrected mass monopole. These equations give a center clock correction and a radial profile of the spherically averaged lapse. Off-axis clocks held at fixed angular coordinates also have a shift-dependent proper-time term.

## Angular momentum and the unresolved exterior quadrupole

Reversing the bias and the azimuthal direction changes the sign of the shift and angular momentum. The mass, lapse and diagonal stress response are even. With the first-order cancellation imposed, angular momentum therefore vanishes through quadratic order in this expansion. An odd cubic contribution is allowed.

The direct quadratic density forcing contains a term proportional to $\sin^2\theta=(2/3)(1-P_2(\cos\theta))$. In this benchmark the peak magnitude of its angular-average coefficient is **3.19452 × 10⁻¹⁰ ℓ⁻²** at the stated bias. The exported peak includes the geometric term q and equals **3.19241 × 10⁻¹⁰ ℓ⁻²**. The nonspherical forcing is therefore nonzero. The exterior quadrupole depends on solving the coupled nonspherical metric and particle response, including the fact that squared total angular momentum need not remain conserved in the deformed geometry. This calculation does not determine the exterior quadrupole or demonstrate a finite-amplitude stationary solution.

### Orbit test of the angular cutoff

A quadrupolar field calculation must specify how it transports the matter distribution. We tested the existing sharp cutoff on a prescribed axisymmetric perturbation of the **static** Einstein–Vlasov equilibrium. The perturbation amplitude $\epsilon$ is independent of the counterrotation bias $\eta$. We retain the background spatial metric, set the shift to zero, and prescribe the lapse $N=N_0\exp[\epsilon h(r)P_2(\cos\theta)]$, with $h=\max(0,1-[(r-r_c)/(0.25\ell)]^2)^3$. The lapse stays positive and the perturbation is confined to the wall. This is a test metric for the transport equation; its stress tensor has not been matched to the particles.

Here $L=p_\theta^2+L_z^2/\sin^2\theta$ denotes **squared** total angular momentum per unit particle mass. The particle Hamiltonian is $H=N\sqrt{1+A p_r^2+L/r^2}$. Stationarity conserves $H$ and axial symmetry conserves $L_z$. The canonical bracket gives the exact torque $\dot L=-2p_\theta H\epsilon h\,\partial_\theta P_2$. It vanishes in the spherical control and on equatorial orbits, but generally acts on inclined particles.

We chose the circular background orbit directly on the cutoff $L=L_0=0.1\ell^2$, where the energy cutoff still permits occupation. Its radius is $r_c=1.443367069\ell$. Let $u$ be the unperturbed orbital phase, $\cos\theta=\sin i\sin u$, $u_0=\pi/4$, and $\Omega=N_0\sqrt{L_0}/(r_c^2\sqrt{1+L_0/r_c^2})$. Integrating the torque along that circular orbit predicts

$$
\Delta L^{(1)}=-2\epsilon\sqrt{L_0}\,\frac{H_0}{\Omega}
  [P_2(\cos\theta(u))-P_2(\cos\theta(u_0))].
$$

We also integrated the full test-particle Hamilton equations for one background period, allowing radial and polar motion. The table gives excursions from the initial cutoff for inclination 45° and the largest absolute difference from the first-order trajectory over the period. All three result columns have units of ℓ².

| Prescribed amplitude | Minimum change in L | Maximum change in L | Maximum first-order trajectory error |
| ---: | ---: | ---: | ---: |
| 0.00010 | −1.63742 × 10⁻⁴ | +1.63551 × 10⁻⁴ | 4.4413 × 10⁻⁶ |
| 0.00005 | −8.18738 × 10⁻⁵ | +8.18251 × 10⁻⁵ | 1.1125 × 10⁻⁶ |

Halving the amplitude reduced the trajectory discrepancy by a factor of 3.99, consistent with a first-order prediction. At the smaller amplitude, doubling the RK4 steps from 800 to 1,600 changed the extrema by at most $1.56\times10^{-9}\ell^2$. Relative Hamiltonian drift stayed below $7\times10^{-13}$ in the 800-step runs.

The same characteristic spends finite intervals on both sides of $L_0$. Applying the old indicator $\mathbf1_{L>L_0}$ at each point would switch the distribution between zero and a positive value along that trajectory, contrary to collisionless transport. This identifies a concrete missing term for the proposed quadrupole calculation: the response of the angular cutoff itself. A first-order return of $L$ after one circular period does not restore pointwise stationarity. The test supplies a regression for a future transport solver; it determines neither a self-consistent exterior quadrupole nor a general third integral of motion. [Related axisymmetric Einstein–Vlasov existence study](https://arxiv.org/abs/1212.5028)

Run `python3 -B research/vlasov_quadrupole_orbit.py` to reproduce both perturbations, the equatorial and spherical controls, and the time-step comparison.

### Carrying the cutoff along eccentric orbits

For a finite-time collisionless initial-value test, label each characteristic by the value of $L$ at launch. To recover that label from a perturbed orbit at time $t$, integrate the first-order torque on a **separate spherical orbit** with the same launch position and momentum. With $z_0(t)$ the spherical trajectory, the transported estimate is

$$
L_{\rm tag}(t)=L(t)-\epsilon\int_0^t 6p_\theta H_0 h(r)\cos\theta\sin\theta\big|_{z_0(t')}\,dt'.
$$

Using the spherical trajectory in the integral is essential to the test. Integrating the exact torque on the perturbed orbit would simply undo its measured change. Here the omitted path response gives an expected error of order $\epsilon^2$ over fixed times.

We launched two inclined trajectories from the circular reference radius with outward canonical momentum $p_r=0.025$, inclination 45°, and $L-L_0=\pm 0.00003\ell^2$. Each stayed below the energy cutoff. One was initially occupied and the other empty. Counts are mismatched labels at 801 equally spaced times over one reference circular period, including launch; they count samples, not distinct crossings.

| Initial label | Perturbation | Mismatches with instantaneous L | Mismatches with transported label | Largest transported-label error (ℓ²) |
| --- | ---: | ---: | ---: | ---: |
| Empty | 0.00010 | 284 | 0 | 2.466 × 10⁻⁶ |
| Occupied | 0.00010 | 392 | 0 | 2.463 × 10⁻⁶ |
| Empty | 0.00005 | 219 | 0 | 6.190 × 10⁻⁷ |
| Occupied | 0.00005 | 334 | 0 | 6.183 × 10⁻⁷ |

The corrected label preserves the initial occupation at every sampled time for both particles. Halving the perturbation reduces the largest label error by about fourfold. Points closer to the cutoff than the label error can still be misclassified. This trajectory-dependent construction supplies a finite-time transport benchmark for prescribed initial data; constructing a stationary distribution requires consistency across phases, orbit families and repeated passages.

## Reproduce and inspect

```bash
python3 -B research/vlasov_second_order.py dist/research-second-order.js
```

The script uses the Python standard library, runs the curvature and direct-quadrature checks, compares all four grid combinations, and regenerates the viewer data. In **Shell experiments**, select either second-order case, then view **Lapse-deficit change** or **Enclosed mass change**. Both cases share the scale for each field.
