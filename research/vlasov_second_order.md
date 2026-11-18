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

Momentum refinement produced the larger change in all four observables. All four grid combinations preserved the signs. These differences measure sensitivity over the tested interval. All runs use the same static background step (0.002) and background momentum quadrature (64), and share the spherical projection and perturbative truncation.
 A direct finite-bias integration of the displaced energy cutoff independently reproduced the second-order density, radial pressure, and particle-rest-density source terms at a wall point within 0.005%. An independent four-dimensional curvature calculation checked the signs of the shift contributions to the energy density and radial stress.

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

## Reproduce and inspect

```bash
python3 -B research/vlasov_second_order.py dist/research-second-order.js
```

The script uses the Python standard library, runs the curvature and direct-quadrature checks, compares all four grid combinations, and regenerates the viewer data. In **Shell experiments**, select either second-order case, then view **Lapse-deficit change** or **Enclosed mass change**. Both cases share the scale for each field.
