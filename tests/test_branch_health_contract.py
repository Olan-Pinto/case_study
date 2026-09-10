import json
import subprocess
import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class BranchHealthContractTests(unittest.TestCase):
    def test_contract_withholds_score_without_required_evidence(self):
        config = json.loads((ROOT / "config/branch_health_v1.json").read_text(encoding="utf-8"))
        self.assertEqual(config["status"], "scored_public_proxy")
        self.assertEqual(config["missingness"]["withheld_label"], "INSUFFICIENT_EVIDENCE")
        self.assertIn("permitted public reputation record", config["minimum_scoring_requirements"])

    def test_contract_validator_runs(self):
        result = subprocess.run([sys.executable, "scripts/validate_branch_health_contract.py"], cwd=ROOT, capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("withholds scores", result.stdout)


if __name__ == "__main__":
    unittest.main()
