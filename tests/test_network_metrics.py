import json
import unittest
from pathlib import Path

from scripts.build_network_metrics import build_metrics, equal_radius_intersection_area_km2, haversine_km


class NetworkMetricsTests(unittest.TestCase):
    def test_haversine_known_equatorial_distance(self):
        self.assertAlmostEqual(haversine_km(0, 0, 0, 1), 111.19508, places=4)

    def test_equal_circle_intersection_boundaries(self):
        self.assertEqual(equal_radius_intersection_area_km2(6, 3), 0)
        self.assertAlmostEqual(equal_radius_intersection_area_km2(0, 3), 28.274334, places=5)
        self.assertAlmostEqual(equal_radius_intersection_area_km2(3, 3), 11.055327, places=5)

    def test_generated_metrics_are_symmetric_and_reproducible(self):
        root = Path(__file__).resolve().parents[1]
        snapshot = json.loads((root / "data" / "processed" / "branches_snapshot_v2.json").read_text(encoding="utf-8"))
        config = json.loads((root / "config" / "geospatial_v1.json").read_text(encoding="utf-8"))
        committed = json.loads((root / "data" / "processed" / "network_metrics_v1.json").read_text(encoding="utf-8"))
        self.assertEqual(build_metrics(snapshot, config), committed)
        for overlap in committed["pairwise_overlaps"]:
            self.assertLess(overlap["branch_a_id"], overlap["branch_b_id"])
            self.assertGreater(overlap["intersection_area_km2"], 0)
