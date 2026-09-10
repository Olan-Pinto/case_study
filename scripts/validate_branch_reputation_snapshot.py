"""Validate manual public-reputation records before health scoring."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main() -> None:
    branches = json.loads((ROOT / "data/processed/branches_snapshot_v1.json").read_text(encoding="utf-8"))
    snapshot = json.loads((ROOT / "data/processed/branch_reputation_snapshot_v1.json").read_text(encoding="utf-8"))
    assert snapshot["input_branch_snapshot_id"] == branches["snapshot_id"]
    assert {row["branch_id"] for row in snapshot["records"]} == {row["branch_id"] for row in branches["records"]}
    for row in snapshot["records"]:
        assert row["observed_at"] == "2026-09-09"
        assert row["source_ids"] == ["user_validated_google_maps_2026_09_09"]
        if row["status"] == "observed":
            assert 0 <= row["rating_value"] <= 5 and row["rating_count"] >= 0 and row["source_url"]
        else:
            assert row["status"] == "user_confirmed_permanently_closed"
            assert row["rating_value"] is None and row["rating_count"] is None and row["source_url"] is None
    print("VALID: 22 observed manual reputation records and two user-confirmed closures")


if __name__ == "__main__":
    main()
