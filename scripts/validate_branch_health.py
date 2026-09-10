import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
branches=json.loads((ROOT/'data/processed/branches_snapshot_v1.json').read_text())['records']
health=json.loads((ROOT/'data/processed/branch_health_v1.json').read_text())
active={b['branch_id'] for b in branches if 'permanently_closed' not in b['status']}
assert health['model_id']=='branch-health-v1' and {x['branch_id'] for x in health['records']}==active
for x in health['records']:
 assert 0<=x['public_proxy_score']<=100 and 0<=x['confidence']<=100
 assert x['review_label'] in {'PROTECT_REVIEW','HOLD_REVIEW','SHRINK_REVIEW'}
 assert abs(x['public_proxy_score']-sum(x['factor_contributions'].values()))<.02
print(f'VALID: {len(active)} active branch-health proxy records')
