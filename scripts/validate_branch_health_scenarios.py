import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

def main():
    c=json.loads((ROOT/'config/branch_health_scenarios_v1.json').read_text())
    d=json.loads((ROOT/'data/processed/branch_health_scenarios_v1.json').read_text())
    assert d['model_id']==c['model_id'] and len(d['scenarios'])==len(c['scenarios'])
    for scenario in d['scenarios']:
        assert abs(sum(scenario['weights'].values())-1)<1e-9
        assert all(0<=weight<=1 for weight in scenario['weights'].values())
        assert scenario['records'] and sum(scenario['label_counts'].values())==len(scenario['records'])
        for record in scenario['records']:
            assert record['review_label'] in {'PROTECT_REVIEW','HOLD_REVIEW','SHRINK_REVIEW'}
            assert record['label_changed']==(record['review_label'] != record['baseline_review_label'])
    print(f"VALID: {len(d['scenarios'])} bounded branch-health scenarios")

if __name__=='__main__': main()
