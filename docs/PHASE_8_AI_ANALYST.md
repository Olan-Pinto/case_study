# Phase 8 — Grounded AI portfolio analyst

## Outcome

Phase 8 adds an optional, server-side natural-language analyst. The model does not calculate the portfolio scores or receive raw unrestricted files. It selects from strict, read-only functions that return committed snapshot evidence. The browser never receives `OPENAI_API_KEY`.

## Tool boundary

The allowlist is: portfolio-scope inventory, branch-reference resolution, branch profile, branch comparison, scenario metadata, one whitespace-cell profile, bounded whitespace search, and source provenance. The resolver maps an unambiguous human-friendly branch/community/address reference to a committed roster record; broad or conflicting references return candidate choices rather than a guess. Each result contains source IDs, snapshot/model IDs, and limitations. Refreshing data, arbitrary web browsing, scoring changes, writes, and operating decisions are unavailable.

The server uses the OpenAI Responses API with custom function tools, server-side instructions, `store: false`, one-at-a-time tool calls, and a four-call application limit. To preserve the no-storage setting, it explicitly carries the user item, model output item, and function-output item between tool turns rather than relying on a stored previous response. The official API supports model responses that call custom functions, explicit instructions, tool selection, and conversation continuation. [OpenAI Responses API reference](https://developers.openai.com/api/reference/cli/resources/responses/methods/create)

## No-AI fallback

Without a server-side `OPENAI_API_KEY`, `POST /api/analyst` returns `AI_DISABLED`; the map, evidence panels, and scenario workspace remain fully usable. `npm run analyst` loads the ignored local `.env` only for the server process; run Vite separately for the UI. `OPENAI_MODEL` optionally overrides the versioned default. Do not put the key in the browser or commit it.

Copy `.env.example` only for local server configuration. `.env` remains ignored and the Vite client proxy communicates with the local analyst server at `/api`; neither mechanism exposes the key in browser code.

In the workspace, the **Optional AI analyst** panel sits beneath the selected evidence. Its suggested prompt uses the selected branch and current scenario. If the server is unavailable or the key is unset, the panel says so and directs the reviewer back to the deterministic evidence; it never mimics an AI answer.

Grounded answer text is rendered as sanitized GitHub-style Markdown for readable headings, emphasis, lists, and tables. Raw HTML is not enabled. The analyst is instructed to use labelled lists rather than wide tables in the narrow evidence panel.

## Visible evidence activity

Each grounded response includes a collapsed **Evidence activity** line, for example `Evidence activity · 2 tools · 1.4 s`. Expanding it shows the approved tool title, a compact safe input summary, completion/error status, tool duration, and returned source IDs for each step. It does **not** show private model reasoning, chain-of-thought, API keys, or raw tool payloads. This gives a reviewer an auditable account of what evidence the analyst actually checked, without presenting hidden reasoning as decision evidence.

## Evaluation and limitations

`evals/analyst_eval_cases_v1.jsonl` contains test prompts for explanation, comparison, whitespace, unsupported closure requests, and unknown branches. The contract validator confirms that every expected tool is allowlisted and every fixture has prohibited claims. Node tests exercise actual tool behavior and denial paths without making an API call.

An API-backed semantic quality evaluation requires an approved runtime key and model choice. Until then, the committed fixtures and deterministic tool tests demonstrate the safety/evidence contract; they do not claim model-quality results.

With the user-provided server key, Phase 8 also completed two live smoke checks on 2026-09-10: a branch explanation successfully called the approved branch-profile tool and returned evidence/limitations; an unsupported closure question refused the decision. The key was never read, printed, or sent to the browser. These checks are smoke tests, not a replacement for a larger model evaluation run.
