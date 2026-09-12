import json
from pathlib import Path
import h3
from build_network_metrics import haversine_km
ROOT=Path(__file__).resolve().parents[1]
def cell_boundary_geojson(cell):
 points=[[round(lon,6),round(lat,6)] for lat,lon in h3.cell_to_boundary(cell)]
 return points+[points[0]]

def main():
 c=json.loads((ROOT/'config/whitespace_v1.json').read_text()); snapshot=json.loads((ROOT/'data/processed/branches_snapshot_v2.json').read_text()); branches=snapshot['records']; active=[b for b in branches if 'permanently_closed' not in b['status']]
 population_context=json.loads((ROOT/'data/processed/whitespace_population_context_v1.json').read_text()); population_by_cell={r['cell_id']:r for r in population_context['records']}
 competitors=json.loads((ROOT/'data/processed/competitors_snapshot_v1.json').read_text())['records']; weights={'direct_premium_full_service':1.0,'near_direct_premium_beauty':.7}
 rows=[]
 for area in c['study_scope']['areas']:
  a,b,d,e=area['bbox']; poly=h3.LatLngPoly([(a,b),(a,e),(d,e),(d,b)])
  for cell in h3.polygon_to_cells(poly,c['candidate_grid']['resolution']):
   lat,lon=h3.cell_to_latlng(cell); nearest=min(haversine_km(lat,lon,x['latitude'],x['longitude']) for x in active)
   if c['candidate_distance_km']['minimum_from_active_branch']<=nearest<=c['candidate_distance_km']['maximum_from_active_branch']:
    rows.append({'cell_id':cell,'study_area_id':area['id'],'latitude':round(lat,6),'longitude':round(lon,6),'boundary':cell_boundary_geojson(cell),'nearest_active_branch_distance_km':round(nearest,6),'label':'RESEARCH_REQUIRED','confidence':0,'limitations':['No source-backed built-environment or demand input; no GROW/WATCH/SKIP label.']})
 anchors=[x for x in c['urban_context_anchors'] if x['status']=='active' and x['role']=='high_priority']
 for row in rows:
  nearest=min(haversine_km(row['latitude'],row['longitude'],x['latitude'],x['longitude']) for x in anchors)
  row['nearest_high_priority_anchor_km']=round(nearest,6)
  pressure=sum(weights.get(x['taxonomy_class'],0)*__import__('math').exp(-haversine_km(row['latitude'],row['longitude'],x['latitude'],x['longitude'])/c['saturation']['competitor_decay_km']) for x in competitors if x['latitude'] is not None and 'permanently_closed' not in x['status'])
  row['competitor_pressure_lower_bound']=round(pressure,6)
  row['label']='SKIP_RESEARCH' if pressure>=c['saturation']['skip_pressure_at_or_above'] else 'WATCH_RESEARCH' if nearest<=2 else 'RESEARCH_REQUIRED'
  row['confidence']=20 if row['label']=='WATCH_RESEARCH' else 10 if row['label']=='SKIP_RESEARCH' else 0
  residential=population_by_cell.get(row['cell_id'])
  if residential is None: raise ValueError(f"Missing residential context record for {row['cell_id']}")
  row['estimated_residents_2025']=residential['estimated_residents_2025']
  row['residential_intensity_percentile_within_study_area']=residential['residential_intensity_percentile_within_study_area']
  row['residential_context_coverage_status']=residential['coverage_status']
  row['limitations']=['Residential population is a modelled context signal and is not yet used in the research label; it is not observed customers, spending power, footfall, or salon demand.']
 source_ids={'2gis_branch_roster','sisters_locations','nstyle_locations'}
 for anchor in c['urban_context_anchors']:
  source_ids.update(anchor['source_ids'])
 source_ids.update(population_context['source_ids'])
 out={'model_id':c['model_id'],'status':'anchor_saturation_and_residential_context_candidate_cells','input_branch_snapshot_id':snapshot['snapshot_id'],'input_residential_context_snapshot_id':population_context['snapshot_id'],'source_ids':sorted(source_ids),'residential_context':{'source_ids':population_context['source_ids'],'source_url':'https://hub.worldpop.org/geodata/listing?id=135','year':population_context['source_year'],'release':population_context['source_release'],'interpretation':population_context['interpretation'],'label_role':'Evidence only; not yet used in WATCH/SKIP/RESEARCH_REQUIRED labels.','missingness_rule':population_context['coverage']['missingness_rule']},'records':sorted(rows,key=lambda x:(x['study_area_id'],x['cell_id']))}
 (ROOT/'data/processed/whitespace_candidates_v1.json').write_text(json.dumps(out,indent=2)+'\n'); print(f'Wrote {len(rows)} bounded research-screening cells')
if __name__=='__main__': main()
