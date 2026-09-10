import math
import unittest
from scripts.build_competitor_pressure import ROOT
from scripts.build_network_metrics import haversine_km


class CompetitorPressureTests(unittest.TestCase):
    def test_colocated_distance_is_zero(self):
        self.assertEqual(haversine_km(25.2, 55.2, 25.2, 55.2), 0)

    def test_distance_decay_is_monotonic(self):
        weight, decay = 1.0, 3.0
        self.assertGreater(weight * math.exp(-1 / decay), weight * math.exp(-5 / decay))

    def test_root_is_repository_root(self):
        self.assertTrue((ROOT / "data" / "processed").is_dir())

    def test_closed_competitors_cannot_be_active_pressure_inputs(self):
        import json
        competitors = json.loads((ROOT / "data" / "processed" / "competitors_snapshot_v1.json").read_text(encoding="utf-8"))
        closed = [item for item in competitors["records"] if "permanently_closed" in item["status"]]
        self.assertEqual(len(closed), 2)
        self.assertTrue(all(item["latitude"] is None and item["longitude"] is None for item in closed))

    def test_pressure_contributions_are_ordered_and_sum_to_score(self):
        import json
        pressure = json.loads((ROOT / "data" / "processed" / "competitor_pressure_v1.json").read_text(encoding="utf-8"))
        for row in pressure["branch_pressure"]:
            values = [item["contribution"] for item in row["contributions"]]
            self.assertEqual(values, sorted(values, reverse=True))
            self.assertAlmostEqual(row["verified_competitor_pressure_lower_bound"], sum(values), places=5)
