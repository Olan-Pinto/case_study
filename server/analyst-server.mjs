import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import OpenAI from 'openai'
import { executeTool, TOOL_DEFINITIONS } from './portfolio-tools.mjs'
import { toPublicToolActivity } from './analyst-observability.mjs'

const analystConfig = JSON.parse(readFileSync(new URL('../config/analyst_v1.json', import.meta.url), 'utf8'))
const portfolioReviewConfig = JSON.parse(readFileSync(new URL('../config/portfolio_review_v1.json', import.meta.url), 'utf8'))

const port = Number(process.env.ANALYST_PORT ?? 8787)
const maxQuestion = analystConfig.limits.max_question_characters
const instructions = `You are a cautious Bedashing portfolio analyst. Use only the supplied function tools for portfolio-specific facts. Before answering a portfolio question, call one or more tools. If a user gives a human-friendly branch, community, or address name instead of an exact branch_id, call resolve_branch_reference first. Use only a resolved_active_branch result; if ambiguous or not found, ask the user to choose from returned candidates and never guess. State source IDs, model or snapshot IDs, numeric values, and limitations from tool results. For multiple records, use a numbered list with one compact set of labelled facts per record; do not use wide Markdown tables. Valid scenario IDs are baseline, reputation_priority, competitor_pressure_priority, and network_spacing_priority; use baseline when a scenario is not specified. Do not invent facts, identifiers, or scenario IDs; use external web data; alter data; make recommendations to open or close; or claim revenue, profit, demand, customer behavior, or financial health. If evidence is missing, say so plainly.`
const portfolioReviewInstructions = `${instructions} You are now creating a portfolio research worklist, not answering a general question. The first tool call is the selected get_portfolio_scope. After it, call at least one get_branch_profile for a branch selected from that returned scope and one permitted search_opportunity_cells query for a WATCH_RESEARCH screen. You may use at most four calls total and must not inspect data outside the selected scope. Output exactly these sections: ## Scope reviewed; ## Investigation worklist (a numbered list of at most five research priorities, each with a record ID, an evidence-based reason, and the next fact a human should verify); ## Not concluded. Priorities mean where more investigation is justified, not a rank of business actions. Cite source IDs or snapshot/model IDs supplied by tools, and state scope/completeness limitations.`

function respond(response, status, body) { response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': 'http://localhost:5173' }); response.end(JSON.stringify(body)) }
function readBody(request) { return new Promise((resolve, reject) => { let body = ''; request.on('data', (chunk) => { body += chunk; if (body.length > 10_000) reject(new Error('Body too large')) }); request.on('end', () => resolve(body)); request.on('error', reject) }) }
function disabled() { return { status: analystConfig.fallback.status, message: analystConfig.fallback.message, fallback: 'Use the deterministic branch evidence, scenario selector, and whitespace layer without AI.', evidence: [], activity_trace: [], elapsed_ms: 0 } }

async function ask(question, options = {}) {
  const startedAt = Date.now()
  const requestInstructions = options.instructions ?? instructions
  const maxToolCalls = options.maxToolCalls ?? analystConfig.limits.max_tool_calls
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const input = [{ role: 'user', content: question }]
  let response = await client.responses.create({ model: process.env.OPENAI_MODEL ?? analystConfig.provider.default_model, input, instructions: requestInstructions, tools: TOOL_DEFINITIONS, tool_choice: options.firstToolChoice ?? 'auto', parallel_tool_calls: false, store: false, text: { verbosity: 'low' } })
  const evidence = []
  const activityTrace = []
  for (let round = 0; round < maxToolCalls; round += 1) {
    const calls = response.output.filter((item) => item.type === 'function_call')
    if (!calls.length) break
    const outputs = calls.map((call) => {
      const toolStartedAt = Date.now()
      let args = {}
      try { args = JSON.parse(call.arguments) } catch { args = {} }
      const result = executeTool(call.name, args)
      evidence.push({ tool_name: call.name, result })
      activityTrace.push(toPublicToolActivity({ step: activityTrace.length + 1, toolName: call.name, args, result, durationMs: Date.now() - toolStartedAt }))
      return { type: 'function_call_output', call_id: call.call_id, output: JSON.stringify(result) }
    })
    input.push(...response.output, ...outputs)
    response = await client.responses.create({ model: process.env.OPENAI_MODEL ?? analystConfig.provider.default_model, input, instructions: requestInstructions, tools: TOOL_DEFINITIONS, parallel_tool_calls: false, store: false, text: { verbosity: 'low' } })
  }
  const elapsed_ms = Date.now() - startedAt
  if (!evidence.length) return { status: 'AI_INSUFFICIENT_GROUNDING', message: 'The analyst did not retrieve approved evidence, so it is withholding an answer.', fallback: 'Use the deterministic workspace or ask a narrower question about a known branch, scenario, source, or whitespace cell.', evidence: [], activity_trace: activityTrace, elapsed_ms }
  return { status: 'ok', answer: response.output_text, evidence, activity_trace: activityTrace, elapsed_ms, model: response.model, limitations: ['AI synthesizes read-only tool results; it does not calculate scores or make business decisions.'] }
}

createServer(async (request, response) => {
  if (request.method === 'OPTIONS') return respond(response, 204, {})
  if (request.method !== 'POST') return respond(response, 404, { status: 'NOT_FOUND' })
  try {
    const body = JSON.parse(await readBody(request))
    if (request.url === '/api/portfolio-review') {
      const scope = body?.scope
      if (typeof scope !== 'string' || !portfolioReviewConfig.scopes[scope]) return respond(response, 400, { status: 'INVALID_SCOPE', message: 'scope must be one of: uae, dubai, abu_dhabi' })
      if (!process.env.OPENAI_API_KEY) return respond(response, 503, { ...disabled(), fallback: 'Start the local analyst server with a server-side key to create a tool-grounded review worklist. The deterministic workspace remains available without AI.' })
      const result = await ask(`Create the bounded research worklist for the ${scope} scope.`, { instructions: portfolioReviewInstructions, maxToolCalls: portfolioReviewConfig.limits.max_tool_calls, firstToolChoice: { type: 'function', name: portfolioReviewConfig.required_first_tool } })
      return respond(response, 200, { ...result, workflow_id: portfolioReviewConfig.workflow_id, scope, scope_label: portfolioReviewConfig.scopes[scope].label })
    }
    if (request.url !== '/api/analyst') return respond(response, 404, { status: 'NOT_FOUND' })
    if (!process.env.OPENAI_API_KEY) return respond(response, 503, disabled())
    const question = body?.question
    if (typeof question !== 'string' || !question.trim() || question.length > maxQuestion) return respond(response, 400, { status: 'INVALID_QUESTION', message: `question must be 1–${maxQuestion} characters` })
    return respond(response, 200, await ask(question.trim()))
  } catch (error) { return respond(response, 500, { status: 'ANALYST_ERROR', message: 'The analyst could not complete this request.', detail: error instanceof Error ? error.message : 'unknown error' }) }
}).listen(port, () => console.log(`Portfolio analyst server listening on http://localhost:${port}`))
