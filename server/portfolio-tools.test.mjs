import test from 'node:test'
import assert from 'node:assert/strict'
import { executeTool } from './portfolio-tools.mjs'
import { toPublicToolActivity } from './analyst-observability.mjs'

test('portfolio-scope tool returns only active Abu Dhabi evidence and its permitted research area', () => {
  const result=executeTool('get_portfolio_scope',{scope:'abu_dhabi'})
  assert.equal(result.status,'ok'); assert.equal(result.data.scope,'abu_dhabi'); assert.equal(result.data.permitted_whitespace_study_areas[0],'abu_dhabi_city_cluster')
  assert.ok(result.data.profiles.length>0); assert.ok(result.data.profiles.every((profile)=>profile.emirate==='Abu Dhabi'))
  assert.ok(result.data.profiles.every((profile)=>profile.review_label && profile.source_ids.length>0))
})

test('branch profile returns scenario evidence and source IDs', () => {
  const result=executeTool('get_branch_profile',{branch_id:'saeed_bin_saif_al_falahi',scenario_id:'baseline'})
  assert.equal(result.status,'ok'); assert.equal(result.data.scenario_health.baseline_public_proxy_score,result.data.scenario_health.public_proxy_score); assert.ok(result.source_ids.includes('user_validated_google_maps_2026_09_09'))
})
test('unknown branch cannot be invented', () => {
  const result=executeTool('get_branch_profile',{branch_id:'not-a-branch',scenario_id:'baseline'})
  assert.equal(result.status,'error'); assert.equal(result.error.code,'NOT_FOUND')
})
test('human-friendly Al Nahyan reference resolves to its one active roster branch', () => {
  const resolution=executeTool('resolve_branch_reference',{reference:'Al Nahyan'})
  assert.equal(resolution.status,'ok'); assert.equal(resolution.data.resolution,'resolved_active_branch'); assert.equal(resolution.data.branch.branch_id,'saeed_bin_saif_al_falahi')
  const profile=executeTool('get_branch_profile',{branch_id:'Al Nahyan',scenario_id:'baseline'})
  assert.equal(profile.status,'ok'); assert.equal(profile.data.resolved_reference.branch_id,'saeed_bin_saif_al_falahi')
})
test('broad Abu Dhabi reference is surfaced as ambiguous instead of guessed', () => {
  const resolution=executeTool('resolve_branch_reference',{reference:'Abu Dhabi'})
  assert.equal(resolution.status,'ok'); assert.equal(resolution.data.resolution,'ambiguous'); assert.ok(resolution.data.total_candidates>1)
})
test('opportunity search honors the bounded label and limit', () => {
  const result=executeTool('search_opportunity_cells',{label:'WATCH_RESEARCH',study_area_id:'abu_dhabi_city_cluster',limit:2})
  assert.equal(result.status,'ok'); assert.ok(result.data.records.length<=2); assert.ok(result.data.records.every((record)=>record.label==='WATCH_RESEARCH'))
})
test('write-like or unknown tools are denied', () => {
  assert.equal(executeTool('refresh_everything',{}).error.code,'TOOL_NOT_ALLOWED')
})

test('activity trace provides safe evidence observability rather than raw tool payloads', () => {
  const result=executeTool('get_branch_profile',{branch_id:'saeed_bin_saif_al_falahi',scenario_id:'baseline'})
  const activity=toPublicToolActivity({step:1,toolName:'get_branch_profile',args:{branch_id:'saeed_bin_saif_al_falahi',scenario_id:'baseline'},result,durationMs:12.8})
  assert.deepEqual(activity.input,{branch_id:'saeed_bin_saif_al_falahi',scenario_id:'baseline'})
  assert.equal(activity.title,'Checked branch evidence'); assert.equal(activity.status,'completed'); assert.equal(activity.duration_ms,13)
  assert.ok(activity.source_ids.includes('user_validated_google_maps_2026_09_09')); assert.equal('data' in activity,false)
})
