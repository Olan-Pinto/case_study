# Requirement traceability

Source: authoritative assessment, `problem_statement/ai-case-study.docx`, read 2026-09-08.

| Requirement | Data | Computation | Product surface | Explanation | Test | Demoable action |
|---|---|---|---|---|---|---|
| Business framing | Persona, branch/network proxies, documented assumptions | None required | Workspace landing / methodology | Decision scope and non-financial caveat | Content/link check | Open network overview and identify decision-maker + decisions |
| Existing-branch classification | Branch, reputation, demand proxies, competitors, overlap, coverage | `existing_branch_model_v1` | Map, branch drawer, portfolio table | Factor contributions, confidence, provenance | Golden cases; threshold and missing-data tests | Select a branch and explain PROTECT/HOLD/SHRINK |
| Opportunity classification | H3 cells, bounded urban-context anchors, competitors, own coverage | `whitespace_model_v1` | Research-screening layer + detail drawer | Contributions, uncertainty, sources | H3/geometry/label-boundary tests | Click a cell and explain RESEARCH_REQUIRED/WATCH/SKIP; no opening recommendation |
| Geographic reasoning | Coordinates, archetype, POIs, roads/context | Haversine, buffers, intersections, nearest-neighbour, H3 aggregation | Catchment, overlap, density, whitespace layers | Method label; no false drive-time claim | UAE bounds, distance, area, H3 and intersection tests | Toggle overlap / inspect a coverage gap |
| Competition | Taxonomy, official locators, Overture/OSM candidates | Similarity-weighted distance-decayed pressure | Competitor layer and branch context | Relevant competitor list and taxonomy | Deduplication and category test | Inspect why local competition is high/healthy/saturated |
| Health / comparison | Normalized proxy features and peer group | Peer percentiles, confidence-weighted score | Compare table | Relative—not financial—interpretation | Group normalization tests | Compare two same/different archetype branches |
| AI-relevant design | Typed deterministic tool results | Tool selection, evidence validation, grounded synthesis | Analyst panel | Tool/result citations and inability notice | Tool allowlist, grounded-answer evaluation | Ask why a label changed in scenario |
| Explainability | Feature provenance + source registry | Score decomposition and confidence calculation | Branch/cell evidence tab | Inputs, directions, freshness, limitations | Every output links model/source IDs | Open sources for one recommendation |
| Offline fallback | Committed processed snapshot | Same deterministic engine | Entire workspace, AI-disabled banner | Template explanation | Launch with no key | Explore and explain without external calls |

Acceptance rule: no feature is “done” until its row has a runnable test and a reviewer-visible action.
