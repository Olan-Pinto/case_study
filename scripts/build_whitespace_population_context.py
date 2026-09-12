import bisect
import hashlib
import json
from collections import defaultdict
from pathlib import Path

import h3
import numpy as np
import rasterio
from rasterio.windows import from_bounds


ROOT = Path(__file__).resolve().parents[1]
SOURCE_PATH = ROOT / "data/raw/worldpop/are_pop_2025_CN_100m_R2025A_v1.tif"
OUTPUT_PATH = ROOT / "data/processed/whitespace_population_context_v1.json"
SOURCE_SHA256 = "8cf781de6e1031425dc645c743f932cf778af10a93a890a51255f76c34f2e5b9"


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def percentile_ranks(values: dict[str, float]) -> dict[str, float]:
    ordered = sorted(values.values())
    if len(ordered) == 1:
        return {cell_id: 100.0 for cell_id in values}
    result = {}
    for cell_id, value in values.items():
        first = bisect.bisect_left(ordered, value)
        last = bisect.bisect_right(ordered, value) - 1
        average_rank = (first + last) / 2
        result[cell_id] = round(100 * average_rank / (len(ordered) - 1), 2)
    return result


def main() -> None:
    if not SOURCE_PATH.exists():
        raise FileNotFoundError(
            f"Missing {SOURCE_PATH}. Run: py -3 scripts/acquire_worldpop_population.py"
        )
    if sha256(SOURCE_PATH) != SOURCE_SHA256:
        raise ValueError("WorldPop raster checksum does not match the versioned source contract")

    config = json.loads((ROOT / "config/whitespace_v1.json").read_text())
    whitespace = json.loads((ROOT / "data/processed/whitespace_candidates_v1.json").read_text())
    candidate_area = {record["cell_id"]: record["study_area_id"] for record in whitespace["records"]}
    candidate_ids = set(candidate_area)
    population_by_cell = defaultdict(float)
    pixels_by_cell = defaultdict(int)

    with rasterio.open(SOURCE_PATH) as dataset:
        if str(dataset.crs) != "EPSG:4326" or dataset.count != 1:
            raise ValueError("WorldPop raster must be a single-band EPSG:4326 grid")
        for area in config["study_scope"]["areas"]:
            south, west, north, east = area["bbox"]
            window = from_bounds(west, south, east, north, dataset.transform).round_offsets().round_lengths()
            values = dataset.read(1, window=window, masked=True)
            rows, columns = np.where((~np.ma.getmaskarray(values)) & (values >= 0))
            transform = dataset.window_transform(window)
            longitudes = transform.c + (columns + 0.5) * transform.a
            latitudes = transform.f + (rows + 0.5) * transform.e
            for population, latitude, longitude in zip(values.data[rows, columns], latitudes, longitudes):
                cell_id = h3.latlng_to_cell(float(latitude), float(longitude), config["candidate_grid"]["resolution"])
                if cell_id in candidate_ids:
                    population_by_cell[cell_id] += float(population)
                    pixels_by_cell[cell_id] += 1

    missing_cells = candidate_ids - population_by_cell.keys()

    percentiles = {}
    for area in config["study_scope"]["areas"]:
        area_values = {
            cell_id: population_by_cell[cell_id]
            for cell_id, study_area_id in candidate_area.items()
            if study_area_id == area["id"] and cell_id not in missing_cells
        }
        percentiles.update(percentile_ranks(area_values))

    records = []
    for cell_id in sorted(candidate_ids):
        records.append(
            {
                "cell_id": cell_id,
                "study_area_id": candidate_area[cell_id],
                "estimated_residents_2025": None if cell_id in missing_cells else round(population_by_cell[cell_id], 2),
                "residential_intensity_percentile_within_study_area": None if cell_id in missing_cells else percentiles[cell_id],
                "assigned_raster_pixel_count": pixels_by_cell[cell_id],
                "coverage_status": "no_valid_raster_pixels" if cell_id in missing_cells else "available",
            }
        )

    output = {
        "snapshot_id": "worldpop-uae-residential-context-v1-2026-09-12",
        "source_ids": ["worldpop_global2_2025_uae", "worldpop_global2_r2025a_methodology"],
        "source_sha256": SOURCE_SHA256,
        "source_year": 2025,
        "source_release": "R2025A v1 alpha",
        "source_resolution": "3 arc-seconds (approximately 100 m at the equator)",
        "aggregation_method": "Sum non-negative raster pixels whose centres fall within each H3 resolution-8 cell; calculate relative percentile within the configured study area.",
        "interpretation": "Modelled residential-population context only; not customers, spending power, salon demand, footfall, or a forecast.",
        "coverage": {
            "candidate_cell_count": len(candidate_ids),
            "available_cell_count": len(candidate_ids) - len(missing_cells),
            "no_valid_raster_pixel_cell_count": len(missing_cells),
            "missingness_rule": "No valid raster pixel is missing evidence, not zero population; do not score or rank the cell from this signal.",
        },
        "records": records,
    }
    OUTPUT_PATH.write_text(json.dumps(output, indent=2) + "\n")
    print(f"Wrote residential context for {len(records)} H3 cells")


if __name__ == "__main__":
    main()
