import json
import math
from pathlib import Path

import h3

from build_network_metrics import haversine_km
from whitespace_grid import candidate_cells


ROOT = Path(__file__).resolve().parents[1]


def clamp(value):
    return max(0.0, min(1.0, value))


def competitor_market_validation(pressure):
    if pressure <= 0.75:
        return clamp(pressure / 0.75)
    return clamp((1.5 - pressure) / 0.75)


def research_label(score, thresholds):
    if score >= thresholds["prioritize_research_at_or_above"]:
        return "PRIORITIZE_RESEARCH"
    if score >= thresholds["watch_research_at_or_above"]:
        return "WATCH_RESEARCH"
    return thresholds["otherwise"]


def cell_boundary_geojson(cell_id):
    points = [[round(lon, 6), round(lat, 6)] for lat, lon in h3.cell_to_boundary(cell_id)]
    return points + [points[0]]


def main():
    config = json.loads((ROOT / "config/whitespace_v1.json").read_text())
    snapshot = json.loads((ROOT / "data/processed/branches_snapshot_v2.json").read_text())
    population = json.loads((ROOT / "data/processed/whitespace_population_context_v1.json").read_text())
    population_by_cell = {record["cell_id"]: record for record in population["records"]}
    competitors = json.loads((ROOT / "data/processed/competitors_snapshot_v1.json").read_text())["records"]
    competitor_weights = {"direct_premium_full_service": 1.0, "near_direct_premium_beauty": 0.7}
    anchors = [anchor for anchor in config["urban_context_anchors"] if anchor["status"] == "active" and anchor["role"] == "high_priority"]
    priority = config["research_priority"]
    rows = []

    for cell_id, row in candidate_cells(config, snapshot).items():
        row["boundary"] = cell_boundary_geojson(cell_id)
        row["nearest_high_priority_anchor_km"] = round(min(
            haversine_km(row["latitude"], row["longitude"], anchor["latitude"], anchor["longitude"])
            for anchor in anchors
        ), 6)
        pressure = sum(
            competitor_weights.get(competitor["taxonomy_class"], 0)
            * math.exp(-haversine_km(row["latitude"], row["longitude"], competitor["latitude"], competitor["longitude"]) / config["saturation"]["competitor_decay_km"])
            for competitor in competitors
            if competitor["latitude"] is not None and "permanently_closed" not in competitor["status"]
        )
        row["competitor_pressure_lower_bound"] = round(pressure, 6)
        residential = population_by_cell.get(cell_id)
        if residential is None:
            raise ValueError(f"Missing residential context record for {cell_id}")
        row["estimated_residents_2025"] = residential["estimated_residents_2025"]
        row["residential_intensity_percentile_within_study_area"] = residential["residential_intensity_percentile_within_study_area"]
        row["residential_context_coverage_status"] = residential["coverage_status"]

        if residential["coverage_status"] != "available":
            row.update({
                "research_priority_score": None,
                "label": priority["thresholds"]["missing_required_evidence"],
                "confidence": 0,
                "factor_values": None,
                "factor_contributions": None,
                "missing_requirements": ["residential_population_context"],
                "limitations": ["Research-priority score withheld because required WorldPop coverage is unavailable. Missing evidence is not zero demand."],
            })
        else:
            values = {
                "residential_intensity": residential["residential_intensity_percentile_within_study_area"] / 100,
                "own_network_spacing": clamp((row["nearest_active_branch_distance_km"] - 3) / 5),
                "urban_context_proximity": clamp(1 - row["nearest_high_priority_anchor_km"] / 5),
                "competitor_market_validation": competitor_market_validation(pressure),
            }
            contributions = {name: round(100 * value * priority["weights"][name], 2) for name, value in values.items()}
            score = round(sum(contributions.values()), 2)
            row.update({
                "research_priority_score": score,
                "label": research_label(score, priority["thresholds"]),
                "confidence": priority["confidence"]["score_when_required_evidence_available"],
                "factor_values": {name: round(value, 6) for name, value in values.items()},
                "factor_contributions": contributions,
                "missing_requirements": [],
                "limitations": ["This score orders a manual research queue from public proxies. It is not a probability, forecast, site recommendation, or evidence of customers, spending, footfall, revenue, or profitability."],
            })
        rows.append(row)

    source_ids = {"2gis_branch_roster", "sisters_locations", "nstyle_locations"}
    for anchor in config["urban_context_anchors"]:
        source_ids.update(anchor["source_ids"])
    source_ids.update(population["source_ids"])
    output = {
        "model_id": config["model_id"],
        "research_priority_model_id": priority["model_id"],
        "status": "bounded_public_proxy_research_priority",
        "input_branch_snapshot_id": snapshot["snapshot_id"],
        "input_residential_context_snapshot_id": population["snapshot_id"],
        "source_ids": sorted(source_ids),
        "research_priority": priority,
        "residential_context": {
            "source_ids": population["source_ids"],
            "source_url": "https://hub.worldpop.org/geodata/listing?id=135",
            "year": population["source_year"],
            "release": population["source_release"],
            "interpretation": population["interpretation"],
            "label_role": "Required 50-point research-priority factor when coverage is available; never treated as customers or demand.",
            "missingness_rule": population["coverage"]["missingness_rule"],
        },
        "records": sorted(rows, key=lambda item: (item["study_area_id"], item["cell_id"])),
    }
    (ROOT / "data/processed/whitespace_candidates_v1.json").write_text(json.dumps(output, indent=2) + "\n")
    print(f"Wrote {len(rows)} bounded research-priority cells")


if __name__ == "__main__":
    main()
