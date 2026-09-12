import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main():
    config = json.loads((ROOT / "config/whitespace_v1.json").read_text())
    data = json.loads((ROOT / "data/processed/whitespace_candidates_v1.json").read_text())
    population = json.loads((ROOT / "data/processed/whitespace_population_context_v1.json").read_text())
    population_by_cell = {record["cell_id"]: record for record in population["records"]}
    labels = set(config["labels"]["current"])
    assert data["model_id"] == config["model_id"] and data["records"]
    assert data["research_priority_model_id"] == config["research_priority"]["model_id"]
    assert data["input_residential_context_snapshot_id"] == population["snapshot_id"]
    assert set(population_by_cell) == {record["cell_id"] for record in data["records"]}
    counts = Counter()
    for record in data["records"]:
        counts[record["label"]] += 1
        assert record["label"] in labels and record["competitor_pressure_lower_bound"] >= 0
        assert config["candidate_distance_km"]["minimum_from_active_branch"] <= record["nearest_active_branch_distance_km"] <= config["candidate_distance_km"]["maximum_from_active_branch"]
        assert len(record["boundary"]) >= 7 and record["boundary"][0] == record["boundary"][-1]
        assert all(len(point) == 2 and 51 <= point[0] <= 57 and 22 <= point[1] <= 28 for point in record["boundary"])
        source = population_by_cell[record["cell_id"]]
        assert record["estimated_residents_2025"] == source["estimated_residents_2025"]
        assert record["residential_context_coverage_status"] == source["coverage_status"]
        if source["coverage_status"] == "available":
            assert 0 <= record["research_priority_score"] <= 100
            assert record["confidence"] == 70 and not record["missing_requirements"]
            assert round(sum(record["factor_contributions"].values()), 2) == record["research_priority_score"]
        else:
            assert record["label"] == "RESEARCH_REQUIRED"
            assert record["research_priority_score"] is None and record["confidence"] == 0
            assert record["factor_values"] is None and record["factor_contributions"] is None
    assert all(counts[label] > 0 for label in labels)
    print(f"VALID: {len(data['records'])} cells; labels {dict(sorted(counts.items()))}")


if __name__ == "__main__":
    main()
