import shutil
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def executable(name):
    resolved = shutil.which(name)
    if resolved is None:
        raise RuntimeError(f"Required executable is not available on PATH: {name}")
    return resolved


def run(label, command):
    print(f"\n[{label}] {' '.join(str(part) for part in command)}")
    subprocess.run(command, cwd=ROOT, check=True)


def main():
    npm = executable("npm.cmd" if sys.platform == "win32" else "npm")
    node = executable("node")
    python = sys.executable
    validators = [
        "validate_branches.py",
        "validate_network_metrics.py",
        "validate_competitor_pressure.py",
        "validate_branch_reputation_snapshot.py",
        "validate_branch_venue_context.py",
        "validate_branch_health_contract.py",
        "validate_branch_health.py",
        "validate_branch_health_scenarios.py",
        "validate_whitespace_contract.py",
        "validate_whitespace_population_context.py",
        "validate_whitespace_candidates.py",
        "validate_analyst_contract.py",
        "validate_portfolio_review.py",
        "validate_accessibility_contract.py",
        "validate_runtime_contract.py",
    ]

    run("production build", [npm, "run", "build"])
    run("read-only AI tools", [node, "--test", "server/portfolio-tools.test.mjs"])
    for validator in validators:
        run(validator.removesuffix(".py"), [python, f"scripts/{validator}"])
    run("Python test suite", [python, "-m", "unittest", "discover", "-s", "tests", "-v"])
    print("\nVERIFIED: build, snapshots, model contracts, AI tool boundary, and tests")


if __name__ == "__main__":
    main()
