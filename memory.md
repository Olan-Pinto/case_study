# Project Memory

## Current Project State

Phases 0–9 are complete. The project has a reconciled historical 24-location roster, a 22-active-branch operating view, map workspace, geometry, competitor pressure, a public-proxy branch-health screen, bounded whitespace research cells, transparent scenario sensitivity, an optional grounded AI analyst, and a bounded AI portfolio-review worklist agent. Neither whitespace nor scenarios are demand models, opening recommendations, or financial forecasts. The AI components synthesize only read-only tool evidence and are disabled without a server-side key.

## Modular Build Briefing Protocol

Before beginning each implementation phase or independently reviewable modular build, first give the user a concise summary of: (1) completed work and its current state, (2) the next module's exact scope and value, (3) explicit out-of-scope work, and (4) its acceptance criteria/review boundary. Then perform the work only after that briefing. Update this section if the user changes the collaboration protocol.

Within a phase, continue through each independently reviewable component after it passes its proportionate tests and documentation updates. Pause only for a genuine HITL decision, missing evidence that requires user input, external authority, or a material scope choice. At each component boundary, report the verification outcome and immediately brief the next component before continuing.

## Provenance and Commit Protocol

For every external place, dataset, statistic, address, coordinate, rating, or other factual input used by the project, add or update a durable source-registry entry with a stable source ID, exact URL, publisher, access date, fields used, collection method, reliability tier, freshness, license/usage note, limitations, and transformation note. Derived records must reference those source IDs. Preserve a snapshot manifest that records source IDs and transformation/model versions. This evidence must be usable in the final README and in-product provenance surface.

Do not commit or push without explicit user sign-off. At every independently reviewable boundary, state whether the component meets its acceptance criteria and recommend `COMMIT`, `WAIT`, or `CONTINUE`. When recommending `COMMIT`, provide one exact suggested commit message; never commit or push on the user's behalf unless explicitly asked.

## Completed Work

- Original case-study problem statement added under `problem_statement/`.
- Phase 0 research, traceability, architecture, source strategy, methodology, UX plan, ADRs, and roadmap completed under `docs/`.
- Root `.gitignore` restored and expanded. `.env` is now ignored; it was untracked when inspected. No secrets were read or exposed.
- Phase 1 branch-data foundation added: `data/processed/branches_snapshot_v0.json`, manifest, `schemas/branch_record_v1.json`, standard-library validator, inspection command, tests, and `docs/PHASE_1_DATA_FOUNDATION.md`.
- Phase 2 network-exploration workspace added: React/TypeScript/Vite, MapLibre branch points, roster/text filters, linked selection, and evidence/source detail. See `docs/PHASE_2_NETWORK_EXPLORATION.md`.
- Phase 3 network geometry added: committed, versioned 1/3/5 km service-radius metrics; haversine nearest-own-branch distances; analytic circle intersections; validation and unit tests. See `docs/PHASE_3_NETWORK_GEOMETRY.md`.
- Demo-preparation FAQ added at `docs/DEMO_PREP.md`, covering evidence reconciliation, AI/agent boundaries, map scope, geometry mathematics, limitations, and walkthrough narrative.
- Phase 4 competitor pressure added: source-backed Sisters/NStyle records, taxonomy, deterministic lower-bound pressure, closed-location exclusions, competitor map toggle, and branch-level evidence details. See `docs/PHASE_4_COMPETITOR_PRESSURE.md`.
- Phase 5A branch-health contract added: permitted-factor, peer-comparison, missingness, confidence, and non-financial labelling rules. It deliberately withholds scores until source-backed public-reputation and format-archetype evidence exists. See `docs/PHASE_5_BRANCH_HEALTH.md`.
- Phase 5B completed live source research and address-evidenced venue-context peer groups: 9 destination-retail, 13 community/streetfront, and two network-comparison-only outliers. Google Places API is a technically suitable source but requires user-approved credentials/billing/terms; inconsistent secondary directories are rejected.
- Phase 5 completed: 22 active-branch public-proxy health records with review labels, confidence, contributions, and UI evidence; two user-confirmed Bedashing closures are excluded from active geometry/pressure.
- Phase 6A whitespace contract added: H3 candidate resolution, exclusions, permitted screening factors, and `RESEARCH_REQUIRED` missingness guardrail. See `docs/PHASE_6_WHITESPACE.md`.
- Phase 6 completed: deterministic H3 resolution-8 cells in bounded Dubai/Abu Dhabi city clusters, user-validated urban-context anchor screening, limited two-brand competitor saturation, map inspection, source traceability, and conservative `WATCH_RESEARCH`/`SKIP_RESEARCH`/`RESEARCH_REQUIRED` labels. All confidence is capped at 20%; no `GROW_RESEARCH` or opening recommendation is emitted.
- Post-Phase-6 UI clarification: user-confirmed permanently closed branches are bold red in the roster and red on the map. The whitespace layer now has non-overlapping toggles and a WATCH/SKIP/RESEARCH legend.
- UX refinement before Phase 8 user testing: desktop workspace uses fixed-height panels with independent roster/detail scroll rather than document-level scroll. Basemap changed to OpenFreeMap Liberty with label fields configured to prefer English, then Latin; local-name fallback remains where neither field exists.
- Phase 7 completed: four versioned branch-health scenario replays (baseline, reputation priority, competitor-pressure priority, and network-spacing priority). Scenarios alter only bounded weights, preserve all evidence and confidence, show branch-level baseline/score deltas/label changes, and are explicitly sensitivity analysis rather than forecasts or actions. Baseline replay exactly matches the Phase 5 health output.
- Phase 8 completed: optional server-side OpenAI Responses API analyst with six strict read-only local tools, a four-call application limit, source/snapshot/model evidence envelopes, explicit refusals for unknown/write-like tools, model-evaluation fixtures, UI panel, and a verified `AI_DISABLED` no-key fallback. No OpenAI API call was made during build.
- Phase 8 UI refinement: grounded answers render safe GitHub-style Markdown (headings, emphasis, lists, tables) without raw HTML. The analyst avoids wide tables in the narrow evidence panel.
- Phase 8 observability refinement: each grounded answer exposes a collapsed, user-visible approved-tool activity trace with safe inputs, status, duration, and source IDs. It deliberately excludes private model reasoning, chain-of-thought, secrets, and raw tool payloads.
- Phase 8 matching refinement: the analyst now resolves an unambiguous human-friendly branch/community/address reference against the committed roster before profile retrieval. Ambiguous references surface choices rather than a guessed branch; e.g. Al Nahyan resolves to `saeed_bin_saif_al_falahi` via its verified address/community.
- Phase 9 completed: a bounded AI portfolio-review worklist agent first gathers active evidence for UAE/Dubai/Abu Dhabi, then selects limited branch-profile and permitted whitespace follow-ups to return a cited human research queue. It has a forced first tool, four sequential-call limit, visible trace, no web/data-write path, and no operating recommendation. See `docs/PHASE_9_PORTFOLIO_REVIEW_AGENT.md`.

## Tried and Validated

- Official Bedashing site (accessed 2026-09-08) claims 24 UAE lounges; its accessible locator HTML rendered zero shops, so an official booking/locator extraction and reconciliation is required before a branch roster is accepted.
- Bedashing official pages support premium, women-focused, multi-service positioning and 2008 Emirati founding context.
- Overture Places is a viable monthly, open POI discovery source but its documented duplicates/junk/incomplete properties require filtering and reconciliation; OSM needs ODbL attribution/license review.
- User-supplied 2GIS branch evidence lists 24 beauty lounges plus a separate head office, reconciling exactly to Bedashing's official 24-lounge claim. This is now the current `branches_snapshot_v1` roster; v0 is retained as evidence history.
- User supplied and geographically validated coordinates for all 24 2GIS roster records. Twenty-one current records remain `secondary_map_coordinate`; no location coordinate was inferred or fabricated.
- User corrected three branch map locations on 2026-09-09: Pinnacle Building, Zawaya Walk, and Al Dhait North. Al Dhait address is Villa 66 (not Villa 3). These three records are now `user_validated_map_coordinate`; all dependent geometry and pressure artifacts must be regenerated after this correction.
- `py -3 scripts/validate_branches.py`, `py -3 scripts/inspect_branches.py`, and `py -3 -m unittest discover -s tests -v` pass on the Phase 1 snapshot.
- `npm run build` passes for the Phase 2 workspace; it imports the committed JSON snapshot and needs no key or backend. The optional OSM raster basemap is visibly attributed and must remain ordinary interactive use only under the OSM tile policy.
- `network_metrics_v1` deterministically produces 24 branch metrics and 28 overlapping pairs across 1/3/5 km sensitivity bands. Its 3 km primary band is exposed in the branch evidence panel; it is labelled as geometric screening, not a catchment, drive time, or recommendation.
- Phase 4 established an official-locator competitor seed: Sisters Beauty Lounge (direct) and NStyle Beauty Lounge (near-direct). User-provided map validation raised active geocoded coverage to 15 candidates. The user confirmed Arabian Ranches and Zero 6 Mall are permanently closed; they are retained for provenance and excluded from active pressure even though the official locator still lists them. `competitor_pressure_v1` remains an explicit lower bound and is not yet decision-ready.
- OpenStreetMap Nominatim returned one attributable Abu Dhabi Bedashing POI (node 13335655901; 24.458976, 54.3536914); it remains a candidate until matched to official roster evidence.

## Tried and Rejected

- No paid/credentialed Places or routing API may be used without user approval.
- Rejected for initial prototype: PostGIS/distributed state, graph runtime, A2A, live-on-load external data, LLM-generated scores, and false drive-time claims from radii.

## Architecture Decisions

- Proposed decisions recorded in `docs/DECISIONS.md`: React/TS/Vite; MapLibre + optional deck.gl; FastAPI; GeoPandas/Shapely/H3/DuckDB Spatial; versioned processed snapshot; H3 candidate resolution 8; radius bands; transparent scorecards; direct OpenAI Responses tools; MCP deferred; A2A rejected; HITL adopted at consequential gates.

## Data Decisions

- Authoritative future branch fields must be source-backed through official Bedashing booking/locator/venue evidence and reconciled. All derived data needs source IDs, confidence, snapshot and model version.

## AI / Agent Findings

- Future analyst: optional server-only OpenAI Responses function-calling loop over typed deterministic tools, with tool budget, evidence validation, logs/evals, and deterministic no-AI fallback. No model/API call was made in Phase 0.

## UI / UX Decisions

- Phase 2 implements the initial operator geospatial workspace; it intentionally limits the UI to roster exploration and branch-level evidence rather than implying catchments or recommendations.
- Current Impeccable upstream sequence researched: install/approve before UI work, then init/product truth; user approval/installation remains a later decision.

## Known Issues / Technical Debt

- Count and coordinate reconciliation are complete: 24 2GIS lounge entries (excluding one head office) match Bedashing's official claim, with a user-validated 2GIS-attributed coordinate for each. Canonical branch-name cleanup and a functioning official per-branch locator feed remain open. Official locator server-rendering showed zero shops and Zenoti booking retrieval returned an error on 2026-09-08.
- Public UAE demand and compliant ratings sources remain to be validated.
- Browser smoke testing through the available in-app browser was blocked by its local-host policy (`ERR_BLOCKED_BY_CLIENT`); production build and type checks passed. Verify visual interaction with `npm run dev` in a normal local browser before final submission.
- Phase 3 overlap uses pairwise analytic circles, so summed pairwise areas may double-count shared area; a later coverage-uniqueness calculation must use union geometry rather than this field.
- Overture Places 2026-08-19.0 was researched as the preferred bounded POI extraction route, but this run did not yield a usable UAE extraction. Nominatim returned no matches for 16 official competitor-name/location queries. Retain both as unsuccessful data-acquisition attempts rather than fabricating coordinates.

## Open Questions

- Canonical name/community mapping for the 24-lounge roster; a functioning official source extraction route.
- Current usable public UAE demand proxy dataset and rating source.
- Impeccable installation approval before UI phase.

## Next Recommended Step

Phase 9 is complete. Proceed to Phase 10: harden the reviewer experience, document setup and provenance, validate accessibility/error/performance boundaries, and write the final README/demo plan.

## Last Updated

2026-09-09 — Phase 5C collection route chosen: manual user validation from Google Maps, captured as dated rating/count/link evidence with no API use or automated Google extraction.
2026-09-09 — Manual reputation collection structurally accounts for all 24 branches: 22 ratings, two user-confirmed closures. All observations are 2026-09-09. Pinnacle's Google listing is user-confirmed by identity text despite a displaced place pin; Zawaya is user-confirmed by address/coordinate without an embedded place pin.
2026-09-10 — Phase 6 completed with 1,939 deterministic bounded research-screening cells. User-supplied coordinates/status for Dubai Hills, Reem, Saadiyat, City Walk, Yas, and Rashid Yachts are preserved alongside official context sources. Rashid Yachts is excluded as temporarily closed. The output may prioritize research only; it does not claim demand or recommend openings.
2026-09-10 — Phase 7 completed with four bounded branch-health scorecard replays. Baseline exactly reproduces Phase 5; alternative scenarios vary only declared weights and display the numeric/label delta for every active branch.
2026-09-10 — Phase 8 completed with an optional grounded OpenAI Responses API tool-calling analyst. The server is read-only and the key remains server-only via ignored `.env`. Both the no-key fallback and live API smoke checks were runtime-verified: one grounded branch explanation and one refused closure request. Tool and fixture tests run without an API call.
2026-09-10 — Phase 8 analyst observability now shows a collapsed evidence-activity trace for each grounded answer. The trace makes its actual bounded tool use auditable without exposing private model reasoning or secrets.
2026-09-10 — Phase 8 analyst branch matching now accepts human-friendly references from the committed roster; it resolves only unique matches and returns ambiguity rather than guessing.
2026-09-11 — Phase 9 refresh-review prototype was removed because it added no stakeholder value. It was replaced by a bounded AI portfolio-review agent that produces a cited research worklist by scope. Deterministic contracts/build pass; a live model smoke test requires explicit authorization because it sends local portfolio evidence to OpenAI.
