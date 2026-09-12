import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def main() -> None:
    data = json.loads((ROOT / "data/processed/whitespace_population_context_v1.json").read_text())
    records = data["records"]
    coverage = data["coverage"]
    assert data["source_sha256"] == "8cf781de6e1031425dc645c743f932cf778af10a93a890a51255f76c34f2e5b9"
    assert data["source_year"] == 2025 and "alpha" in data["source_release"].lower()
    assert len(records) == coverage["candidate_cell_count"] == 1939
    assert len({record["cell_id"] for record in records}) == len(records)
    assert coverage["available_cell_count"] + coverage["no_valid_raster_pixel_cell_count"] == len(records)
    for record in records:
        if record["coverage_status"] == "available":
            assert record["assigned_raster_pixel_count"] > 0
            assert record["estimated_residents_2025"] >= 0
            assert 0 <= record["residential_intensity_percentile_within_study_area"] <= 100
        else:
            assert record["coverage_status"] == "no_valid_raster_pixels"
            assert record["assigned_raster_pixel_count"] == 0
            assert record["estimated_residents_2025"] is None
            assert record["residential_intensity_percentile_within_study_area"] is None
    print(f"VALID: WorldPop residential context for {len(records)} H3 cells")


if __name__ == "__main__":
    main()
