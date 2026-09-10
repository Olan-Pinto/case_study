"""Build an explicitly incomplete, verified-competitor pressure lower bound."""
from __future__ import annotations
import json
import math
from pathlib import Path
try:  # Supports both `py scripts/...` and package imports in tests.
    from .build_network_metrics import haversine_km
except ImportError:
    from build_network_metrics import haversine_km

ROOT = Path(__file__).resolve().parents[1]

def main() -> None:
    branches = json.loads((ROOT / "data/processed/branches_snapshot_v1.json").read_text(encoding="utf-8"))
    competitors = json.loads((ROOT / "data/processed/competitors_snapshot_v1.json").read_text(encoding="utf-8"))
    config = json.loads((ROOT / "config/competitor_pressure_v1.json").read_text(encoding="utf-8"))
    weights = {key: value["similarity_weight"] for key, value in config["taxonomy"].items()}
    rows = []
    active_competitors = [row for row in competitors["records"] if row["latitude"] is not None and row["longitude"] is not None and "permanently_closed" not in row["status"]]
    for branch in (branch for branch in branches["records"] if "permanently_closed" not in branch["status"]):
        contributions = []
        for competitor in active_competitors:
            distance = haversine_km(branch["latitude"], branch["longitude"], competitor["latitude"], competitor["longitude"])
            contribution = weights[competitor["taxonomy_class"]] * math.exp(-distance / config["distance_decay_km"])
            if contribution >= 0.01:
                contributions.append({"competitor_id": competitor["competitor_id"], "distance_km": round(distance, 6), "similarity_weight": weights[competitor["taxonomy_class"]], "contribution": round(contribution, 6)})
        contributions.sort(key=lambda item: (-item["contribution"], item["competitor_id"]))
        rows.append({"branch_id": branch["branch_id"], "verified_competitor_pressure_lower_bound": round(sum(item["contribution"] for item in contributions), 6), "contributions": contributions, "coverage_status": "scope_limited_do_not_interpret_zero_as_no_competition"})
    output = {"model_id": config["model_id"], "input_branch_snapshot_id": branches["snapshot_id"], "input_competitor_snapshot_id": competitors["snapshot_id"], "source_ids": sorted({source_id for branch in branches["records"] for source_id in branch["source_ids"]} | {source_id for competitor in competitors["records"] for source_id in competitor["source_ids"]}), "formula": config["formula"], "interpretation": config["interpretation"], "competitor_geo_coverage": {"officially_listed_candidate_count": competitors["officially_listed_candidate_count"], "geocoded_verified_record_count": competitors["geocoded_verified_record_count"]}, "branch_pressure": rows}
    (ROOT / "data/processed/competitor_pressure_v1.json").write_text(json.dumps(output, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote lower-bound pressure for {len(rows)} branches from {len(active_competitors)} active geocoded competitors")

if __name__ == "__main__": main()
