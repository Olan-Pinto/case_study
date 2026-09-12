"""Replay bounded branch-health weight scenarios without changing source evidence."""
from __future__ import annotations
import copy
import json
from collections import Counter
from pathlib import Path
from build_branch_health import build_records

ROOT = Path(__file__).resolve().parents[1]

def main():
    base_config=json.loads((ROOT/'config/branch_health_v1.json').read_text())
    config=json.loads((ROOT/'config/branch_health_scenarios_v1.json').read_text())
    baseline={r['branch_id']:r for r in build_records(base_config)}
    scenarios=[]
    for scenario in config['scenarios']:
        model_config=copy.deepcopy(base_config); model_config['weights']=scenario['weights']
        records=[]
        for record in build_records(model_config):
            base=baseline[record['branch_id']]
            record['baseline_public_proxy_score']=base['public_proxy_score']
            record['score_delta']=None if record['public_proxy_score'] is None or base['public_proxy_score'] is None else round(record['public_proxy_score']-base['public_proxy_score'],2)
            record['baseline_review_label']=base['review_label']
            record['label_changed']=record['review_label'] != base['review_label']
            records.append(record)
        scenarios.append({**scenario,'label_counts':dict(sorted(Counter(r['review_label'] for r in records).items())),'records':records})
    output={
      'model_id':config['model_id'],
      'status':'deterministic_scenario_replay',
      'base_model_id':config['base_model_id'],
      'input_branch_snapshot_id':'bedashing-branches-v1-2026-09-08',
      'source_ids':['2gis_branch_roster','user_validated_google_maps_2026_09_09','sisters_locations','nstyle_locations','user_geospatial_validation_2026_09_09'],
      'interpretation':'Named weight sensitivity only. The output is a public-proxy scenario, not a financial forecast or operating decision.',
      'scenarios':scenarios,
    }
    (ROOT/'data/processed/branch_health_scenarios_v1.json').write_text(json.dumps(output,indent=2)+'\n')
    print(f"Wrote {len(scenarios)} deterministic scenarios for {len(baseline)} active branches")

if __name__=='__main__': main()
