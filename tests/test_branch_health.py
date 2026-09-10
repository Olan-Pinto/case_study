import json, unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class BranchHealthTests(unittest.TestCase):
 def test_score_decomposition(self):
  for r in json.loads((ROOT/'data/processed/branch_health_v1.json').read_text())['records']: self.assertLess(abs(r['public_proxy_score']-sum(r['factor_contributions'].values())),.02)
 def test_airport_is_network_only(self):
  r=next(x for x in json.loads((ROOT/'data/processed/branch_health_v1.json').read_text())['records'] if x['branch_id']=='zayed_international_airport'); self.assertEqual(r['comparison_basis'],'NETWORK_COMPARISON_ONLY')
