import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def main():
 c=json.loads((ROOT/'config/whitespace_v1.json').read_text())
 assert c['model_id']=='whitespace-v1' and c['status']=='contract_only_not_scored'
 assert c['candidate_grid']['system']=='h3' and c['candidate_grid']['resolution']==8
 assert c['missingness']['withheld_label']=='RESEARCH_REQUIRED'
 assert 'unsupported_demand_claim' in c['exclusions']
 assert 'GROW_RESEARCH' in c['labels']['future']
 print('VALID: whitespace v1 contract withholds unsupported opportunity labels')
if __name__=='__main__': main()
