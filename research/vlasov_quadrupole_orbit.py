"""Transport of the spherical kinetic cutoff in a prescribed quadrupolar lapse."""
from math import acos, cos, exp, pi, sin, sqrt

from vlasov_shell import L0, advance, slope, solve


def cutoff_orbit():
    rows = []
    shell = solve(.1, .002, 64, record=lambda r, s: rows.append((r, tuple(s))))
    def circular_L(r, s):
        speed2 = -r*slope(r,s,L0,64)[1]
        return r*r*speed2/(1-speed2)
    for (left, state), (right, end) in zip(rows,rows[1:]):
        if circular_L(left,state) <= L0 <= circular_L(right,end):
            lo,hi = left,right
            for _ in range(40):
                r = (lo+hi)/2
                s = advance(left,state,r-left,L0,64)
                if circular_L(r,s)<L0:
                    lo = r
                else:
                    hi = r
            cutoff = exp(rows[-1][1][1])*sqrt(1-2*shell.mass/shell.b)
            assert sqrt(1+L0/r**2)<exp(s[1])
            return r,s,cutoff
    raise ValueError("No circular orbit on the angular cutoff")


def integrate(orbit, epsilon, inclination, steps):
    radius, background, cutoff = orbit
    lapse = cutoff*exp(-background[1])
    gamma0 = sqrt(1+L0/radius**2)
    omega = lapse*sqrt(L0)/(radius**2*gamma0)
    u0 = pi/4
    theta = acos(sin(inclination)*sin(u0))
    ptheta = -sqrt(L0)*sin(inclination)*cos(u0)/sin(theta)
    lz = sqrt(L0)*cos(inclination)
    initial = (radius,theta,0.,ptheta,background[0],background[1])

    def evaluate(state):
        r,theta,pr,pt,m,y = state
        dm,dy,*_ = slope(r,(m,y,0.,0.),L0,64)
        A = 1-2*m/r
        Ap = 2*(m/r-dm)/r
        z,s = cos(theta),sin(theta)
        L = pt*pt+(lz/s)**2
        gamma = sqrt(1+A*pr*pr+L/r**2)
        x = (r-radius)/.25
        bump = max(0.,1-x*x)
        h,hp = bump**3,-24*x*bump**2
        P = (3*z*z-1)/2
        N = cutoff*exp(-y+epsilon*h*P)
        H = N*gamma
        dr = N*A*pr/gamma
        dt = N*pt/(gamma*r*r)
        dpr = H*(dy-epsilon*hp*P)-N*(Ap*pr**2-2*L/r**3)/(2*gamma)
        dpt = 3*H*epsilon*h*z*s+N*lz**2*z/(gamma*r*r*s**3)
        # Carry the static radial solution along the orbit by the chain rule.
        return (dr,dt,dpr,dpt,dm*dr,dy*dr),L,H

    state = initial
    H0 = evaluate(state)[2]
    dt = 2*pi/(omega*steps)
    error = drift = 0.
    changes = []
    for i in range(steps+1):
        k1,L,H = evaluate(state)
        delta = L-L0
        changes.append(delta)
        u = u0+2*pi*i/steps
        deltaP = 1.5*sin(inclination)**2*(sin(u)**2-sin(u0)**2)
        prediction = -2*epsilon*sqrt(L0)*lapse*gamma0*deltaP/omega
        error = max(error,abs(delta-prediction))
        drift = max(drift,abs(H/H0-1))
        if i==steps:
            break
        def shifted(k,scale):
            return tuple(v+scale*dt*d for v,d in zip(state,k))
        k2 = evaluate(shifted(k1,.5))[0]
        k3 = evaluate(shifted(k2,.5))[0]
        k4 = evaluate(shifted(k3,1.))[0]
        state = tuple(v+dt*(a+2*b+2*c+d)/6 for v,a,b,c,d in zip(state,k1,k2,k3,k4))
    return min(changes),max(changes),error,drift


if __name__ == "__main__":
    orbit = cutoff_orbit()
    print(f"Cutoff circular radius {orbit[0]:.9f}",flush=True)
    for epsilon,inc in ((0.,pi/4),(1e-4,0.),(1e-4,pi/4),(5e-5,pi/4)):
        low,high,error,drift = integrate(orbit,epsilon,inc,800)
        print(f"epsilon={epsilon:g} inclination={inc*180/pi:g} "
              f"delta L=[{low:.9e},{high:.9e}] error={error:.8e} H drift={drift:.3e}",flush=True)
        assert drift<1e-8
        if not epsilon or not inc:
            assert max(abs(low),abs(high))<1e-8
        else:
            assert low<0<high and error<.03*high
            if epsilon==1e-4:
                larger_error=error
            else:
                assert .20<error/larger_error<.30
                fine=integrate(orbit,epsilon,inc,1600)
                print("Step-halving change in extrema:",max(abs(fine[0]-low),abs(fine[1]-high)))
                assert max(abs(fine[0]-low),abs(fine[1]-high))<1e-8
