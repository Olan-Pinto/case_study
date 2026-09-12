import h3

from build_network_metrics import haversine_km


def active_branches(snapshot):
    return [record for record in snapshot["records"] if "permanently_closed" not in record["status"]]


def candidate_cells(config, snapshot):
    branches = active_branches(snapshot)
    cells = {}
    for area in config["study_scope"]["areas"]:
        south, west, north, east = area["bbox"]
        polygon = h3.LatLngPoly([(south, west), (south, east), (north, east), (north, west)])
        for cell_id in h3.polygon_to_cells(polygon, config["candidate_grid"]["resolution"]):
            latitude, longitude = h3.cell_to_latlng(cell_id)
            nearest = min(
                haversine_km(latitude, longitude, branch["latitude"], branch["longitude"])
                for branch in branches
            )
            limits = config["candidate_distance_km"]
            if limits["minimum_from_active_branch"] <= nearest <= limits["maximum_from_active_branch"]:
                cells[cell_id] = {
                    "cell_id": cell_id,
                    "study_area_id": area["id"],
                    "latitude": round(latitude, 6),
                    "longitude": round(longitude, 6),
                    "nearest_active_branch_distance_km": round(nearest, 6),
                }
    return cells
