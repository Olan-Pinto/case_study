import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
branches=json.loads((ROOT/'data/processed/branches_snapshot_v2.json').read_text())['records']
health=json.loads((ROOT/'data/processed/branch_health_v1.json').read_text())
config=json.loads((ROOT/'config/branch_health_v1.json').read_text())
active={b['branch_id'] for b in branches if 'permanently_closed' not in b['status']}
assert health['model_id']=='branch-health-v1' and {x['branch_id'] for x in health['records']}==active
for x in health['records']:
 if x['review_label']=='INSUFFICIENT_EVIDENCE':
  assert x['public_proxy_score'] is None and x['missing_requirements']
  continue
 assert 0<=x['public_proxy_score']<=100 and 0<=x['confidence']<=100
 assert x['review_label'] in {'PROTECT_REVIEW','HOLD_REVIEW','SHRINK_REVIEW'}
 assert abs(x['public_proxy_score']-sum(x['factor_contributions'].values()))<.02
 assert set(x['confidence_components'])==set(config['confidence']['required_dimensions'])
 expected_confidence=round(100*sum(x['confidence_components'].values())/len(x['confidence_components']),2)
 assert x['confidence']==expected_confidence
 score=x['public_proxy_score']; labels=config['labels']
 expected='PROTECT_REVIEW' if score>=labels['protect_review_min'] else 'SHRINK_REVIEW' if score<labels['shrink_review_max_exclusive'] else 'HOLD_REVIEW'
 assert x['review_label']==expected
print(f'VALID: {len(active)} active branch-health proxy records')
