"""Independent finite-difference Einstein tensor at sample points of the shell.

Checks the ADM energy and momentum formulas and one sufficient DEC inequality.
Only samples inside the perturbed matter band, away from coordinate poles.
"""
from math import exp, log1p, pi, sin, sqrt
from cluster_shell import B, M, INNER, OUTER, lapse_slope, mass, shape


def lapse(r, n=256):
    step = (B-r)/n
    integral = lapse_slope(r, M) + lapse_slope(B, M)
    for i in range(1, n):
        integral += (4 if i % 2 else 2)*lapse_slope(r+i*step, M)
    return exp(0.5*log1p(-2*M/B) - step*integral/3)


def metric(point, epsilon):
    r, theta = point[1:3]
    n = lapse(r)
    a = 1-2*mass(r, M)[0]/r
    omega = epsilon*shape(r)[0]
    s2 = (r*sin(theta))**2
    matrix = [[-n*n+s2*omega**2, 0, 0, s2*omega],
              [0, 1/a, 0, 0], [0, 0, r*r, 0], [s2*omega, 0, 0, s2]]
    inverse = [[-1/n**2, 0, 0, omega/n**2],
               [0, a, 0, 0], [0, 0, 1/r**2, 0],
               [omega/n**2, 0, 0, 1/s2-omega**2/n**2]]
    return matrix, inverse


def gradient(function, point, axis, h):
    high, low = list(point), list(point)
    high[axis] += h
    low[axis] -= h
    return function(high), function(low)


I = range(4)


def christoffel(point, epsilon, h):
    _, inverse = metric(point, epsilon)
    partial = [[[0.0]*4 for _ in I] for _ in I]
    for axis in (1, 2):
        high, low = gradient(lambda p: metric(p, epsilon)[0], point, axis, h)
        partial[axis] = [[(high[i][j]-low[i][j])/(2*h) for j in I] for i in I]
    return [[[0.5*sum(inverse[k][l]*(partial[i][l][j]+partial[j][l][i]-
                                    partial[l][i][j]) for l in I)
              for j in I] for i in I] for k in I]


def stress(r, theta, epsilon, h):
    point = (0, r, theta, 0)
    matrix, inverse = metric(point, epsilon)
    gamma = christoffel(point, epsilon, h)
    partial = [[[[0.0]*4 for _ in I] for _ in I] for _ in I]
    for axis in (1, 2):
        high, low = gradient(lambda p: christoffel(p, epsilon, h), point, axis, h)
        partial[axis] = [[[(high[k][i][j]-low[k][i][j])/(2*h) for j in I]
                          for i in I] for k in I]
    ricci = [[sum(partial[k][k][i][j]-partial[j][k][i][k] +
                  sum(gamma[k][k][l]*gamma[l][i][j] -
                      gamma[k][j][l]*gamma[l][i][k] for l in I)
                  for k in I) for j in I] for i in I]
    scalar = sum(inverse[i][j]*ricci[i][j] for i in I for j in I)
    tensor = [[(ricci[i][j]-0.5*scalar*matrix[i][j])/(8*pi) for j in I] for i in I]
    omega = epsilon*shape(r)[0]
    alpha = lapse(r)
    a = 1-2*mass(r, M)[0]/r
    frame = [[1/alpha, 0, 0, -omega/alpha], [0, sqrt(a), 0, 0],
             [0, 0, 1/r, 0], [0, 0, 0, 1/(r*sin(theta))]]
    return [[sum(frame[i][k]*tensor[k][l]*frame[j][l] for k in I for l in I)
             for j in I] for i in I]


def sweep(h, epsilon=1e-4):
    worst_error, margin = 0.0, float('inf')
    for i in range(25):
        r = INNER+(OUTER-INNER)*i/24
        m, dm = mass(r, M)
        a = 1-2*m/r
        ap = -2*dm/r+2*m/r**2
        n = lapse(r)
        _, domega, ddomega = shape(r)
        for theta in (pi/6, pi/3, pi/2):
            tensor = stress(r, theta, epsilon, h)
            density = tensor[0][0]
            j = sqrt(sum(tensor[0][k]**2 for k in (1, 2, 3)))
            # Frobenius norm bounds the spectral norm of the spatial stresses.
            s_bound = sqrt(sum(tensor[k][l]**2 for k in (1, 2, 3) for l in (1, 2, 3)))
            expected_density = dm/(4*pi*r*r) - (
                a*r*r*sin(theta)**2*(epsilon*domega)**2/(32*pi*n*n))
            expected_j = (epsilon*a*r*sin(theta)/(16*pi*n) *
                             (ddomega+(4/r+ap/(2*a)-lapse_slope(r, M))*domega))
            worst_error = max(worst_error, abs(expected_density-density), abs(expected_j+tensor[0][3]))
            margin = min(margin, 1-(2*j+s_bound)/density)
    return worst_error, margin


if __name__ == '__main__':
    # The spatial stresses are computed from
    # the full 4D metric independently of the ADM constraint formulas.
    for h in (4e-4, 2e-4, 1e-4):
        error, low_margin = sweep(h)
        print(f'h={h:g}: largest constraint discrepancy={error:.4g}, '
              f'minimum relative sufficient DEC margin={low_margin:.6f}')
    assert error < 1e-7 and low_margin > 0
