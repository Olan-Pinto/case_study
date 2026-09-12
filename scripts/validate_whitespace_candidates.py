import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def main():
 c=json.loads((ROOT/'config/whitespace_v1.json').read_text()); d=json.loads((ROOT/'data/processed/whitespace_candidates_v1.json').read_text())
 assert d['model_id']==c['model_id'] and d['records']
 for r in d['records']:
  assert r['label'] in {'RESEARCH_REQUIRED','WATCH_RESEARCH','SKIP_RESEARCH'} and 0<=r['confidence']<=20 and r['competitor_pressure_lower_bound']>=0
  assert c['candidate_distance_km']['minimum_from_active_branch']<=r['nearest_active_branch_distance_km']<=c['candidate_distance_km']['maximum_from_active_branch']
  assert len(r['boundary'])>=7 and r['boundary'][0]==r['boundary'][-1]
  assert all(len(point)==2 and 51<=point[0]<=57 and 22<=point[1]<=28 for point in r['boundary'])
 print(f"VALID: {len(d['records'])} bounded research-screening cells")
if __name__=='__main__': main()
