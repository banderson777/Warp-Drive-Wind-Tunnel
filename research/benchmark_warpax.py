"""Cross-check the shipped wind-tunnel presets against Warpax curvature."""
import argparse
import csv
import json
from pathlib import Path
import subprocess
import sys

import warpax
import jax
import jax.numpy as jnp
import numpy as np
from warpax.benchmarks.alcubierre import AlcubierreMetric
from warpax.geometry.geometry import compute_curvature_chain

ROOT = Path(__file__).resolve().parents[1]
COLUMNS = (25, 49)
EXTENT = 3.5
FRAME_KEYS = ("T00", "T01", "T02", "T03", "T11", "T12", "T13", "T22", "T23", "T33")
FRAME_INDEX = tuple((i,j) for i in range(4) for j in range(i,4))


def geometry(model,parameters):
    v, R, w = (parameters[key] for key in ("speed","radius","width"))
    if model == "alcubierre":
        # Warpax's built-in Alcubierre metric uses lab coordinates, with the
        # bubble centered at x=0 on the benchmark t=0 slice.
        metric = AlcubierreMetric(v_s=v,R=R,sigma=1/w)
        return metric, lambda coords: jnp.concatenate((jnp.ones(1),-metric.shift(coords)))

    def potential(xyz):
        squared_radius = jnp.dot(xyz,xyz)
        tanh_wall = jnp.tanh(R/w)
        def regular(r2):
            # Taylor coefficient fixes the limit and first two derivatives
            # used in the metric at the center of an even radial profile.
            return 1-(1-tanh_wall*tanh_wall)*r2/(w*w)
        def wall(r2):
            r=jnp.sqrt(r2)
            return (jnp.tanh((r+R)/w)-jnp.tanh((r-R)/w))/(2*tanh_wall)
        f=jax.lax.cond(squared_radius<1e-8,regular,wall,squared_radius)
        return v*f*jnp.cross(jnp.array([1.,0.,0.]),xyz)/2

    def flow(coords):
        d=jax.jacfwd(potential)(coords[1:])
        return jnp.array([d[2,1]-d[1,2], d[0,2]-d[2,0], d[1,0]-d[0,1]])-jnp.array([v,0.,0.])

    def line_element(coords):
        u=flow(coords)
        g=jnp.eye(4)
        g=g.at[0,0].set(-1+jnp.dot(u,u))
        return g.at[0,1:].set(-u).at[1:,0].set(-u)

    # Stationary coordinates comoving with the bubble.
    return line_element, lambda coords: jnp.concatenate((jnp.ones(1),flow(coords)))


def reference(model,parameters):
    metric,normal=geometry(model,parameters)
    def evaluate(coords):
        stress=compute_curvature_chain(metric,coords).stress_energy
        frame=jnp.eye(4).at[0].set(normal(coords))
        orthonormal=frame@stress@frame.T
        # det(g) = -1, so the observed expansion is the coordinate divergence.
        expansion=jnp.trace(jax.jacfwd(normal)(coords))
        return orthonormal, expansion
    return jax.jit(jax.vmap(evaluate))


def simulator(model,parameters,points):
    data=json.dumps({"model":model,"parameters":parameters,"points":points.tolist()})
    raw=subprocess.run(["node",str(ROOT/"research/benchmark_wind_tunnel.cjs")],
                       input=data,text=True,check=True,capture_output=True).stdout
    return np.asarray(json.loads(raw))


def compare(model,grid,parameters,solve,output):
    mesh=np.linspace(-EXTENT,EXTENT,grid)
    points=np.array([(x,y) for y in mesh for x in mesh])
    zeros=np.zeros(len(points))
    coords=jnp.asarray(np.column_stack((zeros,points,zeros)))
    tensors, expansion=map(np.asarray,solve(coords))
    expected=np.column_stack((tensors[:,0,0],expansion))
    actual=simulator(model,parameters,points)
    if not (np.isfinite(tensors).all() and np.isfinite(expected).all() and np.isfinite(actual).all()):
        raise ValueError(f"Nonfinite output for {model} on the {grid}×{grid} grid.")
    diff=actual[:,:2]-expected
    fine_gradient_delta=actual[:,2]-expected[:,0]
    path=output/f"{model}-{grid}.csv"
    with path.open("w",newline="") as stream:
        writer=csv.writer(stream,lineterminator="\n")
        writer.writerow(("x_l","y_l","rho_wind_tunnel","rho_warpax","delta_rho",
                         "expansion_wind_tunnel","expansion_warpax","delta_expansion",
                         "rho_half_gradient_step","delta_rho_half_gradient_step",*FRAME_KEYS))
        for point,app,ref,delta,half_delta,tensor in zip(
                points,actual,expected,diff,fine_gradient_delta,tensors):
            writer.writerow((*point,app[0],ref[0],delta[0],app[1],ref[1],delta[1],app[2],half_delta,
                             *(tensor[a,b] for a,b in FRAME_INDEX)))
    max_errors=np.max(np.abs(diff),axis=0)
    rms=np.sqrt(np.mean(diff**2,axis=0))
    worst_density=points[np.argmax(np.abs(diff[:,0]))]
    peak_index=np.argmin(expected[:,0])
    return {"model":model,"grid":grid,"points":len(points),
            "spacing":2*EXTENT/(grid-1),
            "maxDensityError":float(max_errors[0]),"rmsDensityError":float(rms[0]),
            "halfGradientMaxDensityError":float(np.max(np.abs(fine_gradient_delta))),
            "maxExpansionError":float(max_errors[1]),"rmsExpansionError":float(rms[1]),
            "worstDensityPoint":worst_density.tolist(),
            "minimumWindTunnelDensity":float(np.min(actual[:,0])),
            "minimumWarpaxDensity":float(expected[peak_index,0]),
            "minimumWarpaxPoint":points[peak_index].tolist()}


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output",type=Path,default=ROOT/"dist"/"benchmarks")
    args=parser.parse_args()
    args.output.mkdir(parents=True,exist_ok=True)
    summary=[]
    for model in ("alcubierre","natario"):
        fixture=json.loads((ROOT/"dist"/"benchmarks"/f"{model}.json").read_text())
        parameters=fixture["parameters"]
        solve=reference(model,parameters)
        for grid in COLUMNS:
            result=compare(model,grid,parameters,solve,args.output)
            print(json.dumps(result),flush=True)
            summary.append(result)
            density_tolerance=2e-12 if model=="alcubierre" else 1e-7
            assert result["maxDensityError"]<density_tolerance
            assert result["maxExpansionError"]<2e-12
            if model=="natario":
                assert result["halfGradientMaxDensityError"] < .35*result["maxDensityError"]
    payload={"warpax":warpax.__version__,"jax":jax.__version__,
             "python":sys.version.split()[0],"sliceExtent":EXTENT,"cases":summary}
    (args.output/"summary.json").write_text(json.dumps(payload,indent=2)+"\n")


if __name__=="__main__":
    main()
