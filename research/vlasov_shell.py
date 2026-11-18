"""Static spherical Einstein–Vlasov shell with k=1 and l=0.

Lengths use a fiducial unit and G=c=1. No mass or metric profile is prescribed.
The distribution has unit normalization and a fixed squared-angular-momentum
cutoff. Integrate from the analytically determined inner vacuum boundary.
"""
from dataclasses import dataclass
from math import exp, expm1, log, log1p, pi, sqrt

L0 = 0.1
C_LIGHT = 299792458
G = 6.67430e-11


def moments(r, y, l0, quadrature):
    """Energy density, radial pressure, one tangential pressure, rest density."""
    tangential_floor = l0/r**2
    available = expm1(2*y)-tangential_floor
    if available <= 0:
        return 0.0, 0.0, 0.0, 0.0
    emax = exp(y)
    ds = sqrt(available)/quadrature
    integrals = [0.0]*4
    # s² = |p|² - L0/r². Angular integration is analytic.
    for i in range(1, quadrature):
        s2 = (i*ds)**2
        p2 = s2+tangential_floor
        energy = sqrt(1+p2)
        weight = ((4 if i % 2 else 2)*s2*(available-s2) /
                  (emax*(emax+energy)))
        integrals[0] += weight*energy
        integrals[1] += weight*s2/(3*energy)
        integrals[2] += weight*(p2-s2/3)/(2*energy)
        integrals[3] += weight
    return tuple(4*pi*ds*x/3 for x in integrals)


def slope(r, state, l0, quadrature):
    m, y, _, _ = state
    a = 1-2*m/r
    if a <= 0:
        raise ValueError('The integration reached a trapped radius.')
    rho, pr, _, rest = moments(r, y, l0, quadrature)
    area = 4*pi*r*r
    return (area*rho, -(m+area*r*pr)/(r*r*a), area*rest/sqrt(a), area*pr/(r*a))


def advance(r, state, h, l0, quadrature):
    def shifted(derivative, scale):
        return [value+scale*h*rate for value, rate in zip(state, derivative)]

    k1 = slope(r, state, l0, quadrature)
    k2 = slope(r+h/2, shifted(k1, .5), l0, quadrature)
    k3 = slope(r+h/2, shifted(k2, .5), l0, quadrature)
    k4 = slope(r+h, shifted(k3, 1), l0, quadrature)
    return [value+h*(a+2*b+2*c+d)/6 for value, a, b, c, d in zip(state,k1,k2,k3,k4)]


def gap(r, y, l0):
    return y-.5*log1p(l0/r**2)


def outside_is_vacuum(b, m, l0, cutoff):
    # Evaluate every possible exterior minimum of the lowest permitted
    # particle energy at fixed r, including the infinity limit.
    candidates = [1.0, (1-2*m/b)*(1+l0/b**2)]
    discriminant = l0*l0-12*m*m*l0
    if discriminant >= 0:
        r = (l0+sqrt(discriminant))/(2*m)
        if r > b:
            candidates.append((1-2*m/r)*(1+l0/r**2))
    return cutoff < 1 and min(candidates) >= cutoff**2-1e-12


@dataclass
class Shell:
    a: float
    b: float
    mass: float
    rest_mass: float
    clock_deficit: float
    pressure_clock_shift: float
    peak_compactness: float
    peak_pr_ratio: float
    peak_radial_rms: float
    max_stress_residual: float

    @property
    def binding_fraction(self):
        return 1-self.mass/self.rest_mass


def solve(y0, h, quadrature, l0=L0, record=None):
    if y0 <= 0 or h <= 0 or quadrature < 4 or quadrature % 2 or l0 <= 0:
        raise ValueError('Require positive y0, step, L0 and an even quadrature size ≥ 4.')
    a = sqrt(l0/expm1(2*y0))
    r = a
    state = [0.0, y0, 0.0, 0.0]
    if record is not None:
        record(r, state)
    max_comp = max_pr = max_radial_rms = max_residual = 0.0
    while r < a+100:
        h_step = h
        result = advance(r, state, h_step, l0, quadrature)
        closed = gap(r+h_step,result[1],l0) <= 0 and state[0] > 0
        if closed:
            low, high = 0.0, h_step
            for _ in range(39):
                mid = (low+high)/2
                candidate = advance(r,state,mid,l0,quadrature)
                if gap(r+mid,candidate[1],l0)>0:
                    low=mid
                else:
                    high=mid
            h_step=(low+high)/2
            result=advance(r,state,h_step,l0,quadrature)
        r += h_step
        state = result
        if record is not None:
            record(r, state)
        m, y, rest, pressure_integral = state
        rho, pr, pt, _ = moments(r,y,l0,quadrature)
        max_comp = max(max_comp,2*m/r)
        assert 0 <= pr and 0 <= pt and pr+2*pt <= rho+1e-12
        if rho > 1e-10:
            max_pr = max(max_pr,pr/rho)
            max_radial_rms = max(max_radial_rms,sqrt(pr/rho))
        if rho > 1e-6 and not closed:
            # Differentiate the pressure along the ODE at fixed r. The
            # conservation law independently probes the angular moments.
            eps=1e-5
            yp=slope(r,state,l0,quadrature)[1]
            pr_high=moments(r+eps,y+eps*yp,l0,quadrature)[1]
            pr_low=moments(r-eps,y-eps*yp,l0,quadrature)[1]
            residual=(pr_high-pr_low)/(2*eps)-(rho+pr)*yp+2*(pr-pt)/r
            max_residual=max(max_residual,abs(residual))
        if closed:
            cutoff=exp(y)*sqrt(1-2*m/r)
            if not outside_is_vacuum(r,m,l0,cutoff):
                raise ValueError('This first gap does not establish a globally vacuum exterior.')
            log_lapse=log(cutoff)-y0
            return Shell(a,r,m,rest,-expm1(log_lapse),
                         exp(log_lapse)*expm1(pressure_integral),
                         max_comp,max_pr,max_radial_rms,max_residual)
    raise ValueError('The shell did not close in the search interval.')


def main():
    for h, q in ((.004,32),(.002,64),(.001,128)):
        shell=solve(.1,h,q)
        print(f'h={h:g}, q={q:3d}: a={shell.a:.9f}, b={shell.b:.9f}, '
              f'M={shell.mass:.9f}, binding={shell.binding_fraction:.9f}, '
              f'clock deficit={shell.clock_deficit:.9f}, TOV residual={shell.max_stress_residual:.3g}')
    print(f'peak 2m/r={shell.peak_compactness:.8f}, '
          f'peak radial RMS v/c={shell.peak_radial_rms:.8f}, '
          f'peak p_r/rho={shell.peak_pr_ratio:.8f}, '
          f'pressure-only clock deficit increase={shell.pressure_clock_shift:.8f}')
    # Independent physical-momentum quadrature / DOP853 review fixture.
    reference = {'b': 3.60959851012, 'mass': .259564631377,
                 'rest_mass': .267114482165, 'clock_deficit': .159546728189}
    for quantity, expected in reference.items():
        actual = getattr(shell, quantity)
        assert abs(actual-expected) < 2e-8, (quantity, actual, expected)
    coarse=solve(.1,.004,32)
    assert abs(shell.mass-coarse.mass)<2e-6
    assert abs(shell.b-coarse.b)<2e-6
    assert shell.max_stress_residual<1e-6
    assert shell.peak_radial_rms>0
    scale=10/(.5*(shell.a+shell.b))
    print(f'At 10 m midpoint: ADM mass={shell.mass*scale*C_LIGHT**2/G:.6g} kg, '
          f'inner radius={shell.a*scale:.6g} m, outer radius={shell.b*scale:.6g} m')
    print('Fixed microscopic L0 sequence (binding fraction is a diagnostic):')
    for y0 in (.03,.06,.1,.15,.22,.32,.45):
        model=solve(y0,.004,32)
        print(f'y0={y0:.2f} binding={model.binding_fraction:+.7f} '
              f'peak 2m/r={model.peak_compactness:.6f} clock deficit={model.clock_deficit:.6f}')
    print('Angular-momentum cutoff sweep at y0=0.1:')
    for angular_cutoff in (.1, .4, 1.6, 6.4, 25.6, 102.4):
        model=solve(.1,.008,24,l0=angular_cutoff)
        print(f'L0={angular_cutoff:g} a/b={model.a/model.b:.6f} '
              f'2M/b={2*model.mass/model.b:.6f} '
              f'clock deficit={model.clock_deficit:.6f} '
              f'peak radial RMS v/c={model.peak_radial_rms:.6f}')


if __name__ == '__main__':
    main()
