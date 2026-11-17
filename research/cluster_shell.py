"""Reproduce the static Einstein-cluster benchmark and screen an azimuthal shift.

Uses G = c = R = 1 internally. The momentum screen is a necessary dominant
energy condition, computed in the Eulerian frame, and does not test stresses.
"""
from math import exp, expm1, log1p, pi, sqrt

G = 6.67430e-11
C_LIGHT = 299792458
A, B = 0.8, 1.2
M = 0.1
INNER, OUTER = 0.9, 1.1


def mass(r, total):
    q = max(0.0, min(1.0, (r - A) / (B - A)))
    return total * q**3 * (10 - 15*q + 6*q*q), total * 30*q*q*(1-q)**2 / (B - A)


def lapse_slope(r, total):
    if r == 0:
        return 0.0
    m, _ = mass(r, total)
    return m / (r * (r - 2*m))


def shape(r):
    """Return Ω, Ω′, Ω″ for the normalized compactly supported rotation."""
    x = (r - INNER) / (OUTER - INNER)
    if not 0 < x < 1:
        return 0.0, 0.0, 0.0
    u = 4*x*(1-x)
    du = 4*(1-2*x)/(OUTER-INNER)
    ddu = -8/(OUTER-INNER)**2
    return u**4, 4*u**3*du, 12*u*u*du*du + 4*u**3*ddu


def screen(n, total=M):
    dr = (B - A) / n
    log_lapse = 0.5 * log1p(-2*total/B)
    max_compactness = max_speed = max_pressure_ratio = 0.0
    limit, limit_radius = float('inf'), None
    midpoint_lapse = None
    for i in range(n, -1, -1):
        r = A + i*dr
        alpha = exp(log_lapse)
        m, dm = mass(r, total)
        compactness = 2*m/r
        g = 1 - compactness
        slope = lapse_slope(r, total)
        rho = dm / (4*pi*r*r)
        speed_sq = r*slope
        max_compactness = max(max_compactness, compactness)
        max_speed = max(max_speed, sqrt(speed_sq))
        max_pressure_ratio = max(max_pressure_ratio, speed_sq/2)
        assert g > 0 and speed_sq < 1 and rho >= 0
        # d(L²)/dr > 0 for circular test geodesics of the fixed metric.
        assert m == 0 or r**3*dm + m*r*(r - 6*m) > 0
        omega, domega, ddomega = shape(r)
        if i == n//2:
            midpoint_lapse = alpha
        if omega:
            gp = -2*dm/r + 2*m/r**2
            momentum = abs(g*r/(16*pi*alpha) *
                           (ddomega + (4/r + gp/(2*g) - slope)*domega))
            density_cost = g*r*r*domega*domega/(32*pi*alpha**2)
            if momentum or density_cost:
                ceiling = 2*rho/(momentum + sqrt(momentum**2 + 4*density_cost*rho))
                if ceiling < limit:
                    limit, limit_radius = ceiling, r
        if i:
            # Integrate ln(N) inward using Simpson's rule on each interval.
            log_lapse -= dr/6*(slope + 4*lapse_slope(r-dr/2,total) +
                               lapse_slope(r-dr,total))
    assert 0.5*log1p(-2*total/A) <= log_lapse <= 0.5*log1p(-2*total/B)
    return (-expm1(log_lapse), max_compactness, max_speed,
            max_pressure_ratio, limit, limit_radius, midpoint_lapse)


def main():
    for n in (400, 1600, 6400):
        lag, comp, speed, pressure, ceiling, location, midpoint = screen(n)
        print(f'{n:4d} intervals: cavity clock deficit={lag:.9f}, '
              f'peak 2m/r={comp:.7f}, peak v/c={speed:.7f}, '
              f'peak p_t/rho (supremum)={pressure:.7f}, '
              f'shift ceiling={ceiling:.8g} at r/R={location:.6f}')
    assert abs(screen(400)[0] - screen(6400)[0]) < 1e-8
    assert abs(screen(400)[4] / screen(6400)[4] - 1) < 1e-3
    radius_si = 10.0
    rest_mass = M*radius_si*C_LIGHT**2/G
    small_mass = 1000.0
    lab_lag = screen(1600, G*small_mass/(radius_si*C_LIGHT**2))[0]
    epsilon = min(0.0001, ceiling/10)
    # Coordinate travel-time difference, for counterpropagating guided rays.
    delay = 4*pi*epsilon/(midpoint**2 - epsilon**2) * radius_si/C_LIGHT
    target = .01
    mass_floor = (1-(1-target)**2)*A*radius_si*C_LIGHT**2/(2*G)
    print(f'R=10 m: ADM mass={rest_mass:.6g} kg')
    print(f'R=10 m and M=1000 kg: clock deficit={lab_lag:.6g}, '
          f'lag per day={86400*lab_lag:.6g} s')
    print(f'Mass lower bound for a 1% clock deficit at a=8 m: {mass_floor:.6g} kg')
    print(f'Example shift={epsilon:.6g}: guided loop asymptotic delay={delay:.6g} s '
          '(observable of prescribed metric, not a matter-source verification)')


if __name__ == '__main__':
    main()
