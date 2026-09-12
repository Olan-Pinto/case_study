# Phase 9 — Portfolio research worklist agent

## Outcome

Phase 9 replaces the rejected manual refresh form with a useful agentic workflow: choose **Whole UAE**, **Dubai**, or **Abu Dhabi**, and the agent builds a grounded worklist of what a human should investigate next.

It is useful because it turns many branch-level evidence panels into a focused analyst brief. It does not tell Bedashing to open, close, invest in, or deprioritize a location.

## Bounded workflow

The agent has a forced first step, then a bounded choice of follow-up evidence:

`selected scope → get_portfolio_scope → branch-profile checks + permitted whitespace screen → cited research worklist → stop`

`get_portfolio_scope` returns only active records in the chosen geography and includes existing public-proxy label/confidence, competitor-pressure lower bound, nearest-own-branch spacing, validation gaps, and source IDs. It does not create a new score or business ranking.

The OpenAI Responses API supports typed custom function tools and explicit tool selection; this workflow forces the scope tool first, disallows parallel calls, and caps the run at four tool calls. [OpenAI Responses API reference](https://developers.openai.com/api/reference/cli/resources/responses/methods/create)

## Output contract

The model must return:

- **Scope reviewed** — what record set was considered.
- **Investigation worklist** — at most five numbered research priorities. Every item requires a record ID, evidence-based reason, and the next fact a human should verify.
- **Not concluded** — explicit decisions the data cannot support.

It cannot browse the web, generate new facts or scores, write data, claim financial/demand/customer outcomes, or recommend an opening or closure. The browser shows a collapsed evidence-activity trace with safe tool inputs, status, timing, and returned source IDs—not private model reasoning.

## UI walkthrough

Run `npm run analyst` and `npm run dev`. In the right panel, scroll to **Phase 9 · AI research worklist**, select a geography, then choose **Build research worklist**.

Look for a grounded response with three sections, a small actionable research queue, cited source/snapshot IDs, and an expandable evidence trace. If no server-side key is configured, the panel must show the no-AI fallback and leave the deterministic workspace usable.

## Verification

`server/portfolio-tools.test.mjs` verifies the scope tool returns only active Abu Dhabi records and its permitted whitespace area. `scripts/validate_portfolio_review.py` verifies scope, tool-budget, sequential-call, and prohibited-action policy. The evaluation fixture adds an Abu Dhabi worklist scenario requiring scope, branch-profile, and whitespace tools. Build and deterministic tests make no model call.

One live semantic smoke test remains optional and requires explicit approval because it would send the selected local portfolio evidence to the configured OpenAI API key. It should confirm the live tool sequence and output contract; it must not substitute for a broader evaluation suite.
