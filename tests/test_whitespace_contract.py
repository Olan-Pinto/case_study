import json,unittest
import h3
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class WhitespaceContractTests(unittest.TestCase):
 def test_no_demand_imputation(self):
  c=json.loads((ROOT/'config/whitespace_v1.json').read_text()); self.assertEqual(c['missingness']['withheld_label'],'RESEARCH_REQUIRED')
 def test_h3_resolution_and_sensitivity_are_versioned(self):
  c=json.loads((ROOT/'config/whitespace_v1.json').read_text()); self.assertEqual(c['candidate_grid']['resolution'],8); self.assertEqual(c['candidate_grid']['sensitivity_resolutions'],[7,9])
 def test_active_anchors_are_traceable(self):
  c=json.loads((ROOT/'config/whitespace_v1.json').read_text())
  self.assertTrue(all(anchor['source_ids'] for anchor in c['urban_context_anchors']))

class WhitespaceCandidateTests(unittest.TestCase):
 def setUp(self):
  self.config=json.loads((ROOT/'config/whitespace_v1.json').read_text())
  self.records=json.loads((ROOT/'data/processed/whitespace_candidates_v1.json').read_text())['records']
 def test_labels_respect_screening_boundaries(self):
  skip=self.config['saturation']['skip_pressure_at_or_above']
  for record in self.records:
   if record['label']=='SKIP_RESEARCH': self.assertGreaterEqual(record['competitor_pressure_lower_bound'],skip)
   if record['label']=='WATCH_RESEARCH': self.assertLess(record['competitor_pressure_lower_bound'],skip); self.assertLessEqual(record['nearest_high_priority_anchor_km'],2)
   if record['label']=='RESEARCH_REQUIRED': self.assertLess(record['competitor_pressure_lower_bound'],skip); self.assertGreater(record['nearest_high_priority_anchor_km'],2)
 def test_never_emits_an_opening_recommendation(self):
  self.assertTrue(all(record['label']!='GROW_RESEARCH' for record in self.records))
 def test_boundaries_are_closed_h3_polygons_not_centroid_symbols(self):
  for record in self.records:
   expected=[[round(lon,6),round(lat,6)] for lat,lon in h3.cell_to_boundary(record['cell_id'])]
   expected.append(expected[0])
   self.assertEqual(record['boundary'],expected)
   self.assertEqual(record['boundary'][0],record['boundary'][-1])
