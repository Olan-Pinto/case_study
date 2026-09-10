# Project Memory

## Current Project State

Phases 0–3 are complete. The project has a validated 24-branch data foundation, a local React/MapLibre network-exploration workspace, and deterministic own-network distance/service-radius overlap metrics. No backend, competitor, recommendation, or AI implementation exists.

## Modular Build Briefing Protocol

Before beginning each implementation phase or independently reviewable modular build, first give the user a concise summary of: (1) completed work and its current state, (2) the next module's exact scope and value, (3) explicit out-of-scope work, and (4) its acceptance criteria/review boundary. Then perform the work only after that briefing. Update this section if the user changes the collaboration protocol.

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

## Tried and Validated

- Official Bedashing site (accessed 2026-09-08) claims 24 UAE lounges; its accessible locator HTML rendered zero shops, so an official booking/locator extraction and reconciliation is required before a branch roster is accepted.
- Bedashing official pages support premium, women-focused, multi-service positioning and 2008 Emirati founding context.
- Overture Places is a viable monthly, open POI discovery source but its documented duplicates/junk/incomplete properties require filtering and reconciliation; OSM needs ODbL attribution/license review.
- User-supplied 2GIS branch evidence lists 24 beauty lounges plus a separate head office, reconciling exactly to Bedashing's official 24-lounge claim. This is now the current `branches_snapshot_v1` roster; v0 is retained as evidence history.
- User supplied and geographically validated coordinates for all 24 2GIS roster records. Every current record is now `secondary_map_coordinate`; no location coordinate was inferred or fabricated.
- `py -3 scripts/validate_branches.py`, `py -3 scripts/inspect_branches.py`, and `py -3 -m unittest discover -s tests -v` pass on the Phase 1 snapshot.
- `npm run build` passes for the Phase 2 workspace; it imports the committed JSON snapshot and needs no key or backend. The optional OSM raster basemap is visibly attributed and must remain ordinary interactive use only under the OSM tile policy.
- `network_metrics_v1` deterministically produces 24 branch metrics and 28 overlapping pairs across 1/3/5 km sensitivity bands. Its 3 km primary band is exposed in the branch evidence panel; it is labelled as geometric screening, not a catchment, drive time, or recommendation.
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

## Open Questions

- Canonical name/community mapping for the 24-lounge roster; a functioning official source extraction route.
- Current usable public UAE demand proxy dataset and rating source.
- Impeccable installation approval before UI phase.

## Next Recommended Step

Phase 3 was committed and pushed by the user (`5e32cdb`). The next proposed module is Phase 4: a source-backed competitor taxonomy, candidate collection/reconciliation, and pressure layer.

## Last Updated

2026-09-08 — Phase 3 committed/pushed by user; added durable demo-preparation FAQ and paused before Phase 4.
