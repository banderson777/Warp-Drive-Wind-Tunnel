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

## Reproduce and inspect

Run `python3 -B research/vlasov_rotation.py dist/research-rotation.js` to repeat both resolutions and regenerate the display data. In **Shell experiments**, select **Matter-sourced counterrotation**. Switch between the azimuthal shift and signed azimuthal momentum density to see how the two current regions source the field.
