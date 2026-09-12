"""Validate the committed deterministic network-metrics snapshot."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
snapshot = json.loads((ROOT / "data" / "processed" / "branches_snapshot_v2.json").read_text(encoding="utf-8"))
metrics = json.loads((ROOT / "data" / "processed" / "network_metrics_v1.json").read_text(encoding="utf-8"))
manifest = json.loads((ROOT / "data" / "processed" / "network_metrics_v1.manifest.json").read_text(encoding="utf-8"))

branch_ids = {branch["branch_id"] for branch in snapshot["records"] if "permanently_closed" not in branch["status"]}
assert metrics["input_snapshot_id"] == snapshot["snapshot_id"]
assert metrics["model_id"] == "bedashing-network-geometry-v1"
assert metrics["primary_radius_km"] in metrics["radius_bands_km"]
assert len(metrics["branch_metrics"]) == len(branch_ids) == manifest["branch_metric_records"]
assert {item["branch_id"] for item in metrics["branch_metrics"]} == branch_ids
for item in metrics["branch_metrics"]:
    assert item["nearest_own_branch_id"] in branch_ids - {item["branch_id"]}
    assert item["nearest_own_branch_distance_km"] > 0
    assert [radius["radius_km"] for radius in item["service_radius_metrics"]] == metrics["radius_bands_km"]
for item in metrics["pairwise_overlaps"]:
    assert item["branch_a_id"] < item["branch_b_id"]
    assert item["branch_a_id"] in branch_ids and item["branch_b_id"] in branch_ids
    assert item["radius_km"] in metrics["radius_bands_km"]
    assert 0 < item["intersection_area_km2"] <= 3.141593 * item["radius_km"] ** 2
    assert 0 < item["overlap_coefficient"] <= 1
assert len(metrics["pairwise_overlaps"]) == manifest["pairwise_overlap_records"]
print(f"VALID: {len(branch_ids)} branch metrics; {len(metrics['pairwise_overlaps'])} pairwise overlaps")
