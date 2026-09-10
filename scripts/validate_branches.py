"""Validate the committed Phase 1 branch snapshot without external dependencies."""
from __future__ import annotations
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SNAPSHOT = ROOT / "data" / "processed" / "branches_snapshot_v1.json"
MANIFEST = ROOT / "data" / "processed" / "branches_snapshot_v1.manifest.json"
UAE_BOUNDS = {"lat": (22.0, 27.7), "lon": (51.0, 57.0)}
REQUIRED = {"branch_id", "name", "emirate", "community", "address", "status", "latitude", "longitude", "coordinate_confidence", "source_ids", "source_urls", "validation_needed"}

def validate(snapshot: dict, manifest: dict) -> list[str]:
    errors: list[str] = []
    records = snapshot.get("records", [])
    ids = [record.get("branch_id") for record in records]
    if len(ids) != len(set(ids)):
        errors.append("duplicate branch_id")
    if manifest.get("candidate_records", 0) + manifest.get("currently_listed_records", 0) != len(records):
        errors.append("manifest record counts do not equal snapshot records")
    if snapshot.get("official_claimed_uae_lounges") != manifest.get("official_claimed_uae_lounges"):
        errors.append("official claimed count differs between snapshot and manifest")
    for record in records:
        missing = REQUIRED - set(record)
        if missing:
            errors.append(f"{record.get('branch_id')}: missing {sorted(missing)}")
            continue
        if not record["source_ids"]:
            errors.append(f"{record['branch_id']}: no provenance")
        if not record["source_urls"]:
            errors.append(f"{record['branch_id']}: no source URL")
        lat, lon = record["latitude"], record["longitude"]
        if (lat is None) != (lon is None):
            errors.append(f"{record['branch_id']}: coordinate pair is incomplete")
        if lat is not None and not (UAE_BOUNDS["lat"][0] <= lat <= UAE_BOUNDS["lat"][1] and UAE_BOUNDS["lon"][0] <= lon <= UAE_BOUNDS["lon"][1]):
            errors.append(f"{record['branch_id']}: coordinates outside plausible UAE bounds")
        if lat is None and record["coordinate_confidence"] != "none":
            errors.append(f"{record['branch_id']}: null coordinate has non-none confidence")
        if lat is not None and record["coordinate_confidence"] == "none":
            errors.append(f"{record['branch_id']}: coordinate has no confidence")
        if record["status"] in {"candidate_needs_official_validation", "user_confirmed_permanently_closed"} and not any("official" in item for item in record["validation_needed"]):
            errors.append(f"{record['branch_id']}: candidate lacks official validation flag")
    return errors

def main() -> int:
    snapshot = json.loads(SNAPSHOT.read_text(encoding="utf-8"))
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    errors = validate(snapshot, manifest)
    if errors:
        print("INVALID")
        print("\n".join(f"- {error}" for error in errors))
        return 1
    print(f"VALID: {len(snapshot['records'])} records; {manifest['records_with_coordinates']} coordinates; reconciliation={manifest['reconciliation_status']}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
