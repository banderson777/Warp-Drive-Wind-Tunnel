"""Package reproducible equilibrium and evolution fields for the browser."""
import json
from math import exp, log1p, pi
from pathlib import Path
import sys

from cluster_shell import M, lapse_slope, mass, shape


def stationary_profiles(bins, outer, epsilon=1e-4):
    dr = outer/bins
    log_lapse = .5*log1p(-2*M/outer)
    static, rotation = [], []
    for i in range(bins-1, -1, -1):
        lower, upper = i*dr, (i+1)*dr
        r = (i+.5)*dr
        midpoint_lapse = log_lapse - dr/12*(
            lapse_slope(r,M)+4*lapse_slope((r+upper)/2,M)+lapse_slope(upper,M))
        log_lapse -= dr/6*(lapse_slope(lower,M)+4*lapse_slope(r,M)+lapse_slope(upper,M))
        n = exp(midpoint_lapse)
        m, dm = mass(r,M)
        a = 1-2*m/r
        rho = dm/(4*pi*r*r)
        pt = rho*r*lapse_slope(r,M)/2
        omega,domega,ddomega = shape(r)
        ap = -2*dm/r+2*m/r**2
        rotate_density = rho - a*r*r*(epsilon*domega)**2/(32*pi*n*n)
        momentum = epsilon*a*r/(16*pi*n)*(ddomega+(4/r+ap/(2*a)-lapse_slope(r,M))*domega)
        static.append([rho,n,0,pt,0,0])
        # Full rotational stresses are not exported as analytic pressures.
        rotation.append([rotate_density,n,0,0,epsilon*omega,momentum])
    return list(reversed(static)),list(reversed(rotation)),1-exp(log_lapse)


def resample(run):
    """Interpolate actual cell centers to the viewer's uniform radial grid."""
    bins, cells = run["bins"], run["cells"]
    source = [int(j*cells/bins)+.5 for j in range(bins)]
    targets = [(j+.5)*cells/bins for j in range(bins)]
    for frame in run["frames"]:
        rows = frame["profile"]
        lookup = 0
        uniform = []
        for target in targets:
            while lookup < bins-2 and source[lookup+1] < target:
                lookup += 1
            span = source[lookup+1]-source[lookup]
            ratio = min(1, max(0, (target-source[lookup])/span))
            uniform.append([float(f"{a+(b-a)*ratio:.7g}")
                            for a, b in zip(rows[lookup], rows[lookup+1])])
        frame["profile"] = uniform


def main():
    runs = json.loads(Path(sys.argv[1]).read_text())
    outer = runs[0]["outer"]
    bins = 350
    static,rotation,deficit = stationary_profiles(bins,outer)
    fine = [run for run in runs if run["label"]=="fine"]
    for run in fine:
        resample(run)
    comparison = [{"label":run["label"],"scale":run["scale"],
                   "series":[[f["t"],f["mean"]] for f in run["frames"]],
                   "maxDrift":run["maxDrift"]} for run in runs]
    payload = {"outer":outer,"static":static,"rotation":rotation,"deficit":deficit,
               "mass":M,"epsilon":1e-4,"runs":fine,"comparison":comparison}
    output=Path(sys.argv[2])
    output.write_text("globalThis.WarpResearchData="+json.dumps(
        payload,separators=(",",":"),allow_nan=False)+";\n")


if __name__ == "__main__":
    main()
