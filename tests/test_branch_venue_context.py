import json
import subprocess
import sys
import unittest
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class BranchVenueContextTests(unittest.TestCase):
    def test_every_branch_has_one_context_and_airport_is_network_only(self):
        context = json.loads((ROOT / "data/processed/branch_venue_context_v1.json").read_text(encoding="utf-8"))
        rows = context["records"]
        self.assertEqual(len(rows), len({row["branch_id"] for row in rows}))
        airport = next(row for row in rows if row["branch_id"] == "zayed_international_airport")
        self.assertEqual(airport["venue_context"], "airport_concession")
        self.assertEqual(airport["peer_group_id"], "network_comparison_only")

    def test_peer_groups_meet_minimum_size_or_are_disclosed_as_network_only(self):
        context = json.loads((ROOT / "data/processed/branch_venue_context_v1.json").read_text(encoding="utf-8"))
        counts = Counter(row["peer_group_id"] for row in context["records"])
        self.assertGreaterEqual(counts["destination_retail"], 3)
        self.assertGreaterEqual(counts["community_or_streetfront"], 3)

    def test_context_validator_runs(self):
        result = subprocess.run([sys.executable, "scripts/validate_branch_venue_context.py"], cwd=ROOT, capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)


if __name__ == "__main__":
    unittest.main()
