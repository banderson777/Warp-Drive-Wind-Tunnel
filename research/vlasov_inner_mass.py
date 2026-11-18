"""Particle rest mass inside the original cavity on the frozen rotating metric."""
from math import cos, pi, sin, sqrt

from vlasov_rotation import experiment
from vlasov_shell import L0


def cavity_integrals(model, eta, n, polar_min=0.):
    """Rest mass, its P2 moment and signed particle angular momentum."""
    a, lapse, reference_shift, _, _ = model["rows"][0]
    shift = reference_shift * eta / model["eta"]
    if shift == 0:
        return 0., 0., 0.
    floor = sqrt(L0)
    t0 = floor/a
    cap = sqrt(1+t0*t0)
    # Midpoints on [0,1]. Fold the spatial hemispheres, favorable momentum
    # half-plane and radial momentum signs separately.
    points = [(i+.5)/n for i in range(n)]
    total = 0.
    weighted = 0.
    angular_momentum = 0.
    span = pi/2-polar_min
    for polar in points:
        theta = polar_min+span*polar
        sine = sin(theta)
        ring = 0.
        for direction in points:
            projection = sine*cos(pi*direction/2)
            if shift < 0:
                projection = -projection
            tilt = shift*projection/lapse
            increment = tilt*floor
            change = increment*(2*cap+increment)
            root = sqrt(t0*t0+change)
            depth = a*change/(root*(root+t0))
            for position in points:
                inward = depth*position
                r = a-inward
                tmin = floor/r
                k = tilt*r
                # Radial momentum squared available at the tangential floor.
                gap = change-tmin*tmin*inward*(a+r)/(a*a)
                slope = tmin*(1-k*k)-cap*k
                assert gap > 0 and slope > 0 and k*k < 1
                width = gap/(slope+sqrt(slope*slope+(1-k*k)*gap))
                for transverse in points:
                    delta = width*transverse
                    t = tmin+delta
                    pmax2 = (width-delta)*(2*slope+(1-k*k)*(width+delta))
                    pmax = sqrt(pmax2)
                    L = (r*t)**2
                    bias = 1+eta*(L/(L+3*L0)-model["kappa"])*projection
                    specific_lz = r*t*projection
                    radial_sum = 0.
                    for radial in points:
                        energy = sqrt(1+t*t+pmax2*radial*radial)
                        # Rationalized 1-E/E0 at p_r = radial*pmax.
                        f = bias*pmax2*(1-radial**2)/(cap*(cap+k*t+energy))
                        radial_sum += f
                    cell = r*r*sine*depth*t*width*pmax*radial_sum
                    ring += cell
                    angular_momentum += specific_lz*cell
        total += ring
        weighted += ring*(3*cos(theta)**2-1)/2
    scale = 16*pi*(pi/2)*span/n**5
    return scale*total, scale*weighted, scale*angular_momentum


def cavity_moments(model, eta, n, polar_min=0.):
    return cavity_integrals(model, eta, n, polar_min)[:2]


def cavity_mass(model, eta, n):
    return cavity_moments(model, eta, n)[0]


def leading_belt_fraction():
    def angular_integral(lower):
        n = 4096
        step = (pi/2-lower)/n
        return step*sum(sin(lower+(i+.5)*step)**4.5 for i in range(n))
    return angular_integral(pi/3)/angular_integral(0.)


def leading_mass(model, eta):
    a, lapse, reference_shift, _, _ = model["rows"][0]
    t0 = sqrt(L0)/a
    cap = sqrt(1+t0*t0)
    H = 2*cap*abs(reference_shift*eta/model["eta"])*sqrt(L0)/lapse
    D = 2*t0*t0/a
    return 8*pi*a*a * (4/(105*cap*cap*D)) * (pi/9) * H**3.5


if __name__ == "__main__":
    model = experiment(800,40)
    assert cavity_mass(model,0.,8)==0.
    for eta in (.005,.01,.02):
        coarse = cavity_mass(model,eta,12)
        fine, weighted, spin = cavity_integrals(model,eta,20)
        expected_specific = 9*sqrt(L0)/11
        print(f"eta={eta}: matter J={spin:.10e} specific J={spin/fine:.10f}")
        assert abs(spin/fine/expected_specific-1)<.0003
        print(f"eta={eta}: normalized P2={weighted/fine:.9f}")
        assert abs(weighted/fine+7/26)<.0002
        leading = leading_mass(model,eta)
        print(f"eta={eta}: coarse={coarse:.9e} fine={fine:.9e} "
              f"leading={leading:.9e} fine/leading={fine/leading:.7f}",flush=True)
        assert abs(coarse/fine-1)<.006 and abs(fine/leading-1)<.006
    assert cavity_mass(model,-.02,12)==coarse
    positive = cavity_integrals(model,.02,12)
    negative = cavity_integrals(model,-.02,12)
    assert positive[:2]==negative[:2] and positive[2]==-negative[2]
    refined, weighted, refined_spin = cavity_integrals(model,.02,32)
    print(f"eta=.02 n=32: matter J={refined_spin:.10e} specific J={refined_spin/refined:.10f}")
    assert abs(spin/refined_spin-1)<.001
    print(f"eta=0.02 n=32: {refined:.10e}, change from n=20: {abs(fine/refined-1):.5%}")
    assert abs(fine/refined-1)<.001
    leading_belt = leading_belt_fraction()
    for n, mass in ((20,fine),(32,refined)):
        belt, _ = cavity_moments(model,.02,n,polar_min=pi/3)
        print(f"eta=.02 n={n}: equatorial belt fraction={belt/mass:.9f}, "
              f"leading={leading_belt:.9f}",flush=True)
        assert abs(belt/mass-leading_belt)<.0003
    print(f"eta=.02 n=32: normalized P2={weighted/refined:.9f}, leading={-7/26:.9f}")
    assert abs(weighted/refined+7/26)<.0002
