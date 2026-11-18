# Matter-sourced counterrotation at first order

17 November 2026 · Stationary perturbation of the [Einstein–Vlasov shell](vlasov_equilibrium.md)

## Result

Two differently weighted populations of collisionless particles can source a nonzero azimuthal shift inside the shell while canceling the exterior angular momentum at first order. Unlike the [prescribed rotational shift](positive_energy_shell.md), the shift here is an output of the matter current and the Einstein momentum equation. The cancellation and guided-light delay below are results for this benchmark. They do not establish a nonlinear stationary solution. Axisymmetric stationary Einstein–Vlasov models are an established research area. [Andréasson, Kunze and Rein](https://arxiv.org/abs/1212.5028) · [Status and open problems](https://arxiv.org/abs/2310.00776)

## Distribution and coupled equation

Use geometric units and retain the spherical background lapse $N(r)$ and inverse radial spatial metric $A(r)=1-2m/r$ to first order. Add the axisymmetric shift $d\phi+\beta(r)dt$. In this ansatz the single-particle Hamiltonian is $E=N\sqrt{1+AP_r^2+L/r^2}-\beta L_z$. Here $P_r$ is canonical radial momentum, $L$ squared total angular momentum, and $L_z$ axial angular momentum. Since the Hamiltonian only depends on angular variables through $L,L_z$, which commute, both are conserved in this restricted geometry. A stationary nonnegative distribution is

$$
f(E,L,L_z)=\max(1-E/E_0,0)\,\mathbf 1_{L>L_0}
\left[1+\eta\left(\frac{L}{L+3L_0}-\kappa\right)\frac{L_z}{\sqrt L}\right].
$$

The factor in brackets is positive for the computed $|\eta|=0.02$ and $0<\kappa<1$. The bias changes sign as a function of $L$, while the odd $L_z$ factor selects the favored sense of rotation. Density and diagonal stress corrections from this odd perturbation vanish at first order. The response includes the change of particle energy in the shift; it cannot be estimated solely by adding the explicit bias to the static distribution.

At the equator, let $p_\phi$ denote the physical azimuthal momentum and $p_\perp$ the magnitude of tangential momentum. Write $q=L/(L+3L_0)$, and define the response and source coefficients by

$$
j_{\hat\phi}(r,\theta)=
\sin\theta\,[\chi(r)\beta(r)+\eta\{s_q(r)-\kappa s_1(r)\}],
\qquad
\chi=\frac{r}{E_0}\int_{\mathrm{support}}p_\phi^2\,d^3p,
\qquad
s_q=\int f_0 q\frac{p_\phi^2}{p_\perp}\,d^3p .
$$

Use the same integral with $q=1$ for $s_1$. The $\chi\beta$ term follows by expanding the energy cutoff. There is no boundary delta term in its first derivative because the unperturbed distribution vanishes at the energy cutoff. Polar momentum symmetry eliminates the other momentum components at this order.

Set $F=r^4\sqrt A\,\beta'/N$. The momentum equation is

$$
F'=\frac{16\pi r^3}{\sqrt A}[\chi\beta+\eta(s_q-\kappa s_1)],
\qquad \beta'=\frac{N F}{r^4\sqrt A}.
$$

The regular cavity has $F=0$ and constant $\beta$. In the vacuum exterior the nonrotating-at-infinity solution is $\beta=-2J/r^3$, with $F=6J$. Impose $\beta(b)=F(b)=0$ for a zero-angular-momentum exterior, integrate inward for each bias function, and select $\kappa$ so $F(a)=0$. This solves the sourced first-order boundary-value problem with exterior time and angle fixed at infinity. A spatially constant cavity shift is locally removable by rotating the angular coordinates. Its difference from the fixed exterior angular frame describes the dragging effect. [3+1 momentum constraint](https://arxiv.org/abs/gr-qc/0703035)

## Numerical checks

The static reference has $L_0=0.1$, $y_0=0.1$, and a midpoint radius of about 2.14083 in fiducial units. The 800-step result is:

| Quantity | Result |
| --- | ---: |
| Bias balance $\kappa$ | 0.4164354 |
| Cavity shift $\beta$ | $+8.10446\times10^{-6}$ per fiducial length |
| Integrated net $J$, independent moment quadrature | $6.65\times10^{-14}$ in fiducial length squared |
| Peak differential guided-light time, as seen at infinity | 2.2663 ps at 10 m midpoint radius |
| Guide radius at that peak | 5.5062 m |

The 400-step run gives cavity shift $8.10437\times10^{-6}$ and guided delay 2.26630 ps. Both grids contain positive and negative current regions. The exterior first-order angular momentum cancels by the boundary condition, and the independent integral of the signed current tests numerical consistency. The positive contribution to that integral is about 9.60 × 10⁻⁶ in fiducial length squared, so the fine-grid residual is about seven parts per billion of the positive contribution.

The guided-light result is the first-order difference $4\pi r^2|\beta|/N^2$ for counterpropagating beams on a stationary equatorial guide, expressed in asymptotic time. The 10 m scaling still requires roughly $1.63\times10^{27}$ kg of ADM mass at zeroth order. This is a stationary frame-dragging signal. Propulsion, stability, finite-amplitude assembly, and cancellation of higher-order exterior multipoles remain open. At second order the wall density, stresses, lapse, and spatial metric can change, so solving only the first-order shift cannot establish a finite-rotation solution.

## Where the inner kinetic support begins

Here we freeze the static cutoff $E_0$, the constant cavity lapse $N_c$ and the calculated first-order cavity shift $\beta_c$. For the static shell the squared-angular-momentum floor $L_0$ leaves an empty central region. The new calculation asks where the same distribution first permits particles when evaluated on that prescribed rotating geometry. Static shell support with a central vacuum is an established property of suitable Einstein–Vlasov distributions. [Rein, static shells](https://arxiv.org/abs/math-ph/9810014)

At radius $r$ and colatitude $\theta$, minimize the particle energy over its local momentum. Zero radial momentum minimizes the kinetic term. At fixed $u=\sqrt L$, purely azimuthal motion of the favorable sign gives the largest shift reduction, because $|L_z|\le u\sin\theta$. The resulting energy is

$$
E_{\min}(u)=N_c\sqrt{1+u^2/r^2}-|\beta_c|u\sin\theta.
$$

This function is convex in $u$. For the tested shifts its derivative at $u=\sqrt{L_0}$ is positive throughout the original cavity. Its infimum is therefore approached at that floor. Setting the infimum equal to $E_0$ gives the inner edge

$$
r_{\rm in}(\theta)=\frac{\sqrt{L_0}}{\sqrt{[(E_0+|\beta_c|\sqrt{L_0}\sin\theta)/N_c]^2-1}} .
$$

At the edge itself the allowed phase-space volume is zero. Immediately outside it, particles with $L>L_0$ can satisfy the strict energy cutoff. Reversing the bias exchanges the favorable sense of motion and leaves this edge unchanged. The leading edge displacement scales with the **absolute** bias; the support boundary and the integrated matter moments need not have the same expansion.

| Colatitude from the rotation axis | Inward displacement at bias 0.02 | At 10 m midpoint radius |
| --- | ---: | ---: |
| 0° | 0 | 0 |
| 30° | 0.000005115 ℓ | 23.89 µm |
| 90° | 0.000010230 ℓ | 47.78 µm |

The equatorial displacement agrees within 0.002% between the two rotation grids. The regression checks both signs of bias, the zero-shift and axial limits, and the original energy inequality on each side of the predicted edge. The micrometre values use the same high-mass geometric rescaling as the clock example. They describe an areal-coordinate displacement on a frozen metric. Once matter occupies part of the original cavity, its gravitational response and any deformation of the kinetic distribution must be solved together to determine a self-consistent boundary.

## Particle rest mass inside the original cavity

The boundary locates the first allowed orbits. To measure how populated those orbits are, integrate the distribution over the original cavity $r<a$ on the same frozen lapse and shift. For unit particle rest mass the slice integral is $\int f\,d^3p\,dV$, where momenta are measured in the orthonormal frame of the slice normal. The original cavity has flat spatial metric, so $dV=r^2\sin\theta\,dr\,d\theta\,d\phi$. This integral counts only the inner contribution; total shell particle number is not constrained in this frozen-distribution diagnostic.

### Why a small displacement admits very little mass

Write $x=a-r$, $t=|p_\perp|$, $t_0=\sqrt{L_0}/a$, $C=E_0/N_c$ and $D=2t_0^2/a$. Let $\psi$ be the momentum azimuth from the favorable azimuthal direction. To leading order in the signed bias the available squared radial momentum is

$$
g=H\sin\theta\cos\psi-Dx-2t_0(t-\sqrt{L_0}/r),\qquad
H=2C|\beta_c|\sqrt{L_0}/N_c .
$$

Only $g>0$ contributes. The radial layer thickness and tangential momentum width each scale as $|\eta|$. The radial momentum width scales as $|\eta|^{1/2}$, and the distribution vanishes linearly at the energy cutoff, supplying one more factor of $|\eta|$. Together they give an admitted rest mass proportional to **$|\eta|^{7/2}$**, even though the edge displacement is linear in $|\eta|$.

For a coefficient check, the leading cutoff factor is $(g-p_r^2)/(2C^2)$ for $|p_r|<\sqrt g$. Integrating it first in $p_r$, then in $t\,dt$ and $dx$, gives $4(H\sin\theta\cos\psi)^{7/2}/(105C^2D)$. After folding the two spatial hemispheres and favorable momentum directions, the remaining angular integral is $\int_0^{\pi/2}\sin^{9/2}\theta\,d\theta\int_0^{\pi/2}\cos^{7/2}\psi\,d\psi=\pi/9$. Thus the leading mass is $8\pi a^2[4/(105C^2D)](\pi/9)H^{7/2}$.

| Bias magnitude | Direct rest mass inside $r<a$ (ℓ, 20 bins per variable) | Leading prediction (ℓ) |
| ---: | ---: | ---: |
| 0.005 | 1.1630 × 10⁻²¹ | 1.1649 × 10⁻²¹ |
| 0.010 | 1.3149 × 10⁻²⁰ | 1.3180 × 10⁻²⁰ |
| 0.020 | 1.4856 × 10⁻¹⁹ | 1.4911 × 10⁻¹⁹ |

The direct midpoint quadrature uses the finite-bias energy cutoff and population weight, without expanding either. Each cell follows the actual allowed position and momentum intervals to resolve the thin layer. The regression compares against the analytic coefficient, repeats the integration at 12 and 20 bins per variable, and refines the reference bias to 32 bins. At bias 0.02 the 32-bin result is 1.48651 × 10⁻¹⁹ ℓ, a 0.0588% grid difference and about 5.57 × 10⁻¹⁹ of the reference shell’s particle rest mass. Zero bias yields zero mass; reversing the bias exchanges the populated sense of azimuthal motion. Run `python3 -B research/vlasov_inner_mass.py` to reproduce the table.

This calculation concerns phase-space occupancy in a prescribed stationary geometry. An actual flux across a moving boundary would require time evolution. The calculation supplies neither an ADM mass change nor the gravitational backreaction of the newly occupied layer.

## Reproduce and inspect

Run `python3 -B research/vlasov_rotation.py dist/research-rotation.js` to repeat both resolutions and regenerate the display data. In **Shell experiments**, select **Matter-sourced counterrotation**. Switch between the azimuthal shift and signed azimuthal momentum density to see how the two current regions source the field.
