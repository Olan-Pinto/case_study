import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

def main():
    review=json.loads((ROOT/'config/portfolio_review_v1.json').read_text())
    analyst=json.loads((ROOT/'config/analyst_v1.json').read_text())
    assert review['required_first_tool']=='get_portfolio_scope'
    assert review['limits']['max_tool_calls']==4 and review['limits']['parallel_tool_calls'] is False
    assert set(review['scopes'])=={'uae','dubai','abu_dhabi'}
    assert review['required_first_tool'] in analyst['allowlisted_tools']
    assert 'opening or closure recommendation' in review['prohibited']
    print('VALID: portfolio review agent contract')

if __name__=='__main__': main()
