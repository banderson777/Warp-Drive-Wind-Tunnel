# Independent Alcubierre and Natário benchmarks

The wind tunnel's Eulerian energy density and expansion were compared point by point with Warpax 1.6.1, using double-precision JAX on CPU. Both programs evaluated the same metrics at (t=0,z=0), with speed 0.65 c, radius 2.1 ℓ, and wall scale 0.37 ℓ. [Alcubierre metric](https://arxiv.org/abs/gr-qc/0009013) · [Natário metric](https://arxiv.org/abs/gr-qc/0110086) · [Warpax and observer-dependent stress tests](https://arxiv.org/abs/2602.18023)

## Results

The grids include both endpoints of the square (x,y\in[-3.5,3.5]) ℓ. The 49 × 49 mesh halves the coordinate spacing of the 25 × 25 mesh. Differences are absolute and use geometric units.

| Model | Grid | Maximum density difference (ℓ⁻²) | RMS density difference (ℓ⁻²) | Maximum expansion difference (ℓ⁻¹) | Warpax sampled minimum density (ℓ⁻²) |
| --- | ---: | ---: | ---: | ---: | ---: |
| Alcubierre | 25 × 25 | 1.82 × 10⁻¹⁷ | 2.43 × 10⁻¹⁸ | 1.11 × 10⁻¹⁵ | −0.00736806 |
| Alcubierre | 49 × 49 | 1.82 × 10⁻¹⁷ | 2.50 × 10⁻¹⁸ | 1.11 × 10⁻¹⁵ | −0.00736806 |
| Natário | 25 × 25 | 5.14 × 10⁻¹⁰ | 8.88 × 10⁻¹¹ | 2.22 × 10⁻¹⁶ | −0.04613272 |
| Natário | 49 × 49 | 7.67 × 10⁻¹⁰ | 1.01 × 10⁻¹⁰ | 2.22 × 10⁻¹⁶ | −0.05479485 |

The finer grid samples a deeper Natário wall minimum and slightly larger solver differences. Refining the grid adds positions while keeping the browser's derivative step fixed. On those same grids, halving the Natário finite-difference step separately reduces the maximum density differences to **1.28 × 10⁻¹⁰** and **1.92 × 10⁻¹⁰** ℓ⁻². The approximately fourfold reduction is consistent with the centered second-order derivative used by the wind tunnel. The Alcubierre density uses an analytic implementation.

## Coordinate and observer matching

Warpax uses its built-in Alcubierre metric in lab coordinates, with `sigma = 1 / wall scale` and the bubble center at the origin on the benchmark slice. The wind tunnel uses bubble-comoving coordinates. The two charts differ by a constant-speed spatial translation at fixed t, so their spatial positions match at t = 0 and they describe the same Eulerian normal. Both compare (T_{ab}n^an^b) and the volume expansion of the normal congruence.

The Natário benchmark constructs the wind tunnel's specific divergence-free profile by differentiating the vector potential (vf(r)(\mathbf e_x\times\mathbf r)/2) with JAX. It supplies the resulting metric to Warpax's full four-dimensional curvature chain. At the origin the radial profile uses its even Taylor expansion to avoid differentiating the radial norm through zero. The browser independently evaluates its spatial-gradient density formula. The pinned solver computes (T=G/(8\pi)) by automatic differentiation. The scalar expansion reference uses the divergence of the normal and the unit magnitude of the metric determinant.

The benchmark verifies the sampled density and expansion for these two settings against a separate solver. The reference CSVs additionally include the full stress tensor, for which this benchmark has no browser-side comparison. Photon accuracy, energy-condition certification, and dynamical realizability are outside this test.

## Download or reproduce

- [Alcubierre experiment](../dist/benchmarks/alcubierre.json) · [25 × 25 CSV](../dist/benchmarks/alcubierre-25.csv) · [49 × 49 CSV](../dist/benchmarks/alcubierre-49.csv)
- [Natário experiment](../dist/benchmarks/natario.json) · [25 × 25 CSV](../dist/benchmarks/natario-25.csv) · [49 × 49 CSV](../dist/benchmarks/natario-49.csv)
- [Machine-readable summary](../dist/benchmarks/summary.json)

Open the experiment JSON using **Experiment tools → Open experiment**. It restores the regular interactive viewport and ray settings. The benchmark CSVs use the separate grids defined above. Columns include both sampled results, signed differences (Wind Tunnel minus Warpax), the half-step density test, and the ten symmetric components of the reference stress tensor in the orthonormal frame `(Eulerian normal, x, y, z)`.

From the repository root, run `node verify.cjs` to replay the shipped reference samples. To regenerate the reference data, use Python 3.12+, Git, and Node.js. The tested combination was CPython 3.12.16, Warpax 1.6.1, and JAX/JAXlib 0.12.0.1. [Pinned Warpax source](https://github.com/anindex/warpax/tree/4b5349f2d6b29c1349458b30aaae6f605a7c01c2)

```sh
python3.12 -m venv .venv
. .venv/bin/activate
python -m pip install 'warpax @ git+https://github.com/anindex/warpax.git@4b5349f2d6b29c1349458b30aaae6f605a7c01c2' 'jax==0.12.0.1' 'jaxlib==0.12.0.1'
python -B research/benchmark_warpax.py --output /tmp/warpax-benchmark-results
```

Use an existing writable location in place of `/tmp` where needed. The generated CSVs and summary go to the selected output directory. Omitting `--output` regenerates the files under `dist/benchmarks/`. Floating-point roundoff can change the last digits across platforms.
