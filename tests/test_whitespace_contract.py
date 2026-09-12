import json
import sys
import unittest
from pathlib import Path

import h3

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from build_whitespace_candidates import competitor_market_validation


class WhitespaceContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.config = json.loads((ROOT / "config/whitespace_v1.json").read_text())

    def test_weights_sum_to_one_and_missing_required_evidence_is_declared(self):
        priority = self.config["research_priority"]
        self.assertAlmostEqual(sum(priority["weights"].values()), 1)
        self.assertEqual(priority["required_evidence"], ["residential_population_context"])
        self.assertEqual(self.config["missingness"]["withheld_label"], "RESEARCH_REQUIRED")

    def test_h3_resolution_and_sensitivity_are_versioned(self):
        self.assertEqual(self.config["candidate_grid"]["resolution"], 8)
        self.assertEqual(self.config["candidate_grid"]["sensitivity_resolutions"], [7, 9])

    def test_competitor_transform_rewards_validation_then_penalizes_pressure(self):
        self.assertEqual(competitor_market_validation(0), 0)
        self.assertEqual(competitor_market_validation(0.75), 1)
        self.assertEqual(competitor_market_validation(1.5), 0)
        self.assertLess(competitor_market_validation(1.0), competitor_market_validation(0.75))
        self.assertEqual(competitor_market_validation(2.0), 0)


class WhitespaceCandidateTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.config = json.loads((ROOT / "config/whitespace_v1.json").read_text())
        cls.snapshot = json.loads((ROOT / "data/processed/whitespace_candidates_v1.json").read_text())
        cls.records = cls.snapshot["records"]
        cls.population = json.loads((ROOT / "data/processed/whitespace_population_context_v1.json").read_text())

    def test_scores_decompose_and_labels_respect_thresholds(self):
        thresholds = self.config["research_priority"]["thresholds"]
        for record in self.records:
            score = record["research_priority_score"]
            if score is None:
                self.assertEqual(record["label"], "RESEARCH_REQUIRED")
                continue
            self.assertAlmostEqual(sum(record["factor_contributions"].values()), score, places=2)
            expected = "PRIORITIZE_RESEARCH" if score >= thresholds["prioritize_research_at_or_above"] else "WATCH_RESEARCH" if score >= thresholds["watch_research_at_or_above"] else "DEPRIORITIZE_RESEARCH"
            self.assertEqual(record["label"], expected)

    def test_missing_population_is_never_imputed_or_scored(self):
        population_by_cell = {record["cell_id"]: record for record in self.population["records"]}
        for record in self.records:
            source = population_by_cell[record["cell_id"]]
            if source["coverage_status"] == "no_valid_raster_pixels":
                self.assertIsNone(record["estimated_residents_2025"])
                self.assertIsNone(record["research_priority_score"])
                self.assertEqual(record["missing_requirements"], ["residential_population_context"])

    def test_never_emits_a_business_action(self):
        prohibited = set(self.config["labels"]["prohibited"])
        self.assertTrue(all(record["label"] not in prohibited for record in self.records))

    def test_boundaries_are_closed_h3_polygons_not_centroid_symbols(self):
        for record in self.records:
            expected = [[round(lon, 6), round(lat, 6)] for lat, lon in h3.cell_to_boundary(record["cell_id"])]
            expected.append(expected[0])
            self.assertEqual(record["boundary"], expected)


if __name__ == "__main__":
    unittest.main()
