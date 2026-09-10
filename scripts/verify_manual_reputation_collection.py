"""Audit a user-supplied manual Google Maps reputation collection without scraping."""
from __future__ import annotations

import argparse
import json
import math
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EARTH_RADIUS_KM = 6371.0088
EMBEDDED_COORDINATE = re.compile(r"!3d([-0-9.]+)!4d([-0-9.]+)")
EXCEPTIONS_PATH = ROOT / "config" / "manual_reputation_collection_exceptions_v1.json"


def haversine_km(lat_a: float, lon_a: float, lat_b: float, lon_b: float) -> float:
    latitude_delta = math.radians(lat_b - lat_a)
    longitude_delta = math.radians(lon_b - lon_a)
    a = math.sin(latitude_delta / 2) ** 2 + math.cos(math.radians(lat_a)) * math.cos(math.radians(lat_b)) * math.sin(longitude_delta / 2) ** 2
    return 2 * EARTH_RADIUS_KM * math.asin(math.sqrt(a))


def parse_collection(text: str) -> list[dict[str, object]]:
    rows = []
    for line_number, raw_line in enumerate(text.splitlines(), start=1):
        line = raw_line.strip()
        if not line:
            continue
        if "|" not in line:
            raise ValueError(f"line {line_number}: expected pipe-delimited record")
        parts = [part.strip() for part in line.split("|")]
        branch_id = parts[0]
        if len(parts) == 2 and parts[1].lower() == "permanently closed":
            rows.append({"branch_id": branch_id, "status": "user_confirmed_permanently_closed"})
            continue
        if len(parts) < 4:
            raise ValueError(f"line {line_number}: expected rating, review count, and Maps URL")
        rating = float(parts[1])
        review_count = int(parts[2])
        url = parts[3]
        if not 0 <= rating <= 5 or review_count < 0 or not url.startswith("https://www.google.com/maps/"):
            raise ValueError(f"line {line_number}: invalid rating, review count, or Google Maps URL")
        rows.append({"branch_id": branch_id, "status": "observed", "rating": rating, "review_count": review_count, "url": url})
    return rows


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("collection_path", type=Path)
    parser.add_argument("--observed-at", required=True, help="Shared ISO date supplied by the user")
    parser.add_argument("--coordinate-review-km", type=float, default=0.5)
    args = parser.parse_args()
    assert re.fullmatch(r"\d{4}-\d{2}-\d{2}", args.observed_at), "--observed-at must be YYYY-MM-DD"

    branches = json.loads((ROOT / "data/processed/branches_snapshot_v1.json").read_text(encoding="utf-8"))["records"]
    exceptions = json.loads(EXCEPTIONS_PATH.read_text(encoding="utf-8"))["coordinate_exceptions"]
    branches_by_id = {branch["branch_id"]: branch for branch in branches}
    rows = parse_collection(args.collection_path.read_text(encoding="utf-8"))
    collection_ids = [str(row["branch_id"]) for row in rows]
    assert len(collection_ids) == len(set(collection_ids)), "duplicate branch IDs in collection"
    assert set(collection_ids) == set(branches_by_id), "collection must account for every roster branch"

    coordinate_flags = []
    closed_ids = []
    for row in rows:
        branch_id = str(row["branch_id"])
        if row["status"] == "user_confirmed_permanently_closed":
            closed_ids.append(branch_id)
            continue
        match = EMBEDDED_COORDINATE.search(str(row["url"]))
        if not match and branch_id not in exceptions:
            coordinate_flags.append((branch_id, "no embedded place coordinate"))
            continue
        if not match:
            continue
        branch = branches_by_id[branch_id]
        distance = haversine_km(branch["latitude"], branch["longitude"], float(match.group(1)), float(match.group(2)))
        if distance > args.coordinate_review_km and branch_id not in exceptions:
            coordinate_flags.append((branch_id, f"{distance:.2f} km from roster coordinate"))

    print(f"VALID STRUCTURE: {len(rows)} roster records; {len(rows) - len(closed_ids)} rated; {len(closed_ids)} user-confirmed closed; observed_at={args.observed_at}")
    if coordinate_flags:
        print("REQUIRES LOCATION REVIEW:")
        for branch_id, reason in coordinate_flags:
            print(f"- {branch_id}: {reason}")
    else:
        print("LOCATION CHECK: all available embedded place coordinates are within the review threshold")
    if exceptions:
        print(f"USER-CONFIRMED LOCATION EXCEPTIONS: {', '.join(sorted(exceptions))}")


if __name__ == "__main__":
    main()
