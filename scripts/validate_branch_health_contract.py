"""Validate the deliberate no-score contract for branch-health v1."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "config/branch_health_v1.json"


def main() -> None:
    config = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    assert config["model_id"] == "branch-health-v1"
    assert config["status"] == "scored_public_proxy"
    assert config["peer_comparison"]["minimum_peer_group_size"] >= 3
    assert config["missingness"]["withheld_label"] == "INSUFFICIENT_EVIDENCE"
    assert "public_reputation" in config["permitted_factors"]
    assert "format archetype" in " ".join(config["minimum_scoring_requirements"]).lower()
    assert "closure recommendation" in config["labelling"]["prohibited_claims"]
    assert config["confidence"]["separate_from_score"] is True
    print("VALID: branch-health v1 contract withholds scores until source-backed peer evidence exists")


if __name__ == "__main__":
    main()
