"""Create a review-only Nominatim geocoding candidate file for the current roster.

This never changes the committed snapshot. A human must reconcile each candidate
against the source address before a coordinate can be promoted.
"""
from __future__ import annotations

import json
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SNAPSHOT = ROOT / "data" / "processed" / "branches_snapshot_v1.json"
OUTPUT = ROOT / "data" / "interim" / "nominatim_candidates_v1.json"
USER_AGENT = "Mozilla/5.0 (compatible; BedashingCaseStudyResearch/1.0)"


def lookup(record: dict) -> dict:
    query = f"{record['name']}, {record['address']}, {record['emirate']}, United Arab Emirates"
    url = "https://nominatim.openstreetmap.org/search?" + urllib.parse.urlencode(
        {"q": query, "format": "jsonv2", "limit": 3, "addressdetails": 1}
    )
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=30) as response:
        matches = json.load(response)
    return {"branch_id": record["branch_id"], "query": query, "request_url": url, "matches": matches}


def main() -> None:
    records = json.loads(SNAPSHOT.read_text(encoding="utf-8"))["records"]
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    candidates = []
    for index, record in enumerate(records):
        try:
            candidates.append(lookup(record))
        except Exception as error:  # Preserve review evidence even when a public endpoint fails.
            candidates.append({"branch_id": record["branch_id"], "error": str(error), "matches": []})
        OUTPUT.write_text(json.dumps(candidates, indent=2, ensure_ascii=False), encoding="utf-8")
        if index < len(records) - 1:
            time.sleep(1.1)  # Respect Nominatim's public-service rate limit.
    OUTPUT.write_text(json.dumps(candidates, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Wrote {len(candidates)} review-only candidate sets to {OUTPUT}")


if __name__ == "__main__":
    main()
