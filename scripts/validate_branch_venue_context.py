"""Validate the address-evidenced peer-context snapshot used by branch-health v1."""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main() -> None:
    branches = json.loads((ROOT / "data/processed/branches_snapshot_v2.json").read_text(encoding="utf-8"))
    context = json.loads((ROOT / "data/processed/branch_venue_context_v1.json").read_text(encoding="utf-8"))
    assert context["input_branch_snapshot_id"] == branches["snapshot_id"]
    branch_ids = {row["branch_id"] for row in branches["records"]}
    rows = context["records"]
    assert {row["branch_id"] for row in rows} == branch_ids
    assert len(rows) == len(branch_ids)
    allowed_contexts = {"destination_retail", "community_or_streetfront", "commercial_building", "airport_concession"}
    allowed_peer_groups = {"destination_retail", "community_or_streetfront", "network_comparison_only"}
    for row in rows:
        assert row["venue_context"] in allowed_contexts
        assert row["peer_group_id"] in allowed_peer_groups
        assert row["classification_basis"]
        assert "2gis_branch_roster" in row["source_ids"]
        assert set(row["source_ids"]) <= {"2gis_branch_roster", "user_branch_location_validation_2026_09_09"}
        if row["venue_context"] in {"commercial_building", "airport_concession"}:
            assert row["peer_group_id"] == "network_comparison_only"
    group_counts = Counter(row["peer_group_id"] for row in rows)
    assert group_counts["destination_retail"] >= 3
    assert group_counts["community_or_streetfront"] >= 3
    print(f"VALID: {len(rows)} venue contexts; peer groups destination_retail={group_counts['destination_retail']}, community_or_streetfront={group_counts['community_or_streetfront']}")


if __name__ == "__main__":
    main()
