import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const json = (path) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const branchSnapshot = json('data/processed/branches_snapshot_v2.json')
const metrics = json('data/processed/network_metrics_v1.json')
const pressure = json('data/processed/competitor_pressure_v1.json')
const health = json('data/processed/branch_health_v1.json')
const scenarios = json('data/processed/branch_health_scenarios_v1.json')
const reputation = json('data/processed/branch_reputation_snapshot_v1.json')
const venueContext = json('data/processed/branch_venue_context_v1.json')
const whitespace = json('data/processed/whitespace_candidates_v1.json')
const config = json('config/analyst_v1.json')
const portfolioReviewConfig = json('config/portfolio_review_v1.json')

const byId = (records, key) => new Map(records.map((record) => [record[key], record]))
const branchesById = byId(branchSnapshot.records, 'branch_id')
const metricsById = byId(metrics.branch_metrics, 'branch_id')
const pressureById = byId(pressure.branch_pressure, 'branch_id')
const healthById = byId(health.records, 'branch_id')
const reputationById = byId(reputation.records, 'branch_id')
const venueContextById = byId(venueContext.records, 'branch_id')
const whitespaceById = byId(whitespace.records, 'cell_id')
const scenarioById = byId(scenarios.scenarios, 'scenario_id')
const scenarioSourceIds = scenarios.source_ids ?? []

function sourceRows() {
  const [header, ...rows] = readFileSync(resolve(root, 'docs/research/source_registry.csv'), 'utf8').trim().split(/\r?\n/)
  const keys = header.split(',')
  return rows.map((row) => Object.fromEntries(keys.map((key, index) => [key, row.split(',')[index] ?? ''])))
}
const sourcesById = byId(sourceRows(), 'source_id')

function fail(code, message) { return { status: 'error', error: { code, message } } }
function envelope(tool_name, data, source_ids = []) {
  return {
    status: 'ok', tool_name, snapshot_ids: [branchSnapshot.snapshot_id, metrics.model_id, pressure.model_id, health.model_id, scenarios.model_id, whitespace.model_id],
    source_ids: [...new Set(source_ids)].sort(), limitations: ['Read-only committed snapshot evidence. Scores are public-data proxies, not financial outcomes.'], data,
  }
}
function requireString(value, field) { if (typeof value !== 'string' || !value.trim()) throw new Error(`${field} must be a non-empty string`) }
function requireArray(value, field, minimum, maximum) { if (!Array.isArray(value) || value.length < minimum || value.length > maximum || value.some((item) => typeof item !== 'string')) throw new Error(`${field} must contain ${minimum}–${maximum} string IDs`) }
function normalizeReference(value) { return value.toLowerCase().replace(/bedashing|beauty|lounge/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ') }
function branchSummary(branch) { return { branch_id: branch.branch_id, name: branch.name, emirate: branch.emirate, community: branch.community, address: branch.address, status: branch.status, profile_available: healthById.has(branch.branch_id), source_ids: branch.source_ids } }
function resolveBranchReference(reference) {
  const normalized = normalizeReference(reference)
  if (!normalized || normalized.length < 3) return { resolution: 'not_found', reference, candidates: [] }
  const tokens = normalized.split(' ').filter((token) => token.length >= 3)
  const matches = branchSnapshot.records.map((branch) => {
    const fields = { branch_id: normalizeReference(branch.branch_id), name: normalizeReference(branch.name), community: normalizeReference(branch.community), address: normalizeReference(branch.address), emirate: normalizeReference(branch.emirate) }
    const combined = Object.values(fields).join(' ')
    const matchingField = Object.entries(fields).find(([, value]) => value === normalized || value.includes(normalized))?.[0]
    const matchesAllTokens = tokens.length > 0 && tokens.every((token) => combined.includes(token))
    if (!matchingField && !matchesAllTokens) return null
    const rank = matchingField === 'branch_id' ? 4 : matchingField === 'community' ? 3 : matchingField ? 2 : 1
    return { branch, rank, matching_field: matchingField ?? 'combined_location_terms' }
  }).filter(Boolean).sort((left, right) => right.rank - left.rank || left.branch.name.localeCompare(right.branch.name))
  if (matches.length === 1) return { resolution: healthById.has(matches[0].branch.branch_id) ? 'resolved_active_branch' : 'resolved_non_active_branch', reference, matched_on: matches[0].matching_field, branch: branchSummary(matches[0].branch), candidates: [] }
  if (!matches.length) return { resolution: 'not_found', reference, candidates: [] }
  return { resolution: 'ambiguous', reference, candidates: matches.slice(0, 5).map((match) => branchSummary(match.branch)), total_candidates: matches.length }
}
function scenarioRecord(branch_id, scenario_id = 'baseline') {
  const scenario = scenarioById.get(scenario_id)
  if (!scenario) throw new Error(`Unknown scenario_id: ${scenario_id}`)
  const record = scenario.records.find((item) => item.branch_id === branch_id)
  if (!record) throw new Error(`No active branch-health record for: ${branch_id}`)
  return { scenario: { scenario_id: scenario.scenario_id, label: scenario.label, description: scenario.description, weights: scenario.weights }, record }
}
function portfolioScope(scope) {
  const scopeConfig = portfolioReviewConfig.scopes[scope]
  if (!scopeConfig) throw new Error(`Unknown portfolio scope: ${scope}`)
  const baseline = scenarioById.get('baseline')
  const profiles = branchSnapshot.records.filter((branch) => healthById.has(branch.branch_id) && (!scopeConfig.emirates || scopeConfig.emirates.includes(branch.emirate))).map((branch) => {
    const branchHealth = baseline.records.find((record) => record.branch_id === branch.branch_id)
    const branchPressure = pressureById.get(branch.branch_id)
    const branchMetric = metricsById.get(branch.branch_id)
    return {
      branch_id: branch.branch_id, name: branch.name, emirate: branch.emirate, community: branch.community,
      review_label: branchHealth.review_label, public_proxy_score: branchHealth.public_proxy_score, confidence: branchHealth.confidence,
      lower_bound_competitor_pressure: branchPressure?.verified_competitor_pressure_lower_bound ?? null,
      nearest_own_branch_distance_km: branchMetric?.nearest_own_branch_distance_km ?? null,
      validation_needed: branch.validation_needed, source_ids: branch.source_ids,
    }
  })
  return { scope, label: scopeConfig.label, active_branch_count: profiles.length, profiles, permitted_whitespace_study_areas: scopeConfig.whitespace_study_areas, interpretation: 'A public-proxy evidence inventory for prioritizing follow-up research, not a ranking of business actions.' }
}

export const TOOL_DEFINITIONS = [
  { type: 'function', name: 'get_portfolio_scope', description: 'Return the bounded active-branch evidence inventory for exactly one scope: uae, dubai, or abu_dhabi. Use this first for a portfolio-review worklist. It includes public-proxy label, confidence, competitor lower bound, spacing, validation gaps, source IDs, and permitted whitespace study areas; it is not a business-action ranking.', strict: true, parameters: { type: 'object', properties: { scope: { type: 'string', enum: ['uae', 'dubai', 'abu_dhabi'] } }, required: ['scope'], additionalProperties: false } },
  { type: 'function', name: 'resolve_branch_reference', description: 'Resolve a human-friendly Bedashing branch, community, address, or known branch ID to one committed roster record. Use before a profile lookup when the user did not supply an exact branch ID. Returns resolved, ambiguous, or not-found; never guess an ambiguous match.', strict: true, parameters: { type: 'object', properties: { reference: { type: 'string' } }, required: ['reference'], additionalProperties: false } },
  { type: 'function', name: 'get_branch_profile', description: 'Return read-only branch, geometry, competitor-pressure, health, scenario, provenance, and limitations for one known active branch ID. It also accepts one unambiguous human-friendly branch, community, or address reference.', strict: true, parameters: { type: 'object', properties: { branch_id: { type: 'string' }, scenario_id: { type: 'string' } }, required: ['branch_id', 'scenario_id'], additionalProperties: false } },
  { type: 'function', name: 'compare_branches', description: 'Compare two or three known active branch IDs using the same named scenario.', strict: true, parameters: { type: 'object', properties: { branch_ids: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 3 }, scenario_id: { type: 'string' } }, required: ['branch_ids', 'scenario_id'], additionalProperties: false } },
  { type: 'function', name: 'get_scenario', description: 'Return the declared weights, description, and review-label mix for one known scenario ID.', strict: true, parameters: { type: 'object', properties: { scenario_id: { type: 'string' } }, required: ['scenario_id'], additionalProperties: false } },
  { type: 'function', name: 'get_opportunity_profile', description: 'Return the read-only screening evidence, label, limitations, and provenance for one whitespace cell ID.', strict: true, parameters: { type: 'object', properties: { cell_id: { type: 'string' } }, required: ['cell_id'], additionalProperties: false } },
  { type: 'function', name: 'search_opportunity_cells', description: 'Return at most ten whitespace cells filtered by an optional research label and study area. These are research screens, not opening recommendations.', strict: true, parameters: { type: 'object', properties: { label: { type: ['string', 'null'] }, study_area_id: { type: ['string', 'null'] }, limit: { type: 'integer', minimum: 1, maximum: 10 } }, required: ['label', 'study_area_id', 'limit'], additionalProperties: false } },
  { type: 'function', name: 'get_source_provenance', description: 'Return durable source-registry metadata for up to ten supplied source IDs.', strict: true, parameters: { type: 'object', properties: { source_ids: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 10 } }, required: ['source_ids'], additionalProperties: false } },
]

export function executeTool(name, args) {
  try {
    if (!config.allowlisted_tools.includes(name)) return fail('TOOL_NOT_ALLOWED', `Tool is not allowlisted: ${name}`)
    if (name === 'get_portfolio_scope') {
      requireString(args.scope, 'scope')
      const data = portfolioScope(args.scope)
      return envelope(name, data, [...data.profiles.flatMap((profile) => profile.source_ids), ...scenarioSourceIds])
    }
    if (name === 'resolve_branch_reference') {
      requireString(args.reference, 'reference')
      const resolution = resolveBranchReference(args.reference)
      return envelope(name, resolution, resolution.branch?.source_ids ?? [])
    }
    if (name === 'get_branch_profile') {
      requireString(args.branch_id, 'branch_id'); requireString(args.scenario_id, 'scenario_id')
      const resolution = resolveBranchReference(args.branch_id)
      if (resolution.resolution === 'not_found') return fail('NOT_FOUND', `No committed roster branch matches: ${args.branch_id}`)
      if (resolution.resolution === 'ambiguous') return fail('AMBIGUOUS_BRANCH_REFERENCE', `More than one committed branch matches: ${args.branch_id}. Use one of: ${resolution.candidates.map((candidate) => candidate.branch_id).join(', ')}`)
      const branch = branchesById.get(resolution.branch.branch_id)
      if (!healthById.has(branch.branch_id)) return fail('INACTIVE_BRANCH_PROFILE_UNAVAILABLE', `The matched branch is not in the active health snapshot: ${branch.branch_id}`)
      const scenario = scenarioRecord(branch.branch_id, args.scenario_id)
      const reputationEvidence = reputationById.get(branch.branch_id) ?? null
      const contextEvidence = venueContextById.get(branch.branch_id) ?? null
      return envelope(name, { resolved_reference: args.branch_id === branch.branch_id ? null : { input: args.branch_id, branch_id: branch.branch_id, matched_on: resolution.matched_on }, branch, reputation_evidence: reputationEvidence, venue_context_evidence: contextEvidence, network_metrics: metricsById.get(branch.branch_id) ?? null, competitor_pressure: pressureById.get(branch.branch_id) ?? null, baseline_health: healthById.get(branch.branch_id) ?? null, scenario_health: scenario.record, scenario: scenario.scenario }, [...branch.source_ids, ...(reputationEvidence?.source_ids ?? []), ...(contextEvidence?.source_ids ?? []), ...scenarioSourceIds])
    }
    if (name === 'compare_branches') {
      requireArray(args.branch_ids, 'branch_ids', 2, 3); requireString(args.scenario_id, 'scenario_id')
      const records = args.branch_ids.map((branch_id) => {
        const branch = branchesById.get(branch_id); if (!branch) throw new Error(`Unknown branch_id: ${branch_id}`)
        const scenario = scenarioRecord(branch_id, args.scenario_id)
        return { branch: { branch_id: branch.branch_id, name: branch.name, emirate: branch.emirate, community: branch.community }, reputation_evidence: reputationById.get(branch_id) ?? null, venue_context_evidence: venueContextById.get(branch_id) ?? null, scenario_health: scenario.record, competitor_pressure: pressureById.get(branch_id) ?? null, network_metrics: metricsById.get(branch_id) ?? null, source_ids: [...new Set([...branch.source_ids, ...(reputationById.get(branch_id)?.source_ids ?? []), ...(venueContextById.get(branch_id)?.source_ids ?? [])])] }
      })
      return envelope(name, { scenario_id: args.scenario_id, records }, [...records.flatMap((record) => record.source_ids), ...scenarioSourceIds])
    }
    if (name === 'get_scenario') {
      requireString(args.scenario_id, 'scenario_id'); const scenario = scenarioById.get(args.scenario_id)
      if (!scenario) return fail('NOT_FOUND', `Unknown scenario_id: ${args.scenario_id}`)
      return envelope(name, { scenario_id: scenario.scenario_id, label: scenario.label, description: scenario.description, weights: scenario.weights, label_counts: scenario.label_counts }, ['user_validated_google_maps_2026_09_09', 'sisters_locations', 'nstyle_locations'])
    }
    if (name === 'get_opportunity_profile') {
      requireString(args.cell_id, 'cell_id'); const record = whitespaceById.get(args.cell_id)
      if (!record) return fail('NOT_FOUND', `Unknown cell_id: ${args.cell_id}`)
      return envelope(name, { record, interpretation: 'A research-screening cell, not an opening recommendation.' }, whitespace.source_ids)
    }
    if (name === 'search_opportunity_cells') {
      if (args.label !== null && !['RESEARCH_REQUIRED', 'WATCH_RESEARCH', 'SKIP_RESEARCH'].includes(args.label)) throw new Error('label is invalid')
      if (args.study_area_id !== null && !['dubai_cluster', 'abu_dhabi_city_cluster'].includes(args.study_area_id)) throw new Error('study_area_id is invalid')
      if (!Number.isInteger(args.limit) || args.limit < 1 || args.limit > 10) throw new Error('limit must be an integer between 1 and 10')
      const records = whitespace.records.filter((record) => (!args.label || record.label === args.label) && (!args.study_area_id || record.study_area_id === args.study_area_id)).slice(0, args.limit)
      return envelope(name, { records, returned_count: records.length, interpretation: 'Research screens only; absence from this limited result is not a demand conclusion.' }, whitespace.source_ids)
    }
    if (name === 'get_source_provenance') {
      requireArray(args.source_ids, 'source_ids', 1, 10)
      const records = args.source_ids.map((source_id) => sourcesById.get(source_id) ?? { source_id, status: 'not_found_in_registry' })
      return envelope(name, { records }, args.source_ids)
    }
    return fail('NOT_IMPLEMENTED', `Tool not implemented: ${name}`)
  } catch (error) { return fail('INVALID_ARGUMENT', error.message) }
}
