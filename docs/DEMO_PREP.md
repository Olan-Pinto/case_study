# Demo preparation notes

Use this as the plain-language narrative for the case-study walkthrough. It records the important questions raised during implementation and the precise boundaries of the current prototype.

## What are we building?

An AI-enabled geospatial decision-support workspace for Bedashing Beauty's UAE network. It is for a Head of Retail / Portfolio or Expansion Lead deciding where to protect, review, shrink, or grow a network. The product is not a financial model and will never present public proxies as revenue or customer data.

The core idea is: **deterministic geography and public evidence calculate; the AI layer later interrogates and explains that evidence.**

## What is complete today?

- **Phase 0:** Requirements traceability, architecture, data/research strategy, AI design, decisions, risks, and roadmap.
- **Phase 1:** A 24-lounge, coordinate-backed Bedashing roster with schema, validation, provenance, and reproducible inspection.
- **Phase 2:** A local React/MapLibre workspace with a map, searchable roster, selection, and source/evidence details.
- **Phase 3:** Nearest-own-branch distances plus 1/3/5 km geometric service-radius overlap metrics.
- **Phase 4:** A source-backed competitor screen for Sisters Beauty Lounge and NStyle Beauty Lounge, including map visibility, branch-level evidence, and a transparent lower-bound pressure calculation.

The roadmap has 10 phases and lives in [09_execution_roadmap.md](research/09_execution_roadmap.md). Phase 4 is competitor data and pressure; later phases add branch health, whitespace, scenarios, AI analyst, justified agentic enhancement, and hardening.

## Phase 6: bounded whitespace research

The map’s optional whitespace layer contains H3 resolution-8 cell centroids screened only inside the configured Dubai and Abu Dhabi city clusters. A cell is retained only when it is 3–8 km from an active Bedashing branch. The display is a research queue, not a growth map: `WATCH RESEARCH` is close to a user-validated high-priority urban-context anchor with lower limited competitor pressure; `SKIP RESEARCH` has high limited pressure; and `RESEARCH REQUIRED` has insufficient evidence for either screen. The model intentionally never emits `GROW` or an opening recommendation because it has no defensible local demand, footfall, tenancy, or financial data.

## Phase 7: scenario sensitivity

Use the Scenario selector in the context bar, then select an active branch. The scenario panel reports the baseline score, the replayed score, delta, review-label change, and the three exact weights. A useful line for the demo is: “The evidence has not changed. I am making a strategic preference explicit and seeing whether that preference is material enough to cross a review threshold.” The available scenarios prioritize public reputation, the limited two-brand competitor-pressure proxy, or lower geometric own-network overlap. They are bounded weight replays—not forecasts, demand simulations, or instructions to act.

## Phase 8: grounded AI analyst

The Optional AI analyst panel is deliberately not a chatbot over unrestricted files or the web. It can use six read-only tools: branch profile, branch comparison, scenario details, a whitespace-cell profile, bounded whitespace search, and source provenance. The tool outputs carry source IDs, snapshot/model IDs, and limitations. The model only explains those outputs; deterministic Python models still calculate every score. With no server key, the panel returns a clear disabled state and the rest of the workspace works normally.

## Why does Bedashing say 24 lounges when an early list showed 15?

The early 15-record list was a conservative, incomplete secondary directory result—not a conclusion that only 15 locations exist. Bedashing's official website claims 24 UAE lounges, but its accessible web locator returned zero server-rendered shops and its booking route errored during research, so it could not independently supply the branch roster.

The decisive reconciliation came from the user-supplied 2GIS chain listing: it contained exactly **24 beauty-lounge entries** and one distinct **head-office** entry. Excluding the head office reconciles exactly to the official 24-lounge claim. Therefore the prototype contains 24 lounges, not 15.

This does not prove every record is officially confirmed in real time. It means the count is reconciled using the best available evidence, while the remaining official per-branch locator verification is stated as a limitation.

## Why use 2GIS? Is it trusted?

2GIS is a secondary mapping source, not the official source of truth. It is useful because it supplied branch listings, addresses, and map locations that reconciled to the official count. Each roster record retains its exact evidence URL, uses the source ID `2gis_branch_roster`, and labels its coordinate confidence as `secondary_map_coordinate`.

The project does not claim that 2GIS proves operating performance, current financial health, customer demand, or final operating status. The official company claim is retained separately; mapping evidence supports roster geography. This distinction is visible in the data, documentation, and UI.

## Where are sources and citations stored?

[source_registry.csv](research/source_registry.csv) is the durable registry for every external factual source used by the project. It records stable source ID, exact URL, publisher, access date, fields used, collection method, reliability, freshness, licence/usage notes, limitations, and transformation notes.

Derived data references input source IDs and snapshot/model IDs. The branch panel opens record-level source links. This is deliberate: provenance is a reviewer-facing feature, not hidden implementation detail.

## What is the AI component, and does this become agentic AI?

AI is intended to be the decision-support explanation layer, not the scoring engine. A later optional server-side OpenAI Responses workflow will call typed deterministic tools such as branch profile, score explanation, comparison, overlap metrics, opportunity search, scenario run, and source provenance. It will synthesize grounded answers and cite the tool evidence it used.

The product is **semi-agentic, bounded, and tool-using**—not autonomous. The model will not invent metrics, decide a branch should close, modify source data, or execute external actions. It will operate with an allowlisted tool set, structured results, bounded tool budget, logging/evaluation, and a no-AI deterministic fallback.

Current design decisions:

- **HITL: adopt** for publishing a refreshed snapshot or accepting consequential overrides.
- **Portfolio-review agent: adopt** because a bounded multi-tool worklist turns portfolio evidence into a useful human research queue.
- **Refresh automation: defer** because a manual candidate-entry form did not add enough decision value.
- **Graph runtime: reject initially** because the expected tool paths are simple.
- **MCP: defer** as an adapter until there is a real second consumer.
- **A2A: reject for this prototype** because there are no independent agents that need delegation.

This is appropriate for an AI Engineering role because it demonstrates current agent engineering judgement without using “agentic” as a buzzword.

## What is the Phase 9 agentic workflow?

Phase 9 is a portfolio research worklist agent. The user chooses UAE, Dubai, or Abu Dhabi; the agent first reads the bounded active evidence inventory for that scope, then selects limited branch and whitespace checks before producing a short, cited list of what a human should investigate next.

It does **not** browse, scrape, invent facts, rewrite data, publish anything, or recommend an opening/closure. Its autonomous work is safe evidence gathering and research triage; a human owns both verification and decisions.

## Why did Phase 2 avoid performance, catchments, competition, and recommendations?

At that point, only roster and location evidence had been validated. The map was deliberately limited to what the data actually supports. It does not say a branch should close, a location is a growth opportunity, an area has high competition, or a radius is a drive-time catchment.

That restraint is intentional: a visually impressive map must not create false certainty.

## What does “Network geometry · 3 km” mean?

For the selected branch, the system places an imaginary **3 km-radius circle** around its coordinate and compares it with circles around the other Bedashing branches. It is the primary, middle sensitivity band:

- **1 km** = very local screen
- **3 km** = primary review band
- **5 km** = wider sensitivity check

These are **geometric service radii**. They are not stated as travel times, actual customer catchments, or market boundaries.

## What maths was used in Phase 3?

1. **Nearest distance:** Every pair of branch coordinates is measured with the haversine formula, the standard great-circle distance calculation for latitude/longitude.
2. **Circle overlap:** For each 1, 3, and 5 km band, the system applies the analytic equal-circle intersection formula to calculate shared circle area.
3. **Per-branch summary:** It records nearest own branch, distance, number of overlapping own-branch circles, maximum pairwise overlap coefficient, and sum of pairwise overlap areas.

The output is deterministic, versioned in `network_metrics_v1.json`, validated, and unit-tested. It currently contains 24 branch metrics and 28 non-zero overlap records across all bands.

## How should I explain the overlap values?

“Overlapping service radii: **1** · largest pairwise overlap: **19%**” means one other Bedashing location has a 3 km circle that intersects the selected branch's 3 km circle. Of the overlapping pairs, the largest shared area is 19% of one circle's area.

“Overlapping service radii: **3** · largest pairwise overlap: **24%**” means three other Bedashing locations intersect that selected branch's 3 km circle, and the strongest individual pairing shares 24% of one circle's area.

This is **not** “19% shared customers,” “24% revenue cannibalization,” or a decision recommendation. It is a proximity/density screen. Any later cannibalization reasoning must combine geometry with branch archetype, demand, competitor context, customer-origin data if available, performance, and confidence.

## Why not call it a catchment or drive time?

The prototype does not have validated travel-time routing or customer-origin data. Calling a 3 km circle a “10-minute catchment” would be misleading. The UI and documentation consistently call it a service radius / geometric distance band.

## What does the competitor coverage message mean?

The candidate review is complete: **15 active locations are geocoded** and **2 locations are user-confirmed permanently closed**, so the closed locations are excluded from pressure. The official NStyle locator still lists those closures, and is recorded as stale for those two records.

The remaining scope limitation is different: this initial screen researches only **Sisters Beauty Lounge** and **NStyle Beauty Lounge**. It is not a census of every UAE salon. Therefore, a zero pressure score means no relevant competitor from this researched subset contributed; it does not mean no competition exists.

## In simple terms, what is competitor pressure?

It is a nearby-verified-competitor presence signal. A higher score means more relevant researched competitors are close to the selected Bedashing branch; a lower score means fewer are close. It does not measure branch performance, revenue, market share, quality, or recommend an action.

## How is lower-bound pressure calculated, and what is its range?

For every active, geocoded competitor, the product calculates:

`relevance weight × exp(−distance in km / 3)`

It then adds those contributions. The 3 km value makes contribution decline smoothly with straight-line distance: a competitor at 3 km contributes roughly 37% of its starting weight. Only contributions of at least 0.01 are displayed and summed, intentionally making the score a conservative lower bound.

There is no fixed 0–100 scale. A direct competitor at the same coordinate contributes 1.00; several nearby competitors can make the total exceed 1. The output is a relative evidence signal, not a percentage or rating.

## Why does Sisters have a weight of 1.0 and NStyle 0.7?

These are explicit, reviewable business-rule assumptions—not learned facts or quality scores. Sisters is weighted 1.0 because its premium full-service offer has the closest observed service overlap with Bedashing. NStyle is weighted 0.7 because it remains highly relevant but is more beauty/nail-led and therefore judged a slightly less direct substitute.

The value does not say NStyle is “70% as good” or has 70% of Sisters' market impact. A later version should calibrate these assumptions against real service menus, pricing, customer behavior, or transaction data.

## What should I say about current limitations?

- The official live locator could not be programmatically reconciled during research; official per-branch verification remains open.
- Coordinates are user-validated, 2GIS-attributed map evidence rather than official coordinates.
- The competitor screen covers only two researched brands; it is not a complete UAE salon-market census.
- Demand, ratings, and internal operating data are not in the product yet.
- Pairwise overlap-area sums can double-count shared space; they are not union coverage.
- The OSM basemap is visual context; it is not a source of branch performance or recommendations.
- No model or API call has been made for the AI feature yet.

## What should I demonstrate now?

1. Filter the roster by emirate or search by community.
2. Select a branch from the list or map.
3. Show its address, coordinate provenance, source links, and snapshot ID.
4. Explain its nearest own branch and 3 km geometry screen.
5. Toggle the verified competitor layer and explain the lower-bound pressure contributors for the selected branch.
6. State the honest limitation: this is evidence-backed geography and competitor presence, not yet a branch decision.

## Git and review cadence

Every phase is independently reviewable. The normal sequence is: inspect, run, test, decide, commit, push. The repository uses `memory.md` for durable engineering context and `.gitignore` protects secrets, caches, local/raw datasets, generated outputs, and dependency folders. Never commit `.env`.
