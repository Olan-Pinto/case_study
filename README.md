# Bedashing AI Geospatial Portfolio Analyst

A local-first decision-support workspace for exploring Bedashing Beauty's UAE branch network, reviewing public-proxy branch health, identifying geographic overlap, screening competition, prioritizing whitespace research, and asking a grounded AI analyst to assemble evidence.

The product is designed for a Head of Retail or Portfolio and Expansion Lead. It supports investigation; it does not automate opening, closure, investment, or staffing decisions.

## What the reviewer can do

- Explore 24 historically observed Bedashing locations: 22 active and two permanently closed.
- Inspect branch addresses, source links, nearby verified competitors, and geometric overlap.
- Review a public-proxy branch score with exact contributions, peer basis, confidence, and missingness.
- Compare four declared scoring scenarios without changing the evidence.
- Explore 1,939 H3 research areas across bounded Dubai and Abu Dhabi study areas.
- Inspect a four-factor whitespace score, or see it withheld when required evidence is missing.
- Ask an optional AI analyst about branches, comparisons, scenarios, and opportunity cells.
- Run a bounded agentic workflow that chooses evidence checks and returns a cited human worklist.

## Quick start

### Prerequisites

- Node.js 20 or newer
- Python 3.10 or newer

### Run the deterministic workspace

```bash
npm install
python -m pip install -r requirements.txt
npm run dev
```

On Windows, `py -3` can replace `python`. Open [http://localhost:5173](http://localhost:5173). The map, scores, scenarios, and evidence panels work without an API key.

### Enable the optional AI analyst

Copy the environment template:

```powershell
Copy-Item .env.example .env
```

On macOS or Linux, use `cp .env.example .env`. Set `OPENAI_API_KEY` in `.env` and run the backend in a second terminal:

```bash
npm run analyst
```

Keep `npm run dev` running. The browser calls the local backend through the Vite proxy. The key remains server-side, `.env` is ignored, and OpenAI requests use `store: false`. Without a key or backend, the UI shows a disabled state while every deterministic feature remains usable.

## Verify the project

This offline command performs the production build, Node tool tests, snapshot and contract validation, and the complete Python test suite. It does not call OpenAI or download data.

```bash
python scripts/verify_project.py
```

Current expected coverage:

- 22 active branch-health records
- 1,939 bounded whitespace cells
- 33 Python tests
- 8 Node tool tests
- 6 versioned AI evaluation fixtures

## Decision logic

### Existing branches

The branch-health model is a public-proxy review screen—not financial health.

| Factor | Weight | Meaning |
|---|---:|---|
| Peer-adjusted public reputation | 60% | Rating evidence is sample-adjusted and compared within a source-backed venue peer group |
| Inverse competitor pressure | 25% | Lower pressure from the limited verified competitor set receives more credit |
| Inverse own-network overlap | 15% | Lower geometric overlap with active Bedashing locations receives more credit |

Scores at or above 65 are `PROTECT_REVIEW`; scores below 35 are `SHRINK_REVIEW`; the middle is `HOLD_REVIEW`. These labels prioritize human review and are not operating instructions.

Confidence is separate from the score. It uses source reliability, freshness, review-sample adequacy, peer adequacy, feature completeness, and competitor scope. The UI exposes both calculations.

### Whitespace research

Candidate H3 cells are retained only when their centre is 3–8 km from an active branch inside the configured Dubai or Abu Dhabi study area. This is a screening assumption, not drive time or a customer catchment.

| Factor | Maximum points | Meaning |
|---|---:|---|
| Residential intensity | 50 | WorldPop 2025 percentile within the same study area |
| Own-network spacing | 20 | Linear credit from 3 km to 8 km from an active branch |
| Urban-context proximity | 15 | Linear credit near a validated high-priority destination |
| Competitor market validation | 15 | Some pressure validates the category; heavy pressure reduces credit |

`PRIORITIZE_RESEARCH` begins at 60, `WATCH_RESEARCH` at 40, and lower scores are `DEPRIORITIZE_RESEARCH`. If required WorldPop coverage is unavailable, the score is withheld as `RESEARCH_REQUIRED`.

The score orders a research queue. It is not a probability of success, demand forecast, opening recommendation, or precise proposed address.

### Geographic calculations

- Great-circle distance uses the Haversine formula.
- Own-network service radii are tested at 1, 3, and 5 km.
- Pairwise overlap uses analytic equal-circle intersections.
- Competitor pressure is `sum(similarity weight × exp(-distance km / 3 km))`.
- Whitespace areas use true H3 resolution-8 polygon boundaries.

These are straight-line geometric screens, never drive-time catchments.

## AI engineering design

The LLM explains and assembles evidence; deterministic code owns all metrics, scores, labels, and scenarios.

```text
Reviewer question
  -> local read-only Node.js facade
  -> OpenAI Responses API
  -> one of eight allowlisted tools
  -> committed snapshots and deterministic models
  -> grounded answer plus safe evidence-activity trace
```

Tools resolve human branch references, retrieve profiles, compare branches, inspect scenarios, constrain portfolio scope, search ranked research cells, and retrieve provenance. Results carry source IDs, snapshot/model IDs, values, and limitations.

The Phase 9 workflow is meaningfully agentic but bounded:

```text
selected geography
  -> forced portfolio-scope tool
  -> model selects branch and opportunity checks
  -> cited investigation worklist
  -> stop after at most four sequential tool calls
```

It cannot browse arbitrary websites, write data, alter scores, or make opening or closure decisions. The UI shows approved tools, safe inputs, timing, status, and source IDs—not private chain-of-thought.

The contract and adversarial expectations live in [config/analyst_v1.json](config/analyst_v1.json) and [evals/analyst_eval_cases_v1.jsonl](evals/analyst_eval_cases_v1.jsonl). Tool behavior is tested without spending API credits.

## Architecture

```text
Public and manually validated evidence
  -> Python normalization and validation
  -> committed versioned JSON snapshots
  -> deterministic geospatial and scoring models
  -> React + TypeScript + MapLibre workspace

Browser
  -> optional local read-only Node API
  -> bounded OpenAI tool loop
```

Committed processed snapshots make the core review reproducible offline. The larger whitespace snapshot is code-split and loaded only when its map layer is requested, keeping the initial branch-review path lighter. Raw downloads, local datasets, caches, secrets, and build outputs are excluded by the root `.gitignore`.

| Path | Purpose |
|---|---|
| [config/](config/) | Versioned model, scenario, AI, and workflow contracts |
| [data/processed/](data/processed/) | Committed reviewer-safe snapshots |
| [scripts/](scripts/) | Deterministic builders, validators, and verification |
| [server/](server/) | Read-only tools and optional Responses API loop |
| [src/](src/) | React, TypeScript, and MapLibre interface |
| [tests/](tests/) | Model, geometry, missingness, and contract tests |
| [docs/](docs/) | Architecture, phase decisions, evidence, and demo notes |

See [Architecture](docs/ARCHITECTURE.md) and [Architecture decisions](docs/DECISIONS.md) for trade-offs and rejected complexity.

## Data and provenance

Every external input used by the project has a durable entry in [the source registry](docs/research/source_registry.csv). Derived snapshots retain source IDs and model or snapshot versions.

Primary evidence includes:

- Bedashing's official site for the stated 24-lounge network and brand context.
- User-validated 2GIS branch records for the reconciled roster.
- User-observed Google Maps ratings and counts dated 2026-09-09; no automated Google extraction.
- Official Sisters Beauty Lounge and NStyle location pages plus user-validated coordinates.
- [WorldPop Global2 R2025A](https://hub.worldpop.org/geodata/listing?id=135) UAE 2025 modelled population data. This alpha dataset is residential context—not customers or demand.
- Official destination and public-sector sources for bounded urban-context anchors.

The roster reconciles 24 lounges separately from one head-office listing. Two lounges remain as historical evidence but are excluded from active calculations because permanent closure was validated.

## Five to ten minute demo

1. **Frame the decision.** This helps leadership decide what to investigate, not execute a decision.
2. **Show the network.** Select an active branch, then inspect evidence, competitors, and 1/3/5 km radii.
3. **Explain one branch.** Show factor arithmetic, confidence, and what the model cannot know.
4. **Test sensitivity.** Change the scenario and distinguish changed priority from a forecast.
5. **Explore whitespace.** Select a blue cell and explain its four contributions; select grey to show score withholding.
6. **Use the AI analyst.** Ask for a branch explanation and expand **Evidence activity** to show its tools.
7. **Run the agent.** Select Dubai or Abu Dhabi and build a cited research worklist.
8. **Close with limitations.** No internal revenue, rent, customer, capacity, or travel-time data is available.

More presenter explanations are in [Demo preparation notes](docs/DEMO_PREP.md).

## Known limitations

- Public ratings are not revenue, profitability, service quality, or strategic importance.
- Competitor coverage contains two researched brands and is a lower bound.
- Geographic radii are straight-line geometry, not road travel time or observed catchments.
- WorldPop estimates residents, not target customers, spending power, footfall, or salon demand.
- Study boundaries and weights are declared analytical assumptions.
- Pairwise overlap totals can double-count areas shared by more than two circles.
- The AI evaluation set is small; live smoke tests do not establish production model quality.
- The system has no autonomous write or operating-action path.

A production version needs governed branch economics, leases, capacity, compliant broader competition, routing-based travel time, and outcome-based calibration before any label becomes decision-ready.

## Documentation

- [Requirements traceability](docs/research/00_requirements_traceability.md)
- [Business framing](docs/research/01_business_framing.md)
- [Geospatial methodology](docs/research/04_geospatial_methodology.md)
- [Recommendation methodology](docs/research/05_recommendation_methodology.md)
- [Agentic AI research](docs/research/06_agentic_ai_research.md)
- [Phase 5 branch health](docs/PHASE_5_BRANCH_HEALTH.md)
- [Phase 6 whitespace research](docs/PHASE_6_WHITESPACE.md)
- [Phase 8 AI analyst](docs/PHASE_8_AI_ANALYST.md)
- [Phase 9 portfolio-review agent](docs/PHASE_9_PORTFOLIO_REVIEW_AGENT.md)
- [Phase 10 reviewer hardening](docs/PHASE_10_HARDENING.md)
