"""Create review-only Nominatim candidates for officially listed competitor venues.

This script does not alter a committed snapshot. It rate-limits public requests
and preserves the exact query/result for later human reconciliation.
"""
from __future__ import annotations

import json
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "data" / "interim" / "competitor_geocoding_candidates_v1.json"
USER_AGENT = "BedashingCaseStudyResearch/1.0 (local prototype; no bulk use)"

# Addresses/names are transcribed from the current official Sisters and NStyle locators.
CANDIDATES = [
    {"candidate_id": "sisters_dubai_mall", "name": "Sisters Beauty Lounge", "query": "Sisters Beauty Lounge, Dubai Mall, Dubai, United Arab Emirates", "source_ids": ["sisters_locations"]},
    {"candidate_id": "sisters_mall_of_emirates", "name": "Sisters Beauty Lounge", "query": "Sisters Beauty Lounge, Mall of the Emirates, Dubai, United Arab Emirates", "source_ids": ["sisters_locations"]},
    {"candidate_id": "sisters_mirdif_city_centre", "name": "Sisters Beauty Lounge", "query": "Sisters Beauty Lounge, City Centre Mirdif, Dubai, United Arab Emirates", "source_ids": ["sisters_locations"]},
    {"candidate_id": "sisters_city_walk", "name": "Sisters Beauty Lounge", "query": "Sisters Beauty Lounge, City Walk, Dubai, United Arab Emirates", "source_ids": ["sisters_locations"]},
    {"candidate_id": "sisters_jbr", "name": "Sisters Beauty Lounge", "query": "Sisters Beauty Lounge, Amwaj 4, JBR, Dubai, United Arab Emirates", "source_ids": ["sisters_locations"]},
    {"candidate_id": "sisters_al_bateen", "name": "Sisters Beauty Lounge", "query": "Sisters Beauty Lounge, Al Bateen, Abu Dhabi, United Arab Emirates", "source_ids": ["sisters_locations"]},
    {"candidate_id": "sisters_st_regis", "name": "Sisters Beauty Lounge", "query": "Sisters Beauty Lounge, St Regis Nation Towers, Abu Dhabi, United Arab Emirates", "source_ids": ["sisters_locations"]},
    {"candidate_id": "sisters_marina_mall", "name": "Sisters Beauty Lounge", "query": "Sisters Beauty Lounge, Marina Mall, Abu Dhabi, United Arab Emirates", "source_ids": ["sisters_locations"]},
    {"candidate_id": "nstyle_dubai_mall", "name": "NStyle Beauty Lounge", "query": "NStyle Beauty Lounge, Dubai Mall, Dubai, United Arab Emirates", "source_ids": ["nstyle_locations"]},
    {"candidate_id": "nstyle_dubai_marina_mall", "name": "NStyle Beauty Lounge", "query": "NStyle Beauty Lounge, Dubai Marina Mall, Dubai, United Arab Emirates", "source_ids": ["nstyle_locations"]},
    {"candidate_id": "nstyle_meadows_souk", "name": "NStyle Beauty Lounge", "query": "NStyle Beauty Lounge, Meadows Souk, Dubai, United Arab Emirates", "source_ids": ["nstyle_locations"]},
    {"candidate_id": "nstyle_mall_of_emirates", "name": "NStyle Beauty Lounge", "query": "NStyle Beauty Lounge, Mall of the Emirates, Dubai, United Arab Emirates", "source_ids": ["nstyle_locations"]},
    {"candidate_id": "nstyle_dubai_hills_mall", "name": "NStyle Beauty Lounge", "query": "NStyle Beauty Lounge, Dubai Hills Mall, Dubai, United Arab Emirates", "source_ids": ["nstyle_locations"]},
    {"candidate_id": "nstyle_arabian_ranches", "name": "NStyle Beauty Lounge", "query": "NStyle Beauty Lounge, Arabian Ranches, Dubai, United Arab Emirates", "source_ids": ["nstyle_locations"]},
    {"candidate_id": "nstyle_zero6_mall", "name": "NStyle Beauty Lounge, Zero 6 Mall, Sharjah, United Arab Emirates", "query": "NStyle Beauty Lounge, Zero 6 Mall, Sharjah, United Arab Emirates", "source_ids": ["nstyle_locations"]},
    {"candidate_id": "nstyle_deerfields_mall", "name": "NStyle Beauty Lounge", "query": "NStyle Beauty Lounge, Deerfields Mall, Abu Dhabi, United Arab Emirates", "source_ids": ["nstyle_locations"]}
]


def lookup(candidate: dict) -> dict:
    url = "https://nominatim.openstreetmap.org/search?" + urllib.parse.urlencode(
        {"q": candidate["query"], "format": "jsonv2", "limit": 3, "addressdetails": 1}
    )
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=30) as response:
        matches = json.load(response)
    return {**candidate, "request_url": url, "matches": matches}


def main() -> None:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    results = []
    for index, candidate in enumerate(CANDIDATES):
        try:
            results.append(lookup(candidate))
        except Exception as error:
            results.append({**candidate, "error": str(error), "matches": []})
        OUTPUT.write_text(json.dumps(results, indent=2, ensure_ascii=False), encoding="utf-8")
        if index < len(CANDIDATES) - 1:
            time.sleep(1.1)
    print(f"Wrote {len(results)} review-only candidate sets to {OUTPUT}")


if __name__ == "__main__":
    main()
