"""Build deterministic own-network distance and service-radius overlap metrics."""
from __future__ import annotations

import json
import math
from itertools import combinations
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
SNAPSHOT_PATH = ROOT / "data" / "processed" / "branches_snapshot_v1.json"
CONFIG_PATH = ROOT / "config" / "geospatial_v1.json"
OUTPUT_PATH = ROOT / "data" / "processed" / "network_metrics_v1.json"
MANIFEST_PATH = ROOT / "data" / "processed" / "network_metrics_v1.manifest.json"


def haversine_km(latitude_a: float, longitude_a: float, latitude_b: float, longitude_b: float, earth_radius_km: float = 6371.0088) -> float:
    """Return great-circle distance in kilometres."""
    latitude_delta = math.radians(latitude_b - latitude_a)
    longitude_delta = math.radians(longitude_b - longitude_a)
    latitude_a_radians = math.radians(latitude_a)
    latitude_b_radians = math.radians(latitude_b)
    term = math.sin(latitude_delta / 2) ** 2 + math.cos(latitude_a_radians) * math.cos(latitude_b_radians) * math.sin(longitude_delta / 2) ** 2
    return 2 * earth_radius_km * math.asin(math.sqrt(term))


def equal_radius_intersection_area_km2(distance_km: float, radius_km: float) -> float:
    """Return analytic intersection area for two equal planar circles."""
    if radius_km <= 0:
        raise ValueError("radius_km must be positive")
    if distance_km >= 2 * radius_km:
        return 0.0
    if distance_km <= 0:
        return math.pi * radius_km**2
    ratio = max(-1.0, min(1.0, distance_km / (2 * radius_km)))
    return 2 * radius_km**2 * math.acos(ratio) - (distance_km / 2) * math.sqrt(max(0.0, 4 * radius_km**2 - distance_km**2))


def rounded(value: float) -> float:
    return round(value, 6)


def build_metrics(snapshot: dict[str, Any], config: dict[str, Any]) -> dict[str, Any]:
    branches = [branch for branch in snapshot["records"] if "permanently_closed" not in branch["status"]]
    if any(branch["latitude"] is None or branch["longitude"] is None for branch in branches):
        raise ValueError("Network metrics require coordinates for every included branch")

    radii = config["radius_bands_km"]
    earth_radius = config["earth_radius_km"]
    distances: dict[tuple[str, str], float] = {}
    overlaps: list[dict[str, Any]] = []
    for first, second in combinations(branches, 2):
        key = tuple(sorted((first["branch_id"], second["branch_id"])))
        distance = haversine_km(first["latitude"], first["longitude"], second["latitude"], second["longitude"], earth_radius)
        distances[key] = distance
        for radius in radii:
            area = equal_radius_intersection_area_km2(distance, radius)
            if area > 0:
                circle_area = math.pi * radius**2
                overlaps.append({
                    "branch_a_id": key[0],
                    "branch_b_id": key[1],
                    "radius_km": radius,
                    "distance_km": rounded(distance),
                    "intersection_area_km2": rounded(area),
                    "overlap_coefficient": rounded(area / circle_area),
                })

    branch_metrics: list[dict[str, Any]] = []
    for branch in branches:
        neighbours = sorted(
            ((other["branch_id"], distances[tuple(sorted((branch["branch_id"], other["branch_id"])))]) for other in branches if other["branch_id"] != branch["branch_id"]),
            key=lambda item: (item[1], item[0]),
        )
        radius_metrics = []
        for radius in radii:
            relevant = [item for item in overlaps if item["radius_km"] == radius and branch["branch_id"] in (item["branch_a_id"], item["branch_b_id"])]
            radius_metrics.append({
                "radius_km": radius,
                "overlapping_branch_count": len(relevant),
                "sum_pairwise_intersection_area_km2": rounded(sum(item["intersection_area_km2"] for item in relevant)),
                "maximum_pairwise_overlap_coefficient": rounded(max((item["overlap_coefficient"] for item in relevant), default=0.0)),
            })
        branch_metrics.append({
            "branch_id": branch["branch_id"],
            "nearest_own_branch_id": neighbours[0][0],
            "nearest_own_branch_distance_km": rounded(neighbours[0][1]),
            "service_radius_metrics": radius_metrics,
        })

    return {
        "model_id": config["model_id"],
        "input_snapshot_id": snapshot["snapshot_id"],
        "source_ids": sorted({source_id for branch in branches for source_id in branch["source_ids"]}),
        "primary_radius_km": config["primary_radius_km"],
        "radius_bands_km": radii,
        "distance_method": config["distance_method"],
        "overlap_method": config["overlap_method"],
        "interpretation": config["interpretation"],
        "assumptions": config["assumptions"],
        "branch_metrics": branch_metrics,
        "pairwise_overlaps": overlaps,
    }


def main() -> None:
    snapshot = json.loads(SNAPSHOT_PATH.read_text(encoding="utf-8"))
    config = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    metrics = build_metrics(snapshot, config)
    OUTPUT_PATH.write_text(json.dumps(metrics, indent=2) + "\n", encoding="utf-8")
    manifest = {
        "model_id": metrics["model_id"],
        "input_snapshot_id": metrics["input_snapshot_id"],
        "input_source_ids": metrics["source_ids"],
        "config_path": "config/geospatial_v1.json",
        "output_path": "data/processed/network_metrics_v1.json",
        "branch_metric_records": len(metrics["branch_metrics"]),
        "pairwise_overlap_records": len(metrics["pairwise_overlaps"]),
        "primary_radius_km": metrics["primary_radius_km"],
        "limitation": "Geometric service-radius overlap is a screening metric, not travel time, observed customer behavior, or a recommendation.",
    }
    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(metrics['branch_metrics'])} branch metrics and {len(metrics['pairwise_overlaps'])} overlapping pairs")


if __name__ == "__main__":
    main()
