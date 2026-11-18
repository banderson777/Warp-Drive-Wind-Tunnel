"""Spherically averaged O(eta^2) response of the kinetic counterrotating shell."""
from bisect import bisect_right
from math import cos, exp, expm1, fsum, log, pi, sqrt
import json
from pathlib import Path
import sys

from vlasov_rotation import experiment
from vlasov_shell import L0, moments, solve


def simpson(i,n):
    return 1 if i in (0,n) else 4 if i%2 else 2


def coefficients(r,y,N,E0,beta,kappa,n):
    """Derivatives with respect to y and rotational forcing of rho, pr, rest density."""
    floor=L0/r**2
    available=expm1(2*y)-floor
    if available<=0:
        return (0.,)*3,(0.,)*3
    cap=exp(y)
    smax=sqrt(available)
    dy=[0.]*3
    forcing=[0.]*3
    for i in range(1,n+1):
        s=smax*i/n
        s2=s*s
        p2=floor+s2
        energy=sqrt(1+p2)
        shell_weight=4*pi*s2*smax*simpson(i,n)/(3*n)
        for j in range(n+1):
            radial=s2*(j/n)**2
            L=r*r*(p2-radial)
            q=L/(L+3*L0)
            angle_weight=simpson(j,n)/(3*n)
            measure=shell_weight*angle_weight
            change_y=measure*energy/cap
            cross=measure*beta*(q-kappa)*sqrt(L)/(3*E0)
            # The moving energy cutoff contributes a surface term at s=smax.
            boundary=4*pi*smax*energy/N*angle_weight*beta*beta*L/(6*E0) if i==n else 0.
            for k,value in enumerate((energy,radial/energy,1.)):
                dy[k]+=change_y*value
                forcing[k]+=(cross+boundary)*value
    return dy,forcing


def linear(x,points,rows):
    i=min(len(points)-2,max(0,bisect_right(points,x)-1))
    f=(x-points[i])/(points[i+1]-points[i])
    return [a+f*(b-a) for a,b in zip(rows[i][1:],rows[i+1][1:])]


def prepare(steps,quad,background_step,background_quad):
    rotation=experiment(steps,quad,background_step=background_step,background_quad=background_quad)
    reference=[]
    shell=solve(.1,background_step,background_quad,record=lambda r,state:reference.append((r,state[0],state[1])))
    radii=[row[0] for row in reference]
    profile=rotation["rows"]
    radial_rotation=[row[0] for row in profile]
    a,b,M=shell.a,shell.b,shell.mass
    E0=exp(reference[-1][2])*sqrt(1-2*M/b)
    h=(b-a)/steps
    eta=rotation["eta"]
    nodes=[]
    for i in range(2*steps+1):
        r=min(b,a+h*i/2)
        m,y=linear(r,radii,reference)
        N=E0*exp(-y)
        A=1-2*m/r
        _,beta,flux,_=linear(r,radial_rotation,profile)
        beta/=eta
        beta_prime=flux*N/(eta*r**4*sqrt(A))
        _,pr,_,rest=moments(r,y,L0,quad)
        dyd,rot=coefficients(r,y,N,E0,beta,rotation["kappa"],quad)
        quadratically_averaged=A*r*r*beta_prime**2/(48*pi*N*N)
        mu_prime=(m+4*pi*r**3*pr)/(r*r*A)
        nodes.append((r,N,A,rest,mu_prime,dyd,rot,quadratically_averaged))
    return shell,rotation,nodes,h


def integrate(nodes,h,center_offset,rotating):
    def rate(node,state):
        r,_,A,rest,mu_prime,dy,rot,geometry=node
        m2,y2,_=state
        rho,pr,n=(d*y2+(v if rotating else 0.) for d,v in zip(dy,rot))
        q=geometry if rotating else 0.
        area=4*pi*r*r
        return (area*(rho+q),
                -(m2+area*r*(pr-q))/(r*r*A)-2*m2*mu_prime/(r*A),
                area*(n+rest*m2/(r*A))/sqrt(A))

    state=(0.,center_offset,0.)
    profiles=[state]
    for i in range(0,len(nodes)-2,2):
        k1=rate(nodes[i],state)
        k2=rate(nodes[i+1],tuple(x+h*k/2 for x,k in zip(state,k1)))
        k3=rate(nodes[i+1],tuple(x+h*k/2 for x,k in zip(state,k2)))
        k4=rate(nodes[i+2],tuple(x+h*k for x,k in zip(state,k3)))
        state=tuple(x+h*(a+2*b+2*c+d)/6 for x,a,b,c,d in zip(state,k1,k2,k3,k4))
        profiles.append(state)
    return profiles


def run(steps,quad,*,background_step=.002,background_quad=64):
    shell,rotation,nodes,h=prepare(steps,quad,background_step,background_quad)
    forcing=integrate(nodes,h,0.,True)
    homogeneous=integrate(nodes,h,1.,False)
    assert abs(homogeneous[-1][2])>1e-6
    offset=-forcing[-1][2]/homogeneous[-1][2]
    fixed_rest=[tuple(x+offset*y for x,y in zip(a,b)) for a,b in zip(forcing,homogeneous)]
    eta=rotation["eta"]
    A=1-2*shell.mass/shell.b

    def collect(solution):
        m2,y2,rest2=solution[-1]
        cutoff=y2-m2/(shell.b*A)
        deficit=-nodes[0][1]*(cutoff-solution[0][1])*eta**2
        profile=[]
        a,b=shell.a,shell.b
        rows=[(node[0],node[1],pair[0],pair[1]) for node,pair in zip(nodes[::2],solution)]
        radii=[row[0] for row in rows]
        for i in range(350):
            r=(i+.5)*7/350
            if r<=a:
                delta, mass=deficit,0.
            elif r>=b:
                g=1-2*shell.mass/r
                delta, mass=m2*eta**2/(r*sqrt(g)),m2*eta**2
            else:
                N,m,y=linear(r,radii,rows)
                delta,mass=-N*(cutoff-y)*eta**2,m*eta**2
            profile.append([delta,mass])
        return {"admChange":m2*eta**2,"restChange":rest2*eta**2,
                "cavityDeficitChange":deficit,"energyCutoffLogChange":cutoff*eta**2,
                "centralYChange":solution[0][1]*eta**2,"profile":profile}

    assert abs(fixed_rest[-1][2])<1e-12
    return {"eta":eta,"backgroundMass":shell.mass,"backgroundClockDeficit":shell.clock_deficit,
            "midpoint":(shell.a+shell.b)/2,"bounds":[shell.a,shell.b],
            "peakProjectedDensityDriver":max(abs(node[6][0]+node[7])*eta**2 for node in nodes),"fixedCentralY":collect(forcing),
            "fixedRestMass":collect(fixed_rest)}


def check_geometry():
    # The independent 4D tensor in check_stress tests the signs of the
    # geometric contributions to rho and p_r in the projected equations.
    from check_stress import M, lapse, mass, shape, stress
    r=.97
    epsilon=.02
    original=stress(r,pi/2,0.,1e-5)
    changed=stress(r,pi/2,epsilon,1e-5)
    A=1-2*mass(r,M)[0]/r
    q=A*r*r*(epsilon*shape(r)[1])**2/(32*pi*lapse(r)**2)
    assert abs((changed[0][0]-original[0][0])/q+1)<3e-4
    assert abs((changed[1][1]-original[1][1])/q-1)<3e-4


def direct_equatorial(r,y,N,E0,beta,kappa,eta,n=32):
    """Direct integration with the energy cutoff displaced in each direction."""
    floor=L0/r**2
    cap=exp(y)
    reference_max=sqrt(expm1(2*y)-floor)
    directions=[[],[],[]]
    angular=n//2
    for j in range(n+1):
        cosine=j/n
        for azimuth in range(angular):
            c=cos(2*pi*azimuth/angular)
            def particle(s):
                p2=floor+s*s
                tangential=p2-(s*cosine)**2
                energy=sqrt(1+p2)
                L=r*r*tangential
                shift=eta*beta*sqrt(L)*c
                return (N*(s-reference_max)*(s+reference_max)/(energy+cap)-shift,energy,L)
            lo,hi=0.,2*reference_max
            assert particle(lo)[0]<0<particle(hi)[0]
            while True:
                mid=(lo+hi)/2
                if mid==lo or mid==hi:
                    break
                if particle(mid)[0]<0:
                    lo=mid
                else:
                    hi=mid
            upper=(lo+hi)/2
            radial_terms=[[],[],[]]
            for i in range(1,n):  # The integrand is zero at both endpoints.
                s=upper*i/n
                difference,energy,L=particle(s)
                factor=(1+eta*(L/(L+3*L0)-kappa)*c)
                weight=4*pi*s*s*(-difference/E0)*factor*simpson(i,n)*simpson(j,n)*upper/(9*n*n*angular)
                for k,value in enumerate((energy,(s*cosine)**2/energy,1.)):
                    radial_terms[k].append(weight*value)
            for k in range(3):
                directions[k].append(fsum(radial_terms[k]))
    return [fsum(terms) for terms in directions]


def check_distribution():
    rotation=experiment(400,24)
    rows=rotation["rows"]
    outer,N_outer,*_=rows[-1]
    E0=N_outer*sqrt(1+L0/outer**2)
    for index in (20,100,200,300,380):
        r,N,beta,*_=rows[index]
        args=(r,log(E0/N),N,E0,beta/rotation["eta"],rotation["kappa"])
        _,forcing=coefficients(*args,80)
        for n in (32,64):
            static=direct_equatorial(*args,0.,n)
            for amplitude in (.02,.20):
                plus=direct_equatorial(*args,amplitude,n)
                minus=direct_equatorial(*args,-amplitude,n)
                # The quadratic angular dependence is sin²(theta), whose
                # spherical average is 2/3 of the equatorial coefficient.
                errors=[]
                for zero,p,m,target in zip(static,plus,minus,forcing):
                    inferred=fsum([p,m,-2*zero])/(3*amplitude**2)
                    errors.append(abs(inferred/target-1))
                print(f"wall {index/400:.0%} eta {amplitude:.2f} n {n}: "
                      + " ".join(f"{e:.7%}" for e in errors),flush=True)
                if n==64:
                    assert max(errors)<2e-4, (r,amplitude,errors)


def main():
    check_geometry()
    check_distribution()
    cases={(steps,quad): run(steps,quad) for steps in (400,800) for quad in (24,40)}
    fine=cases[800,40]
    for (steps,quad),result in cases.items():
        for condition in ("fixedCentralY","fixedRestMass"):
            for quantity in ("admChange","cavityDeficitChange"):
                value=result[condition][quantity]
                reference=fine[condition][quantity]
                difference=abs((value-reference)/reference)
                print(f"{steps:3d} {quad:2d} {condition:13} {quantity:18} "
                      f"{value:+.10e}  relative difference {difference:.5%}",flush=True)
                assert difference < .01, (steps,quad,condition,quantity,value,reference)
    # Hold the rotation and response grids fixed while refining the equilibrium.
    for step,quad in ((.001,64),(.002,128),(.001,128)):
        result=run(800,40,background_step=step,background_quad=quad)
        for condition in ("fixedCentralY","fixedRestMass"):
            for quantity in ("admChange","cavityDeficitChange"):
                value=result[condition][quantity]
                baseline=fine[condition][quantity]
                relative=abs((value-baseline)/baseline)
                print(f"background {step} {quad} {condition} {quantity} "
                      f"{value:+.10e} change {relative:.8%}",flush=True)
                assert relative < .001, (step,quad,condition,quantity,relative)
    if len(sys.argv)>1:
        Path(sys.argv[1]).write_text("globalThis.WarpSecondOrder="+json.dumps(
            fine,separators=(",",":"),allow_nan=False)+";\n")


if __name__=="__main__":
    main()
