"""Print a reviewer-friendly summary of the committed branch evidence snapshot."""
from __future__ import annotations
import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
snapshot = json.loads((ROOT / "data" / "processed" / "branches_snapshot_v1.json").read_text(encoding="utf-8"))
manifest = json.loads((ROOT / "data" / "processed" / "branches_snapshot_v1.manifest.json").read_text(encoding="utf-8"))

print(f"Snapshot: {snapshot['snapshot_id']}")
print(f"Official claimed UAE lounges: {snapshot['official_claimed_uae_lounges']}")
print(f"Evidence-backed records: {len(snapshot['records'])}")
print("By emirate: " + ", ".join(f"{name}={count}" for name, count in sorted(Counter(r['emirate'] for r in snapshot['records']).items())))
print("By status: " + ", ".join(f"{name}={count}" for name, count in sorted(Counter(r['status'] for r in snapshot['records']).items())))
print(f"Coordinates present: {manifest['records_with_coordinates']}")
print("Reconciliation: " + manifest["reconciliation_status"])
