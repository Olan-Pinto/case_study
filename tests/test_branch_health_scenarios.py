import json
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

class BranchHealthScenarioTests(unittest.TestCase):
 def setUp(self):
  self.snapshot=json.loads((ROOT/'data/processed/branch_health_scenarios_v1.json').read_text())
 def test_baseline_replays_committed_health_snapshot(self):
  baseline=next(x for x in self.snapshot['scenarios'] if x['scenario_id']=='baseline')['records']
  health=json.loads((ROOT/'data/processed/branch_health_v1.json').read_text())['records']
  self.assertEqual([(x['branch_id'],x['public_proxy_score'],x['review_label']) for x in baseline],[(x['branch_id'],x['public_proxy_score'],x['review_label']) for x in health])
 def test_scenarios_are_bounded_and_explain_their_delta(self):
  for scenario in self.snapshot['scenarios']:
   self.assertAlmostEqual(sum(scenario['weights'].values()),1)
   for record in scenario['records']:
    self.assertEqual(record['label_changed'],record['review_label'] != record['baseline_review_label'])
