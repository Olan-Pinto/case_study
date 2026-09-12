# Phase 10 — Reviewer hardening

## Outcome

Phase 10 makes the completed case study reproducible and reviewable under time pressure. It adds a technical README, a single offline verification command, corrected final requirement traceability, performance code-splitting, visible focus treatment, safe loading/error behavior, and a final demo path.

No business score or source evidence changed in this phase.

## Reviewer setup

The deterministic product requires Node.js 20+, Python 3.10+, the pinned Python requirements, and the committed processed snapshots. It does not require an API key. The optional analyst uses a separate local Node process and a server-only `OPENAI_API_KEY` from ignored `.env`.

The tracked Vite configuration proxies `/api` to `http://localhost:8787`. This is part of the repository rather than relying on a generated local configuration, so a fresh clone reaches the analyst server correctly.

## Verification

`python scripts/verify_project.py` runs:

1. TypeScript checking and the production Vite build.
2. Eight deterministic Node tests for the read-only AI tools.
3. Branch, geometry, competitor, reputation, peer, health, scenario, whitespace, AI, workflow, accessibility, and runtime validators.
4. The complete 33-test Python suite.

The command makes no OpenAI call and downloads no external data.

## Performance and resilience

The 1,939-cell whitespace snapshot moved from the initial bundle into an on-demand chunk. The production build changed from one approximately 3.59 MB JavaScript entry to an approximately 1.55 MB initial entry plus a 2.04 MB whitespace chunk loaded only when the reviewer enables that layer.

The UI retains native keyboard-operable buttons and controls, visible focus, AI busy states, a basemap-error explanation, and an application error boundary. No additional keyboard-only map selector or skip-navigation control remains because manual review found those controls added clutter without sufficient value in this compact workspace.

Server failures return a safe generic response to the browser rather than raw provider or internal error details. The deterministic workspace remains usable when either the basemap or AI backend is unavailable.

## Assessment coverage

The final traceability matrix maps every assessment requirement to implemented evidence, a runnable check, and a reviewer action. The README leads with the decision-maker and boundaries, explains both recommendation models, distinguishes deterministic analytics from LLM synthesis, documents provenance, and supplies a five-to-ten-minute walkthrough.

The most important limitation remains unchanged: public proxies cannot establish revenue, profitability, customer demand, lease economics, capacity, or the outcome of an opening or closure decision.
