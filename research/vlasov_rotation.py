"""Solve the first-order stationary frame dragging of a counterrotating shell."""
from bisect import bisect_right
import json
from pathlib import Path
import sys
from math import exp, expm1, pi, sqrt

from vlasov_shell import C_LIGHT, L0, solve


def moments(r, y, cutoff, n):
    floor = L0/r**2
    available = expm1(2*y)-floor
    if available <= 0:
        return 0., 0., 0.
    ds = sqrt(available)/n
    emax = exp(y)
    plain = biased = response = 0.
    for i in range(1, n+1):
        s2 = (i*ds)**2
        p2 = floor+s2
        energy = sqrt(1+p2)
        weight = (1 if i == n else 4 if i % 2 else 2)*s2
        distribution = max(0, available-s2)/(emax*(emax+energy))
        response += weight*(p2-s2/3)
        if distribution:
            # Integrate over signed polar cosine. The integrand is even.
            for j in range(n+1):
                transverse = p2-s2*(j/n)**2
                L = r*r*transverse
                value = weight*distribution*sqrt(transverse)*(
                    1 if j in (0,n) else 4 if j % 2 else 2)/(3*n)
                plain += value
                biased += value*L/(L+3*L0)
    normalization = 2*pi*ds/3
    return (normalization*response*r/cutoff,
            normalization*plain, normalization*biased)


def experiment(steps, quadrature, *, background_step=.002, background_quad=64):
    ref = []
    shell = solve(.1, background_step, background_quad, record=lambda r, state: ref.append((r, state[0], state[1])))
    a,b,M = shell.a,shell.b,shell.mass
    E0 = exp(ref[-1][2])*sqrt(1-2*M/b)
    dr = (b-a)/steps
    radii = [row[0] for row in ref]
    nodes = []
    for i in range(2*steps+1):
        r = min(b,a+dr*i/2)
        j = min(len(ref)-2,bisect_right(radii,r)-1)
        left,right = ref[j],ref[j+1]
        u = (r-left[0])/(right[0]-left[0])
        m,y = (left[k]+u*(right[k]-left[k]) for k in (1,2))
        A = 1-2*m/r
        N = E0*exp(-y)
        chi,one,q = moments(r,y,E0,quadrature)
        nodes.append((r,A,N,chi,one,q))

    def rates(k, beta, flux, source):
        r,A,N,chi,one,q = nodes[k]
        return flux*N/(r**4*sqrt(A)), 16*pi*r**3*(chi*beta+source(one,q))/sqrt(A)

    def integrate(source):
        # Integrate backwards from zero exterior shift and angular momentum.
        beta = flux = 0.
        values = [(beta,flux)]
        h = -dr
        for k in range(2*steps, 0, -2):
            a1,a2 = rates(k,beta,flux,source)
            b1,b2 = rates(k-1,beta+h*a1/2,flux+h*a2/2,source)
            c1,c2 = rates(k-1,beta+h*b1/2,flux+h*b2/2,source)
            d1,d2 = rates(k-2,beta+h*c1,flux+h*c2,source)
            beta += h*(a1+2*b1+2*c1+d1)/6
            flux += h*(a2+2*b2+2*c2+d2)/6
            values.append((beta,flux))
        return list(reversed(values))

    one = integrate(lambda one,q:one)
    bias = integrate(lambda one,q:q)
    kappa = bias[0][1]/one[0][1]
    eta = .02
    rows = []
    for i,(p,q) in enumerate(zip(one,bias)):
        r,A,N,chi,s1,sq = nodes[2*i]
        beta = eta*(q[0]-kappa*p[0])
        flux = eta*(q[1]-kappa*p[1])
        current = chi*beta + eta*(sq-kappa*s1)
        rows.append((r,N,beta,flux,current))
    assert 0 < kappa < 1 and abs(rows[0][3]) < 1e-12
    assert rows[-1][2:4] == (0.,0.)
    currents = [row[4] for row in rows]
    assert min(currents)<0<max(currents)
    # Independent quadrature of J: d(flux)/dr equals 6 dJ/dr.
    contributions = [
        16*pi/6*(1 if i in (0,steps) else 4 if i%2 else 2) *
        row[0]**3*row[4]/sqrt(nodes[2*i][1])*dr/3 for i,row in enumerate(rows)
    ]
    angular_momentum = sum(contributions)
    positive_j = sum(x for x in contributions if x > 0)
    peak_index = max(range(len(rows)), key=lambda i: abs(rows[i][0]**2*rows[i][2]/rows[i][1]**2))
    r,N,beta,_,_ = rows[peak_index]
    scale = 10/((a+b)/2)
    delay = 4*pi*r*r*abs(beta)/N**2*scale/C_LIGHT
    return {"kappa":kappa,"eta":eta,"cavityBeta":rows[0][2],
            "integratedJ":angular_momentum,"positiveJ":positive_j,"peakDelay":delay,"delayRadius":r*scale,
            "rows":rows}


def export(path, result):
    rows = result["rows"]
    rmax = 7.
    bins = 350
    profile = []
    radii = [row[0] for row in rows]
    for i in range(bins):
        r = (i+.5)*rmax/bins
        if r <= radii[0]:
            lapse,beta,current = rows[0][1],rows[0][2],0.
        elif r >= radii[-1]:
            # Match the Schwarzschild lapse at the boundary.
            boundary_lapse = rows[-1][1]
            lapse,beta,current = sqrt(1-radii[-1]*(1-boundary_lapse**2)/r),0.,0.
        else:
            j=bisect_right(radii,r)-1
            a,b=rows[j],rows[j+1]
            u=(r-a[0])/(b[0]-a[0])
            lapse,beta,current=(a[k]+u*(b[k]-a[k]) for k in (1,2,4))
        profile.append([0.,lapse,0.,0.,beta,current])
    payload = {k:v for k,v in result.items() if k!="rows"}
    payload.update({"profile":profile,"bounds":[radii[0],radii[-1]]})
    Path(path).write_text("globalThis.WarpKineticRotation="+json.dumps(
        payload,separators=(",",":"),allow_nan=False)+";\n")


def main():
    coarse = experiment(400,24)
    fine = experiment(800,40)
    for model in (coarse,fine):
        print({key: value for key,value in model.items() if key != "rows"})
    assert abs(fine["integratedJ"]) < 1e-9
    assert abs(fine["cavityBeta"]/coarse["cavityBeta"]-1)<.002
    assert abs(fine["peakDelay"]/coarse["peakDelay"]-1)<.002
    if len(sys.argv)>1:
        export(sys.argv[1],fine)


if __name__ == '__main__':
    main()
