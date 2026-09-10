"""Validate the deliberately incomplete competitor-pressure output."""
from __future__ import annotations
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
branches = json.loads((ROOT / "data/processed/branches_snapshot_v1.json").read_text(encoding="utf-8"))
competitors = json.loads((ROOT / "data/processed/competitors_snapshot_v1.json").read_text(encoding="utf-8"))
pressure = json.loads((ROOT / "data/processed/competitor_pressure_v1.json").read_text(encoding="utf-8"))
branch_ids = {row["branch_id"] for row in branches["records"]}
competitor_ids = {row["competitor_id"] for row in competitors["records"]}
active_geocoded_ids = {row["competitor_id"] for row in competitors["records"] if row["latitude"] is not None and row["longitude"] is not None and "permanently_closed" not in row["status"]}
valid_taxonomy = {"direct_premium_full_service", "near_direct_premium_beauty", "local_full_service", "specialist_adjacent", "low_relevance"}
valid_statuses = {"officially_listed", "user_verified_currently_listed", "user_confirmed_permanently_closed"}
assert len(competitor_ids) == len(competitors["records"])
for competitor in competitors["records"]:
    assert competitor["taxonomy_class"] in valid_taxonomy
    assert competitor["status"] in valid_statuses
    assert competitor["source_ids"]
    assert (competitor["latitude"] is None) == (competitor["longitude"] is None)
    if competitor["latitude"] is None:
        assert competitor["coordinate_confidence"] == "none"
    else:
        assert 22 <= competitor["latitude"] <= 27 and 51 <= competitor["longitude"] <= 57
    if "permanently_closed" in competitor["status"]:
        assert competitor["latitude"] is None and competitor["longitude"] is None
assert pressure["input_branch_snapshot_id"] == branches["snapshot_id"]
assert pressure["input_competitor_snapshot_id"] == competitors["snapshot_id"]
assert pressure["competitor_geo_coverage"]["geocoded_verified_record_count"] == len(active_geocoded_ids)
assert pressure["competitor_geo_coverage"]["geocoded_verified_record_count"] < pressure["competitor_geo_coverage"]["officially_listed_candidate_count"]
assert {row["branch_id"] for row in pressure["branch_pressure"]} == branch_ids
for row in pressure["branch_pressure"]:
    assert row["coverage_status"] == "scope_limited_do_not_interpret_zero_as_no_competition"
    assert row["verified_competitor_pressure_lower_bound"] >= 0
    assert all(item["competitor_id"] in active_geocoded_ids and item["contribution"] > 0 for item in row["contributions"])
    assert [item["contribution"] for item in row["contributions"]] == sorted((item["contribution"] for item in row["contributions"]), reverse=True)
    assert abs(row["verified_competitor_pressure_lower_bound"] - sum(item["contribution"] for item in row["contributions"])) < 0.00001
print(f"VALID: {len(active_geocoded_ids)} active geocoded competitors; candidate review is complete and the model scope is limited")
