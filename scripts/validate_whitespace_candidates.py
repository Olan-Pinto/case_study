import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def main():
 c=json.loads((ROOT/'config/whitespace_v1.json').read_text()); d=json.loads((ROOT/'data/processed/whitespace_candidates_v1.json').read_text()); population=json.loads((ROOT/'data/processed/whitespace_population_context_v1.json').read_text()); population_by_cell={r['cell_id']:r for r in population['records']}
 assert d['model_id']==c['model_id'] and d['records']
 assert d['input_residential_context_snapshot_id']==population['snapshot_id'] and set(population_by_cell)=={r['cell_id'] for r in d['records']}
 for r in d['records']:
  assert r['label'] in {'RESEARCH_REQUIRED','WATCH_RESEARCH','SKIP_RESEARCH'} and 0<=r['confidence']<=20 and r['competitor_pressure_lower_bound']>=0
  assert c['candidate_distance_km']['minimum_from_active_branch']<=r['nearest_active_branch_distance_km']<=c['candidate_distance_km']['maximum_from_active_branch']
  assert len(r['boundary'])>=7 and r['boundary'][0]==r['boundary'][-1]
  assert all(len(point)==2 and 51<=point[0]<=57 and 22<=point[1]<=28 for point in r['boundary'])
  source=population_by_cell[r['cell_id']]
  assert r['estimated_residents_2025']==source['estimated_residents_2025']
  assert r['residential_intensity_percentile_within_study_area']==source['residential_intensity_percentile_within_study_area']
  assert r['residential_context_coverage_status']==source['coverage_status']
 print(f"VALID: {len(d['records'])} bounded research-screening cells")
if __name__=='__main__': main()
