"""Write the reference equilibrium to stdout for the evolution solver."""
import json

from vlasov_shell import L0, solve


def main():
    profile = []
    shell = solve(.1, .004, 64, record=lambda r, state: profile.append([r, state[0], state[1]]))
    print(json.dumps({"l0": L0, "a": shell.a, "b": shell.b, "mass": shell.mass,
                      "restMass": shell.rest_mass, "profile": profile}))


if __name__ == "__main__":
    main()
