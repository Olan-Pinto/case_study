import copy, json, sys, unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from build_branch_health import build_records, label_for_score, load_datasets

class BranchHealthTests(unittest.TestCase):
 def test_score_decomposition(self):
  for r in json.loads((ROOT/'data/processed/branch_health_v1.json').read_text())['records']: self.assertLess(abs(r['public_proxy_score']-sum(r['factor_contributions'].values())),.02)
 def test_airport_is_network_only(self):
  r=next(x for x in json.loads((ROOT/'data/processed/branch_health_v1.json').read_text())['records'] if x['branch_id']=='zayed_international_airport'); self.assertEqual(r['comparison_basis'],'NETWORK_COMPARISON_ONLY')

 def test_displayed_thresholds_and_labels_cannot_disagree(self):
  config=json.loads((ROOT/'config/branch_health_v1.json').read_text())
  self.assertEqual(label_for_score(64.999,config),'PROTECT_REVIEW')
  self.assertEqual(label_for_score(35.0,config),'HOLD_REVIEW')
  self.assertEqual(label_for_score(34.994,config),'SHRINK_REVIEW')

 def test_confidence_matches_declared_components(self):
  config=json.loads((ROOT/'config/branch_health_v1.json').read_text())
  required=set(config['confidence']['required_dimensions'])
  for record in build_records(config):
   self.assertEqual(set(record['confidence_components']),required)
   expected=round(100*sum(record['confidence_components'].values())/len(required),2)
   self.assertEqual(record['confidence'],expected)

 def test_missing_reputation_is_withheld_instead_of_crashing(self):
  config=json.loads((ROOT/'config/branch_health_v1.json').read_text())
  datasets=copy.deepcopy(load_datasets())
  target=next(r for r in datasets['reputation']['records'] if r['branch_id']=='al_khaleej_al_arabi')
  target['rating_value']=None
  result=next(r for r in build_records(config,datasets) if r['branch_id']=='al_khaleej_al_arabi')
  self.assertEqual(result['review_label'],'INSUFFICIENT_EVIDENCE')
  self.assertIsNone(result['public_proxy_score'])
  self.assertIn('public_reputation',result['missing_requirements'])
