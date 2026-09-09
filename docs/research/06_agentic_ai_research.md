# Agentic AI research

## Verdict

| Concept | Verdict | Rationale |
|---|---|---|
| Tool-using analyst | ADOPT | Typed deterministic tools let the LLM translate questions into evidence-backed explanations. |
| Loop engineering | DEFER | A bounded refresh/validation loop has real later value, but is not required to demonstrate the product. |
| Graph engineering | REJECT initially | A small explicit function-calling state machine is clearer and easier to test than a graph runtime. |
| MCP | DEFER | MCP standardizes host/client/server tool integration, but an in-process tool layer should prove value first. [MCP spec](https://modelcontextprotocol.io/specification/2025-11-25/basic), accessed 2026-09-08. |
| A2A | REJECT | A2A is for communication among independent agents, absent here. [A2A docs](https://a2a-protocol.org/latest/), accessed 2026-09-08. |
| HITL | ADOPT | Require approval for snapshot/model publication, overrides and exports—not read-only analysis. |

## Proposed agent contract

Use server-side OpenAI Responses function calling with strict JSON schemas; official docs support custom tools/functions and structured schemas. [OpenAI quickstart](https://platform.openai.com/docs/quickstart/make-your-first-api-request), [Responses API reference](https://platform.openai.com/docs/api-reference/responses-streaming/response/web_search_call?lang=curl), accessed 2026-09-08.

Initial allowlisted tools: `get_branch_profile`, `get_branch_recommendation`, `compare_branches`, `get_overlap_metrics`, `get_nearby_competitors`, `search_opportunity_cells`, `get_opportunity_profile`, `run_scenario`, and `get_source_provenance`. Every tool response returns snapshot/model ID, source IDs, values, limitations, and confidence. The model cannot write recommendations, fetch unsanctioned web data, or access secrets.

Flow: classify intent -> select at most 3 tools -> validate entities/version/evidence -> synthesize only returned facts -> attach evidence references. On ambiguity or unavailable data, ask a question or state limitation. Stop after tool budget / repeated identical call. The fallback response is a deterministic template explanation.

## Observability and evaluation

Log request ID, intent, tool names/arguments (redacted), tool duration/failure, snapshot/model version, token/model usage, evidence IDs, and grounding-check result. Retain no secrets. Evaluation fixture set (later JSONL): explain a label; compare branches; rank overlap; find whitespace; scenario change; ambiguous branch name; unsupported revenue/closure request; missing source. Score tool validity, evidence coverage, numeric fidelity, abstention, and loop termination. Use a lower-cost configurable model for development; promote only if eval quality demonstrates need.

## Bounded refresh hypothesis

Later: discover -> acquire -> normalize -> diff prior snapshot -> validate -> calculate confidence -> require human approval for material delta -> publish/stop. Max retries, source evidence, anomaly thresholds, and state persistence are required. It should not be an endless chatbot reflection loop.
