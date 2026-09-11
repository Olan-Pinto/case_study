import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

def main():
 c=json.loads((ROOT/'config/analyst_v1.json').read_text())
 assert c['provider']['key_environment_variable']=='OPENAI_API_KEY' and c['provider']['store'] is False
 assert c['limits']['max_tool_calls']>0 and c['limits']['parallel_tool_calls'] is False
 assert c['observability']['user_visible_activity']=='approved tool activity only'
 assert 'private model reasoning' in c['observability']['never_expose']
 fixture=[json.loads(line) for line in (ROOT/'evals/analyst_eval_cases_v1.jsonl').read_text().splitlines() if line]
 assert fixture and all(set(case['expected_tools']).issubset(c['allowlisted_tools']) for case in fixture)
 assert all(case['must_not_claim'] for case in fixture)
 print(f"VALID: analyst contract and {len(fixture)} evaluation fixtures")

if __name__=='__main__': main()
