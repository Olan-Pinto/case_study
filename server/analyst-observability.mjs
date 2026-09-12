const activityTitles = {
  get_portfolio_scope: 'Read the selected portfolio scope',
  resolve_branch_reference: 'Matched the location to the roster',
  get_branch_profile: 'Checked branch evidence',
  compare_branches: 'Compared branch evidence',
  get_scenario: 'Checked scenario settings',
  get_opportunity_profile: 'Checked research-cell evidence',
  search_opportunity_cells: 'Searched bounded research cells',
  get_source_provenance: 'Checked source provenance',
}

function compactInput(toolName, args) {
  if (toolName === 'get_portfolio_scope') return { scope: args.scope }
  if (toolName === 'resolve_branch_reference') return { reference: args.reference }
  if (toolName === 'get_branch_profile') return { branch_id: args.branch_id, scenario_id: args.scenario_id }
  if (toolName === 'compare_branches') return { branch_ids: args.branch_ids, scenario_id: args.scenario_id }
  if (toolName === 'get_scenario') return { scenario_id: args.scenario_id }
  if (toolName === 'get_opportunity_profile') return { cell_id: args.cell_id }
  if (toolName === 'search_opportunity_cells') return { label: args.label, study_area_id: args.study_area_id, limit: args.limit }
  if (toolName === 'get_source_provenance') return { source_ids: args.source_ids }
  return {}
}

export function toPublicToolActivity({ step, toolName, args, result, durationMs }) {
  return {
    step,
    title: activityTitles[toolName] ?? 'Checked approved evidence',
    tool_name: toolName,
    input: compactInput(toolName, args),
    status: result.status === 'ok' ? 'completed' : 'returned an evidence error',
    duration_ms: Math.max(0, Math.round(durationMs)),
    source_ids: Array.isArray(result.source_ids) ? result.source_ids : [],
    error_code: result.status === 'error' ? result.error?.code ?? 'UNKNOWN_ERROR' : undefined,
  }
}
