"""Normalize a manually validated Google Maps collection into a reviewer-safe snapshot."""
from __future__ import annotations

import argparse
import json
from pathlib import Path

from verify_manual_reputation_collection import parse_collection

ROOT = Path(__file__).resolve().parents[1]
OUTPUT_PATH = ROOT / "data/processed/branch_reputation_snapshot_v1.json"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("collection_path", type=Path)
    parser.add_argument("--observed-at", required=True)
    args = parser.parse_args()
    branches = json.loads((ROOT / "data/processed/branches_snapshot_v1.json").read_text(encoding="utf-8"))
    rows = parse_collection(args.collection_path.read_text(encoding="utf-8"))
    by_id = {str(row["branch_id"]): row for row in rows}
    records = []
    for branch in branches["records"]:
        row = by_id[branch["branch_id"]]
        if row["status"] == "user_confirmed_permanently_closed":
            records.append({"branch_id": branch["branch_id"], "status": row["status"], "rating_value": None, "rating_count": None, "observed_at": args.observed_at, "source_ids": ["user_validated_google_maps_2026_09_09"], "source_url": None})
        else:
            records.append({"branch_id": branch["branch_id"], "status": "observed", "rating_value": row["rating"], "rating_count": row["review_count"], "observed_at": args.observed_at, "source_ids": ["user_validated_google_maps_2026_09_09"], "source_url": row["url"]})
    output = {"snapshot_id": "bedashing-branch-reputation-v1-2026-09-09", "input_branch_snapshot_id": branches["snapshot_id"], "source_ids": ["user_validated_google_maps_2026_09_09"], "purpose": "Manually user-validated public Google Maps reputation observations. These are public reputation signals, not financial or operating performance.", "records": records}
    OUTPUT_PATH.write_text(json.dumps(output, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(records)} reputation records")


if __name__ == "__main__":
    main()
