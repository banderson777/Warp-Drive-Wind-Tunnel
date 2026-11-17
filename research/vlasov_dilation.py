"""Test constraint-satisfying radial dilations of the Einstein–Vlasov shell.

The canonical map scales areal radius by s and radial canonical momentum
by 1/s, leaving angular coordinates and momenta fixed. It preserves the
particle number and phase-space volume. The distribution remains even in
radial momentum so the initial radial current and extrinsic curvature vanish.
"""
from math import exp, expm1, pi, sqrt
from vlasov_shell import L0, slope, solve


def quadrature(r, y, q, angles=12):
    """Cache normalized weights and old physical momentum components."""
    l0_over_r2=L0/r**2
    available=expm1(2*y)-l0_over_r2
    if available <= 0:
        return []
    emax=exp(y)
    ds=sqrt(available)/q
    nodes=[]
    for i in range(1,q):
        s2=(i*ds)**2
        p2=s2+l0_over_r2
        base=4*pi*ds/3*(4 if i % 2 else 2)*s2*(available-s2)/(
            emax*(emax+sqrt(1+p2)))
        for j in range(angles+1):
            radial=s2*(j/angles)**2
            weight=(1 if j in (0,angles) else 4 if j % 2 else 2)/(3*angles)
            nodes.append((radial,p2-radial,base*weight))
    return nodes


def point(r, state, q):
    m, y, _, _=state
    return r,1-2*m/r,quadrature(r,y,q)


def prepared_profile(h, q, equilibrium_quadrature):
    profile=[]
    reference=solve(.1,h,equilibrium_quadrature,record=lambda r,state:profile.append((r,state)))
    intervals=[]
    left_r,left=profile[0]
    left_point=point(left_r,left,q)
    left_slope=slope(left_r,left,L0,equilibrium_quadrature)
    for right_r,right in profile[1:]:
        width=right_r-left_r
        right_slope=slope(right_r,right,L0,equilibrium_quadrature)
        midpoint=[(a+b)/2+width*(u-v)/8
                  for a,b,u,v in zip(left,right,left_slope,right_slope)]
        right_point=point(right_r,right,q)
        intervals.append((width,left_point,point((left_r+right_r)/2,midpoint,q),right_point))
        left_r,left,left_point,left_slope=right_r,right,right_point,right_slope
    return reference,intervals


def mass_derivative(m, scale, node):
    r,old_a,samples=node
    new_a=1-2*m/(scale*r)
    if new_a <= 0:
        raise ValueError('Dilation produced a trapped surface.')
    velocity_ratio=new_a/old_a
    inv_scale_squared=1/(scale*scale)
    energy=sum(weight*sqrt(1+(velocity_ratio*radial+tangential)*inv_scale_squared)
               for radial,tangential,weight in samples)
    # Momentum and volume rescaling cancel the explicit powers of scale.
    return 4*pi*r*r*sqrt(velocity_ratio)*energy


def constraints(scale, intervals):
    mass=rest=0.0
    for width,left,middle,right in intervals:
        k1=mass_derivative(mass,scale,left)
        k2=mass_derivative(mass+width*k1/2,scale,middle)
        k3=mass_derivative(mass+width*k2/2,scale,middle)
        k4=mass_derivative(mass+width*k3,scale,right)
        mass+=width*(k1+2*k2+2*k3+k4)/6
        # The new A cancels in the proper-volume rest mass.
        contributions=[4*pi*r*r*sum(w for _,_,w in samples)/sqrt(a)
                       for r,a,samples in (left,middle,right)]
        rest+=width*sum(w*c for w,c in zip((1,4,1),contributions))/6
    return mass,rest


def main():
    for h,q in ((.012,24),(.006,48)):
        reference,intervals=prepared_profile(h,q,max(64,q))
        base,rest=constraints(1,intervals)
        assert abs(base-reference.mass)<3e-6
        assert abs(rest-reference.rest_mass)<3e-6
        print(f'h={h:g}, q={q}: equilibrium ADM mass replay error={base-reference.mass:+.4g}, '
              f'rest mass replay error={rest-reference.rest_mass:+.4g}')
        for delta in (.02,.01,.005):
            low,_=constraints(1-delta,intervals)
            high,_=constraints(1+delta,intervals)
            linear=(high-low)/(2*delta)
            curvature=(high-2*base+low)/delta**2
            assert low>base and high>base and curvature>0
            print(f'dilation ±{delta:.3f}: ΔM−={low-base:.7g}, ΔM+={high-base:.7g}, '
                  f'centered slope={linear:+.5g}, centered curvature={curvature:.7g}')


if __name__=='__main__':
    main()
