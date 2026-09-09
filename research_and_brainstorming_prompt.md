You are acting as the principal AI engineer, geospatial analytics architect, research lead, and product architect for an AI engineering case study.

You are working inside a Git repository named:

`case_study`

The repository contains a folder:

`problem_statement/`

The original assessment document is stored there.

## Mission

We need to build an exceptional working prototype for the case study:

**AI-Enabled Geospatial Decision Support for Retail Network Right-Sizing**

The real company is **Bedashing Beauty**, operating a salon/wellness branch network across the UAE.

This is not a toy dashboard and not primarily a coding exercise. The reviewers explicitly care about:

* problem framing
* business reasoning
* solution structure
* trade-offs
* intelligent use of AI
* explainability
* geographic reasoning
* defensibility
* practicality
* usability
* quality of thought

The goal is to create something that makes a reviewer think:

> This candidate understood the business problem, researched the real company and market, knew what not to over-engineer, used AI where it genuinely improved the product, and built a decision-support system I could actually imagine a portfolio team using.

We are building a **case-study prototype, not enterprise production infrastructure**.

The application comes first. The demo video is explicitly out of scope for now.

---

# 0. THIS RUN IS RESEARCH + ARCHITECTURE ONLY

This is **Phase 0**.

Do **not** begin implementing the application in this run.

Do not scaffold a React application.
Do not build API endpoints.
Do not implement maps.
Do not implement an agent.
Do not start styling UI.
Do not make a giant "one prompt solves everything" implementation.

Instead, deeply research the problem and create the architecture, data strategy, methodology, product structure, and modular execution roadmap from which we will build each component independently.

This project is a marathon, not a sprint.

Every later phase should be small enough that I can:

1. inspect it,
2. run it,
3. decide whether it is good enough,
4. make a Git commit,
5. then move to the next component.

Do **not** commit or push anything yourself unless I explicitly ask you to.

At the end of Phase 0, stop and wait for the next instruction.

---

# 1. FIRST ACTION: INSPECT THE REPOSITORY

Before doing research:

1. Inspect the entire current repository tree.
2. Read the complete assessment document inside `problem_statement/`.
3. Read any existing README, instructions, configuration, notes, `.gitignore`, agent files, design files, or research artifacts.
4. Do not assume the pasted case-study description is the only source of truth. The file in `problem_statement/` is authoritative.
5. Record anything already present that constrains architecture or implementation.

If repository contents contradict this prompt, explicitly surface the conflict rather than silently choosing one.

---

# 2. NON-NEGOTIABLE ASSESSMENT REQUIREMENTS

Create a formal requirement traceability matrix covering **every Minimum Functional Requirement** in the assessment.

The product must demonstrate:

### A. Business Framing

Clearly define:

* decision-maker
* decisions they need to make
* metrics/signals that matter
* how the system supports those decisions

### B. Recommendation Logic

Implement defensible classifications for:

Existing branches:

* PROTECT
* HOLD
* SHRINK

Opportunity areas:

* GROW
* WATCH
* SKIP

### C. Geographic Reasoning

Meaningfully use geography, potentially including:

* catchments
* proximity
* branch overlap
* self-cannibalization
* coverage gaps
* competitor density
* saturation
* accessibility
* travel-time logic where justified

### D. AI-Relevant Design

At least one meaningful AI layer such as:

* natural-language interaction with portfolio data
* grounded recommendation explanations
* grounded branch summaries
* tool-using analyst workflow
* agentic/semi-agentic workflow
* prompt/tool/retrieval design

The AI layer must be practical rather than decorative.

### E. Explainability

A reviewer must be able to answer:

* Why did this branch receive this recommendation?
* Why is this area attractive or unattractive?
* What inputs influenced the result?
* What is uncertain?
* Where should the recommendation be trusted?
* Where should a human be cautious?

For each assessment requirement, the traceability matrix must eventually identify:

`Requirement → Data → Computation → Product Surface → Explanation → Test → Demoable User Action`

Nothing in the assessment should be accidentally omitted.

---

# 3. BUSINESS FRAMING BEFORE TECHNOLOGY

Research and define the likely real decision-maker.

Do not vaguely say "business users."

Determine whether the primary persona should be something like:

* Head of Retail / Portfolio
* COO
* Strategy / Expansion Lead
* Network Planning Lead
* executive leadership

Then define the concrete decisions this person is making.

For example:

* Which branches deserve protection/investment?
* Which branches need observation?
* Which branches appear strategically weak or excessively cannibalized?
* Which Bedashing branches substantially overlap each other?
* Which branches face unusually strong local competition?
* Where does Bedashing have geographic whitespace?
* Which whitespace represents real demand versus simply an absence of salons?
* How robust is each recommendation?
* What happens if leadership changes assumptions or priorities?

Do not treat this merely as "visualize branches on a map."

This is a **decision-support product**.

---

# 4. CONDUCT DEEP, CURRENT RESEARCH ON BEDASHING

Bedashing is a real company.

Use live internet research and use information that is current at the time you perform this task.

Do not rely on model memory where current information can be verified.

Research at minimum:

* current Bedashing branch count
* current branch names
* exact/approximate addresses
* latitude/longitude where reliably obtainable
* emirate
* neighborhood/community
* branch operating status
* branch archetype/context
* available opening hours where useful
* available services if useful
* mall / airport / neighborhood / community / villa / high-street context
* public ratings
* public review counts
* public reputation signals
* opening/closure evidence where discoverable
* franchise versus owned status if reliably available and decision-relevant
* Bedashing's positioning, customer proposition, and brand positioning
* historical expansion information if it helps understand the network

Important:

A branch in Abu Dhabi Airport should not automatically be compared identically with a neighborhood villa, community location, City Walk location, or suburban branch.

Research whether **branch archetypes / peer groups** should be introduced.

Potential dimensions include:

* mall/high-footfall
* airport/transit
* premium destination
* neighborhood/community
* residential villa
* urban high street

Determine whether performance proxies should be normalized against relevant peers rather than across the entire network.

### Source hierarchy

Prefer evidence approximately in this order:

1. Bedashing official properties
2. Bedashing's booking system / official location platform
3. UAE government sources
4. official mall/property/operator pages
5. authoritative open geospatial datasets
6. reputable UAE business directories
7. review/travel/local platforms
8. miscellaneous secondary sources

Do not blindly merge conflicting sources.

When sources disagree:

* preserve the disagreement
* choose the most defensible current value
* explain why
* record a confidence score
* retain alternate evidence

Treat data reconciliation as part of the product's credibility.

---

# 5. BUILD A SOURCE-PROVENANCE STRATEGY

Every important dataset needs a provenance trail.

Design a source registry with fields similar to:

* source_id
* source_name
* source_type
* exact URL
* publisher
* date accessed
* source publication/update date
* geographic scope
* fields used
* collection method
* license / usage considerations
* reliability tier
* freshness
* known limitations
* transformation notes

We should eventually be able to answer:

> Where did this number come from?

for almost every important metric in the application.

Design an approach for attaching provenance/confidence metadata to branch, competitor, demographic, and recommendation inputs.

Consider exposing some of this directly in the application through a "Sources" or "Evidence" surface.

This could become a genuine differentiator.

---

# 6. RESEARCH COMPETITION PROPERLY

Define what constitutes a Bedashing competitor.

Do not treat every hairdresser or nail kiosk as equally competitive.

Research Bedashing's positioning and construct a competitor taxonomy such as:

* direct premium full-service women's beauty salons
* premium nail/beauty lounge chains
* strong local full-service salons
* specialist/adjacent competitors
* low-relevance salons

Research actual major UAE competitive brands rather than inventing examples.

Determine whether competitor weighting should reflect similarity to Bedashing.

Example concept:

`weighted_competitor_pressure = Σ competitor_similarity × distance_decay × competitor_quality`

Do not assume raw competitor count is sufficient.

Research free/open data sources first.

Strong candidates to investigate include:

* official competitor branch locators
* Overture Maps Places
* OpenStreetMap / Overpass where coverage is suitable
* local public directories
* malls / venue directories
* other legitimately accessible public data

Critically evaluate coverage quality in the UAE.

Do not scrape Google Maps or another service in a manner prohibited by its terms.

If Google Places or another paid/credentialed API would materially improve the project, it is **not automatically approved**.

See the paid-API rule later in this prompt.

---

# 7. RESEARCH DEMAND / MARKET ATTRACTIVENESS SIGNALS

We do not have Bedashing's proprietary revenue, transactions, utilization, CRM, or customer-origin data.

Do not pretend that we do.

Therefore distinguish carefully between:

**Actual branch financial performance**

and

**Publicly observable market/branch health proxies.**

The prototype should probably use terminology such as:

* Market Health Score
* Strategic Health Score
* Public Market Strength
* Portfolio Health Proxy

rather than misleadingly calling the score "Revenue Performance."

Research demand-side public datasets and proxies.

Consider:

* official Abu Dhabi population/district data
* official Dubai population/community statistics
* other UAE government statistics
* population density
* household/residential intensity
* female population where geographically available and methodologically defensible
* age bands where relevant and available
* retail/mall density
* lifestyle/premium POIs
* hospitality
* office/commercial activity
* residential communities
* accessibility
* road network
* transit
* parking/venue context
* tourism/hotel concentration
* urban density
* development areas

Do not use every available variable.

Select a small number of interpretable signals with clear business meaning.

Explain limitations.

---

# 8. RESEARCH RATINGS / REVIEWS AS PERFORMANCE PROXIES

Raw star rating alone is weak.

Investigate more defensible public reputation signals.

Consider:

* Bayesian-adjusted rating
* review volume
* review recency
* review velocity
* confidence intervals
* comparison against local peers
* cross-source consistency
* rating-source quality

A branch with 5.0 from 3 reviews should not automatically outrank 4.7 from 700 reviews.

If review text can be legally/reliably obtained, investigate whether AI-assisted theme extraction could add value, for example:

* staff/service
* waiting time
* convenience
* quality
* price/value
* booking
* cleanliness
* atmosphere

However, do not make review scraping a dependency if it is fragile, prohibited, or irreproducible.

---

# 9. GEOSPATIAL METHODOLOGY

Research and design the geographic engine.

At minimum investigate:

### Branch geography

* coordinates
* nearest Bedashing branch
* nearest relevant competitor
* same-brand density
* competitor density

### Catchments

Compare approaches:

* simple service radii
* multiple distance bands
* drive-time isochrones
* H3-based coverage
* road-network travel time

For this assessment, simpler may be better if it is transparent and reproducible.

If we use a radius, call it a radius.

Do not label a 5-km circle as "10-minute drive time" without evidence.

If genuinely free, reproducible routing can be implemented with reasonable effort, evaluate it.

Do not add an operationally heavy routing stack merely to impress reviewers.

### Self-overlap / cannibalization

Design metrics such as:

* pairwise catchment intersection area
* overlap coefficient
* percentage of branch catchment covered by another Bedashing branch
* number of own branches within N km
* overlap weighted by estimated demand/population
* nearest-own-branch distance

Distinguish between:

* beneficial network density
* potential cannibalization

### Competitive pressure

Research:

* competitor count
* weighted competitor count
* competitor quality
* competitor similarity
* distance decay
* competitors per catchment
* competitor-to-demand ratio
* local saturation

Important reasoning principle:

**Zero competition is not automatically good.**

Some competition validates market demand.

Design a mechanism that can distinguish:

* whitespace with validated demand
* healthy competitive market
* oversaturated market
* empty market with weak demand

This should be explicitly investigated.

---

# 10. WHITESPACE / GROWTH OPPORTUNITY ENGINE

Research a defensible way to generate candidate opportunity areas across the UAE without manually picking neighborhoods.

Investigate a grid-based approach such as H3.

Possible conceptual pipeline:

`Urban study area → H3 cells → demand features → competition → own-network coverage → accessibility → exclusions → opportunity score`

Research appropriate spatial resolution rather than arbitrarily choosing one.

Potential opportunity inputs include:

* market demand proxy
* residential/population density
* lifestyle/commercial activity
* competitor-market validation
* saturation penalty
* Bedashing cannibalization penalty
* distance from existing Bedashing network
* access
* premium-location proxies
* data confidence

Design classifications:

* GROW
* WATCH
* SKIP

Do not create false precision.

A simple transparent score with meaningful feature contributions is better than an opaque machine-learning model trained on nonexistent ground truth.

---

# 11. EXISTING-BRANCH RECOMMENDATION ENGINE

Research and design the methodology for:

* PROTECT
* HOLD
* SHRINK

We have no internal financial data.

Therefore recommendations must be explicitly framed as **strategic/public-data recommendations**, not final closure decisions.

Potential signals to investigate:

* branch reputation strength
* market demand
* peer-relative quality
* competitive pressure
* self-cannibalization
* network uniqueness
* local coverage importance
* accessibility
* branch archetype
* data confidence

Consider whether a branch that looks mediocre in isolation should still be protected because removing it creates a major coverage gap.

Likewise, a highly rated branch might still deserve review if it sits inside extreme self-overlap.

Design recommendation rules that make this kind of reasoning possible.

Avoid an arbitrary opaque weighted sum without justification.

For every score:

* define feature
* define direction
* define normalization
* define weighting logic
* define threshold logic
* define missing-data handling
* define confidence
* define sensitivity

---

# 12. SCENARIO ANALYSIS SHOULD BE INVESTIGATED

One potentially strong product differentiator is allowing leadership to change strategic assumptions.

Research whether we should allow scenarios such as:

* prioritize growth
* prioritize cannibalization reduction
* prioritize reputation
* prioritize underserved areas
* prioritize premium markets
* prioritize coverage preservation

Or allow controlled modification of model weights.

A user could ask:

> What happens if we care twice as much about cannibalization?

The recommendations should update deterministically.

This makes the product a decision-support system rather than a static ranking.

Investigate this carefully.

Do not build it yet.

---

# 13. CONFIDENCE AND UNCERTAINTY ARE FIRST-CLASS

Design a recommendation-confidence framework.

Potential contributors:

* source reliability
* source freshness
* number of independent corroborating sources
* completeness
* coordinate certainty
* competitor coverage quality
* review sample size
* demographic granularity
* catchment-method quality

Recommendations might carry:

* High confidence
* Medium confidence
* Low confidence

A low-confidence PROTECT/HOLD/SHRINK recommendation should visually communicate that a human needs more evidence.

This is especially important because the case study uses public proxies rather than internal operating data.

---

# 14. AI MUST OPERATE OVER TOOLS, NOT INVENT BUSINESS METRICS

The LLM must not be the source of truth for scoring.

Architecture principle:

**Deterministic systems calculate.
The agent interrogates, synthesizes, compares, explains, and reasons over structured outputs.**

The agent must not receive a prompt saying:

> Decide whether this branch should close.

Instead it should have typed tools such as concepts similar to:

* get_branch_profile
* get_branch_health
* get_branch_recommendation
* compare_branches
* get_catchment_metrics
* get_overlap_metrics
* get_nearby_competitors
* explain_score_components
* rank_branches
* search_opportunity_cells
* get_opportunity_profile
* run_scenario
* get_source_provenance

The exact tool set must be researched and designed.

Example user questions we eventually want to support:

> Why is this branch HOLD rather than PROTECT?

> Which two branches have the highest self-overlap?

> Compare Khalifa City with West Yas.

> Show me attractive growth areas in Dubai that are not heavily cannibalized.

> Which recommendations have the lowest data confidence?

> If competitor pressure is weighted 50% higher, what changes?

Every answer should be grounded in deterministic tool results.

Where appropriate, the AI response should cite data sources or show supporting metrics.

---

# 15. RESEARCH THE 2026 AGENTIC-AI LANDSCAPE

This is an AI Engineer assessment.

We should demonstrate awareness of modern AI engineering without turning the product into a buzzword showcase.

Conduct current research into:

* agent loops
* loop engineering
* graph engineering
* context engineering
* tool-using agents
* durable agent state
* evaluators/verifiers
* guardrails
* MCP
* A2A
* human-in-the-loop
* agent tracing / observability
* structured outputs
* bounded autonomy
* agent evaluation

Use primary/current sources wherever possible.

For each concept, produce one of:

**ADOPT**
**DEFER**
**REJECT**

and explain why.

Evaluate each using:

1. Does it improve user/business value?
2. Does it improve correctness?
3. Does it improve modularity?
4. Does it improve explainability?
5. Can it be demonstrated clearly?
6. Does it make the prototype meaningfully harder to reproduce?
7. Is it solving a real need or merely signaling novelty?

Novelty alone is not a reason to adopt something.

---

# 16. SPECIFIC AGENTIC ARCHITECTURE HYPOTHESES TO PRESSURE-TEST

Do not accept these blindly, but investigate them seriously.

## Hypothesis A — Loop engineering belongs in data refresh

A particularly meaningful use of loop engineering may be a bounded data-refresh/validation workflow:

`discover current sources`
→ `fetch/update`
→ `normalize`
→ `compare with previous snapshot`
→ `detect anomalies`
→ `validate`
→ `calculate confidence`
→ `human approval if material changes`
→ `publish new snapshot`
→ `stop`

This is much more relevant than adding an endless "reflection loop" to a chat bot.

Determine whether this is worth implementing later or merely documenting for the prototype.

If implemented later, it must have:

* bounded retries
* validation conditions
* stop conditions
* state
* evidence
* escalation criteria

## Hypothesis B — Graph engineering fits interactive analysis

Investigate an explicit workflow approximately like:

`User Question`
→ `Intent / Task Interpretation`
→ `Tool Plan`
→ `Deterministic Geospatial/Portfolio Tools`
→ `Evidence Validation`
→ `Synthesis`
→ `Grounded Answer`

with branches for:

* branch analysis
* branch comparison
* overlap analysis
* whitespace analysis
* scenario analysis

Determine whether a graph runtime is justified or ordinary structured tool calling is sufficient.

## Hypothesis C — MCP can provide modular analytics tools

Investigate exposing the deterministic portfolio/geospatial engine through an MCP server.

Potential benefit:

The same domain tools could be consumed by:

* our application agent
* Codex
* Claude
* another MCP-capable client
* future internal tools

This could demonstrate genuinely modular AI architecture.

But do not implement MCP just to say "we used MCP."

Determine whether:

* MCP should be core architecture,
* an optional adapter,
* or deferred.

## Hypothesis D — A2A may be overkill

A2A is useful for independently operating agents that need to communicate across systems.

This case may not need that.

Do not manufacture multiple agents solely to demonstrate A2A.

Research it and explicitly decide.

A well-reasoned "A2A is inappropriate here because..." may be more impressive than needless implementation.

## Hypothesis E — Human-in-the-loop should occur at meaningful gates

Most analytics operations are read-only and do not need approval.

Potential meaningful HITL points include:

* accepting a changed recommendation model
* publishing a refreshed data snapshot with anomalous changes
* overriding a recommendation
* approving a portfolio action plan/export
* accepting low-confidence recommendations

Determine the right boundary.

---

# 17. SELECT THE BEST TECH STACK — DO NOT DEFAULT BY HABIT

Research alternatives and write an Architecture Decision Record.

We need a stack optimized for:

* fast prototype iteration
* real geospatial capability
* excellent interactive UX
* strong AI tooling
* modularity
* local reproducibility
* low infrastructure burden
* clear separation of analytics from presentation

Strong candidates worth evaluating include, but are not prescriptions:

### Frontend

* React
* Next.js
* TypeScript
* Vite where simpler

### Mapping / geospatial visualization

* MapLibre GL JS
* deck.gl
* React MapLibre
* alternative mapping libraries where justified

We need interactive support for potentially:

* branch points
* competitor points
* catchment polygons
* overlap
* density
* H3 cells
* opportunity heatmaps
* selected branch highlighting

### Backend / analytics

Python likely deserves serious consideration because of:

* geospatial tooling
* data science ecosystem
* AI ecosystem

Evaluate:

* FastAPI
* Pydantic
* GeoPandas
* Shapely
* DuckDB Spatial
* H3
* Polars/Pandas where appropriate
* Parquet / GeoParquet

Do not deploy PostGIS simply because geospatial products often use PostGIS.

For this prototype, a local DuckDB/Parquet architecture may be substantially easier to reproduce.

Investigate and decide.

### AI

Compare current approaches such as:

* direct model tool calling
* OpenAI Responses API
* OpenAI Agents SDK
* LangGraph
* another mature agent runtime if clearly superior

Do not combine multiple agent frameworks without a reason.

Choose one primary abstraction.

### State

Prefer the simplest architecture that supports the case.

Static versioned data snapshots may be enough.

Do not add Redis, Kafka, Kubernetes, or distributed infrastructure unless a real requirement demands it.

---

# 18. OFFLINE / NO-SECRET FALLBACK IS REQUIRED

The assessment says reviewers must still be able to evaluate the product if external dependencies are unavailable.

Design the application around a committed/reproducible static processed dataset.

External data acquisition should happen through explicit refresh scripts, not every time the application loads.

Desired concept:

`Public sources`
→ `ingestion scripts`
→ `validation`
→ `processed reproducible snapshot`
→ `application`

The application should run against the processed snapshot without requiring live third-party data APIs.

If the AI provider requires an API key, design an `AI disabled` or deterministic fallback mode in which:

* map works
* scores work
* recommendations work
* explanations can fall back to structured templates
* the reviewer can still assess the complete analytics product

AI should enhance the product rather than make the entire product fail without a key.

---

# 19. PAID / CREDENTIALED API RULE

Do not use a paid API simply because it makes research easier.

First exhaust:

* company sources
* government data
* open datasets
* open web information
* Overture
* OpenStreetMap
* static downloadable datasets
* legally accessible public directories
* local computation

If you conclude that a paid or credentialed API is materially necessary:

**STOP and ask me before using it.**

Your request must explain:

* exact API/provider
* exact data/function required
* why free/public alternatives are insufficient
* whether a free tier exists
* expected cost
* implementation benefit
* fallback if I decline

Do not quietly introduce paid dependencies.

---

# 20. DATA ENGINEERING ARCHITECTURE

Design clean data boundaries.

Investigate a structure approximately like:

`data/raw/`
`data/interim/`
`data/processed/`
`data/reference/`

and a source manifest.

Never manually edit derived data when a reproducible transformation can generate it.

Design schemas for at least:

### Branch

Potential concepts:

* branch_id
* name
* coordinates
* emirate
* community
* archetype
* address
* operating status
* rating signals
* source metadata
* confidence

### Competitor

* competitor_id
* brand
* name
* coordinates
* competitor class
* similarity weight
* rating signals
* source
* confidence

### Catchment

* branch_id
* method
* radius/time
* geometry
* calculated metadata

### Branch metrics

* demand
* competition
* overlap
* reputation
* network uniqueness
* confidence

### Recommendation

* label
* score
* factors
* confidence
* thresholds
* model/version

### Opportunity cell

* H3/spatial ID
* geometry
* demand
* competition
* cannibalization
* accessibility
* opportunity score
* label
* confidence
* factor contributions

Schemas should be versionable.

---

# 21. RECOMMENDATION VERSIONING

Recommendations should have an explicit model version.

Example concept:

`existing_branch_model_v1`

`whitespace_model_v1`

Store:

* weights
* thresholds
* transformations
* feature definitions
* model version

This enables:

* reproducibility
* scenario analysis
* explainability
* future refinement

Do not bury business rules inside arbitrary frontend code.

---

# 22. EXPLAINABILITY DESIGN

The product should not merely display:

`PROTECT — Score 82`

It should explain:

**Why?**

Design a factor-contribution representation.

For example conceptually:

Positive:

* strong demand
* strong peer-relative reputation
* unique network coverage

Negative:

* high competition
* moderate self-overlap

Confidence:

* High

Evidence:

* sources and freshness

Investigate visual formats such as:

* contribution bar
* waterfall
* ranked factors
* score decomposition

Avoid inappropriate SHAP terminology if no learned model is being explained.

---

# 23. UI / PRODUCT DESIGN MUST USE IMPECCABLE

The UI must not look like generic AI-generated SaaS.

The design framework is:

`https://github.com/pbakaus/impeccable`

Research its **current** Codex instructions rather than relying on stale setup information.

Before UI implementation begins in a later phase, we intend to install Impeccable for Codex and use its workflow.

Plan for:

* product truth in `PRODUCT.md`
* design decisions in `DESIGN.md`
* shape before build
* critique
* audit
* polish
* hardening
* accessibility
* responsive behavior

Do not implement those files blindly in Phase 0 unless required by the current Impeccable workflow. Research the correct sequence first.

### Product UX hypothesis to investigate

This should probably feel like an **operator's geospatial decision workspace**, not a marketing site and not a grid of KPI cards.

Explore a layout concept centered on:

* persistent interactive map
* portfolio/table navigation
* layer controls
* branch/opportunity contextual detail
* recommendation explanation
* scenarios
* AI analyst
* provenance/confidence

Potential map layers:

* Bedashing network
* catchments
* self-overlap
* competitors
* competitive density
* market demand
* whitespace opportunity

Clicking a branch should reveal useful decision information.

Clicking an opportunity area should explain GROW/WATCH/SKIP.

Natural language should complement map exploration, not replace it.

### Avoid stereotypical AI UI

Especially avoid:

* purple/blue AI gradients
* excessive glassmorphism
* card-inside-card layouts
* giant useless hero sections
* excessive rounded rectangles
* generic sparkle icons
* random floating chat bubble
* vague "AI Insights" copy
* massive whitespace that harms analytical density
* decorative charts that do not support decisions

Research Bedashing's actual visual identity and decide whether/how it should influence the internal decision-support application.

Do not simply copy their consumer website.

---

# 24. THINK IN USER JOURNEYS

Define a small number of core workflows.

For example:

### Workflow 1 — Network overview

Leadership opens the app and immediately understands:

* network footprint
* overall recommendation mix
* major overlap
* major opportunity areas

### Workflow 2 — Investigate a branch

Select branch.

See:

* branch context
* peer group
* health
* competition
* catchment
* overlap
* recommendation
* factor contributions
* confidence
* evidence

### Workflow 3 — Compare branches

Select two or more branches.

Compare normalized factors.

### Workflow 4 — Find whitespace

Explore opportunity layer.

Select candidate area.

See GROW/WATCH/SKIP and why.

### Workflow 5 — Ask the analyst

Ask a natural-language portfolio question.

Agent calls deterministic tools and returns a grounded response.

### Workflow 6 — Scenario planning

Change strategic assumptions and see recommendations update.

Research whether these are the right workflows and refine them.

---

# 25. TESTABILITY MUST BE DESIGNED NOW

Every module needs a verification strategy.

Research tests for:

### Data

* schema validation
* duplicates
* coordinates inside plausible UAE bounds
* source completeness
* impossible ratings
* stale records
* branch-count changes
* missing values

### Geography

* distance calculations
* catchment geometries
* intersections
* area units
* H3 conversion
* nearest-neighbor correctness

### Recommendations

* deterministic outputs
* threshold boundaries
* weight changes
* missing-data behavior
* confidence logic
* no impossible label combinations

### Agent

* only uses permitted tools
* does not invent branch metrics
* tool results support claims
* cannot silently override deterministic recommendations
* handles unavailable data
* tool-call budget / loop termination
* grounded-answer evaluation

### UI

Later:

* important interactions
* loading/error states
* empty states
* responsive behavior
* accessibility
* map synchronization

---

# 26. RESEARCH OBSERVABILITY / AI EVALUATION

If we build a tool-using agent, design observability from the beginning.

Research:

* traces
* tool-call logs
* execution duration
* tool failures
* token/model usage
* structured outputs
* grounding checks
* agent evaluation cases

Create a small future evaluation dataset of natural-language questions such as:

* comparison questions
* ranking questions
* recommendation explanations
* whitespace questions
* ambiguous requests
* unsupported requests

We should later be able to test whether the AI analyst gives grounded answers.

---

# 27. TECHNICAL README REQUIREMENT

A technical README is mandatory in the final assessment.

Do not spend Phase 0 polishing it, but design its final structure now.

It should eventually be optimized for a time-constrained reviewer.

Research/propose a README structure approximately covering:

* what the product is
* 60-second quick start
* screenshot / preview
* architecture
* project structure
* data sources
* recommendation methodology
* AI architecture
* setup
* environment variables
* run commands
* fallback/no-AI mode
* tests
* refresh-data commands
* limitations
* assumptions
* responsible-use notes
* design decisions

Never claim setup commands work until they have actually been tested later.

---

# 28. PRIORITIZATION

We are trying to **ace the assessment**, not maximize code volume.

Prioritize in this order:

1. Functional assessment coverage
2. Real Bedashing/UAE research
3. Defensible business reasoning
4. Geospatial usefulness
5. Recommendation explainability
6. Excellent interactive product
7. Meaningful AI
8. Reproducibility
9. Visual polish
10. Additional sophistication

Do not sacrifice 1–6 to implement fashionable agent infrastructure.

---

# 29. MODULAR DELIVERY STRATEGY

Design later development as independently reviewable vertical slices.

Do not assume the exact phases below are correct; improve them if necessary.

A sensible direction may resemble:

### Phase 1 — Real Branch Data + Data Foundation

Goal:

A reproducible Bedashing branch dataset with coordinates, provenance, schemas, validation, and a minimal way to inspect it.

### Phase 2 — Map + Network Exploration

Goal:

Working product surface showing the real branch network and branch detail.

### Phase 3 — Catchments + Self-Overlap

Goal:

Meaningful coverage and cannibalization layer.

### Phase 4 — Competitors

Goal:

Real competitor data, competitive sets, density/pressure.

### Phase 5 — Branch Health + PROTECT/HOLD/SHRINK

Goal:

Deterministic explainable branch decisions.

### Phase 6 — Whitespace + GROW/WATCH/SKIP

Goal:

Opportunity grid and growth recommendations.

### Phase 7 — Scenario / Explainability UX

Goal:

Make the decision model interactive and transparent.

### Phase 8 — AI Portfolio Analyst

Goal:

Grounded tool-using natural-language decision support.

### Phase 9 — Agentic Enhancements Where Justified

Potentially MCP, bounded refresh loop, HITL, tracing, or graph orchestration.

Only technologies approved during research should be introduced.

### Phase 10 — Hardening + README

Goal:

Fast reviewer setup, fallback mode, tests, polished interface, clear limitations.

You must produce precise acceptance criteria and suggested Git commit boundary for every phase.

Each phase should end in a meaningful working state.

---

# 30. PHASE 0 FILE DELIVERABLES

Create a coherent research/architecture documentation structure in the repository.

Prefer something similar to:

`docs/research/00_requirements_traceability.md`

`docs/research/01_business_framing.md`

`docs/research/02_bedashing_and_market_research.md`

`docs/research/03_data_source_strategy.md`

`docs/research/04_geospatial_methodology.md`

`docs/research/05_recommendation_methodology.md`

`docs/research/06_agentic_ai_research.md`

`docs/research/07_tech_stack_decision.md`

`docs/research/08_product_ux_plan.md`

`docs/research/09_execution_roadmap.md`

`docs/research/10_assumptions_risks_open_questions.md`

Also create, if appropriate:

`docs/ARCHITECTURE.md`

`docs/DECISIONS.md`

and a machine-readable or tabular source registry such as:

`docs/research/source_registry.csv`

You may improve names/organization if you have a better structure.

Do not produce ten documents containing repetitive filler.

Cross-reference them.

The research documents should be useful during implementation, not written merely to appear comprehensive.

---

# 31. RESEARCH QUALITY BAR

For factual/current claims:

* cite exact source
* include access date
* prefer primary evidence
* distinguish fact from inference
* distinguish current information from historical information
* identify conflicting sources
* never fabricate missing coordinates, ratings, demographics, branches, competitors, or revenue
* never silently substitute assumptions for facts

Whenever an assumption is necessary, mark it explicitly as:

`ASSUMPTION`

Whenever something requires later validation:

`VALIDATION NEEDED`

Whenever a data source has a material limitation:

`LIMITATION`

Whenever a future decision depends on me:

`USER DECISION`

---

# 32. DECISION RECORDS

For major architecture choices, document:

* decision
* options considered
* selected option
* reason
* trade-offs
* why rejected alternatives were rejected
* when the decision should be revisited

At minimum create decisions for:

* frontend framework
* map stack
* backend
* spatial compute/storage
* data snapshot strategy
* opportunity spatial unit
* catchment method
* recommendation methodology
* AI framework
* MCP
* A2A
* HITL
* loop/graph orchestration
* deployment approach

---

# 33. WHAT WOULD MAKE THIS PROJECT STAND OUT?

As part of your research, identify 3–5 defensible differentiators.

Do not propose gimmicks.

Strong candidates may include concepts like:

* recommendation confidence based on data quality
* source provenance visible in-product
* peer-normalized branch health
* non-linear treatment of competition as both validation and saturation
* self-cannibalization analysis
* strategic network uniqueness
* scenario simulation
* grounded AI explanations
* reproducible data snapshots
* bounded data-refresh agent loop

Research and rank the best ones.

Explain why each would impress a reviewer **in the context of this assessment**, not generally.

---

# 34. REQUIRED END-OF-RUN RESPONSE

Once all Phase 0 research artifacts are complete, give me a concise executive summary in chat containing:

### 1. Product thesis

What exactly are we building?

### 2. Primary decision-maker

Who is it for?

### 3. Recommended architecture

Frontend + backend + data + map + AI.

### 4. Recommendation methodology

How PROTECT/HOLD/SHRINK and GROW/WATCH/SKIP will work at a high level.

### 5. Agentic AI verdict

For each:

* Loop Engineering
* Graph Engineering
* MCP
* A2A
* HITL

state:

`ADOPT / DEFER / REJECT`

with one-sentence rationale.

### 6. Best public data strategy

What sources should we actually use?

### 7. Biggest risks

What might undermine the case study?

### 8. Top differentiators

What will make the solution stand out?

### 9. Modular roadmap

List the implementation phases and acceptance criteria.

### 10. Phase 1 recommendation

Tell me exactly what we should build first.

Then provide a **proposed Phase 1 Codex prompt**, but DO NOT execute Phase 1.

---
# 35. AI MODEL ACCESS / ENVIRONMENT

A `.env` file exists in the repository environment with credentials that may be used for the AI component of this project.

You may use the configured OpenAI API credentials when we begin implementing and testing the AI functionality.

Important constraints:

- Start development and testing with inexpensive models where possible, such as GPT-4o-mini or another appropriate low-cost model available through the configured API.
- Do not use expensive models by default when a cheaper model is sufficient for development, tool-calling tests, structured-output tests, or agent evaluation.
- Model choice must be configurable through environment variables rather than hardcoded throughout the application.
- Design the AI abstraction so that changing the model later does not require rewriting the application architecture.
- Use stronger/more expensive models only when there is a demonstrated quality requirement that cheaper models cannot satisfy.
- Track where model quality materially affects behavior.

The `.env` file contains secrets.

Therefore:

- NEVER print secrets into terminal output unnecessarily.
- NEVER write API keys into source files.
- NEVER copy secrets into documentation.
- NEVER commit `.env`.
- Confirm `.env` is ignored by Git.
- Provide a safe `.env.example` later containing variable names only, with no real credentials.
- Never expose secrets to the frontend/browser bundle.

# 36. FINAL OPERATING PRINCIPLES

Keep these principles active throughout the research:

**Business problem before AI.**

**Geography must change the decision, not merely decorate it.**

**Deterministic analytics before LLM reasoning.**

**LLMs explain structured evidence; they do not fabricate metrics.**

**Public proxies must never masquerade as internal financial performance.**

**Confidence and provenance are features.**

**Competition can validate demand as well as create saturation.**

**Network value matters in addition to branch-level strength.**

**Peer comparison should respect branch context.**

**Use agentic technology only where it earns its complexity.**

**Free, reproducible data before paid APIs.**

**A working, defensible product beats an over-engineered architecture.**

**Follow every Minimum Functional Requirement in the assessment exactly.**

**Do not build everything at once.**

**Do not commit or push without explicit instruction.**

**Stop after Phase 0 and let me review the plan.**

# 37. PERSISTENT PROJECT MEMORY

Maintain a root-level file named:

`memory.md`

This file is the project's persistent engineering memory across Codex work sessions.

Every time a new work session begins:

1. Read `memory.md` before making changes.
2. Read the relevant project documentation and current repository state.
3. Use `memory.md` to understand what has already been researched, attempted, validated, rejected, or left unfinished.
4. Do not repeat previously failed approaches unless there is new evidence justifying another attempt.

At the end of every meaningful work session, update `memory.md`.

This file should be concise but useful. It is NOT a chronological dump of every terminal command or conversation.

Maintain sections similar to:

## Current Project State

What currently works and what major components exist.

## Completed Work

Important completed components and validated decisions.

## Tried and Validated

Approaches, libraries, APIs, data sources, algorithms, or designs that have been tested successfully.

## Tried and Rejected

Things we attempted that did not work well, including WHY they failed.

Examples:

- inadequate UAE coverage
- unreliable source
- licensing problem
- poor API behavior
- unacceptable latency
- unnecessary complexity
- weak UX
- inaccurate geospatial result
- bad model behavior

This is particularly important so future sessions do not waste time rediscovering failed approaches.

## Architecture Decisions

Important choices that future work must respect, with links to ADRs/docs where applicable.

## Data Decisions

Current authoritative data sources, known conflicts, data-quality findings, and assumptions.

## AI / Agent Findings

What models, prompts, tools, agent flows, structured outputs, and evaluation approaches have actually been tested.

Record:

- what worked
- what failed
- important model limitations
- grounding issues
- tool-use behavior
- cost/latency observations where useful

## UI / UX Decisions

Important product/design decisions already established, including Impeccable findings.

## Known Issues / Technical Debt

Things that currently work imperfectly or require later attention.

## Open Questions

Unresolved questions requiring research or a user decision.

## Next Recommended Step

The most logical next unit of work.

## Last Updated

Date plus a short description of the most recent meaningful change.

---

Rules for `memory.md`:

- Record facts learned from actual implementation/testing, not speculative ideas.
- Clearly distinguish confirmed findings from hypotheses.
- Update stale information when later evidence contradicts it.
- Prefer concise summaries over enormous logs.
- Link to detailed research documents rather than duplicating them.
- Never store credentials, API keys, tokens, or sensitive `.env` values.
- Do not treat `memory.md` as authoritative over the actual codebase; if they disagree, inspect the implementation and resolve the discrepancy.
- Do not silently delete useful failed-experiment history.
- Before proposing a major architectural change, check whether the same idea has already been evaluated.

# 38. GIT HYGIENE / `.gitignore`

Maintain a root-level `.gitignore` throughout the project.

At the beginning of each meaningful implementation phase:

1. Inspect the current `.gitignore`.
2. Compare it against the technologies, tooling, generated artifacts, local datasets, caches, secrets, and build outputs introduced by that phase.
3. Add any newly required ignore rules before those files can accidentally be committed.

At minimum, `.gitignore` should protect against committing:

- `.env`
- other local secret/config files containing credentials
- Python virtual environments
- Python caches
- notebook checkpoints where applicable
- Node.js dependencies
- frontend build output
- framework caches
- test caches
- coverage output
- local IDE/editor files where appropriate
- OS-generated files
- temporary files
- logs
- large generated intermediate datasets
- local model/provider caches
- temporary geospatial exports
- local database files that are not intentionally part of the reproducible project snapshot

However:

- Do not blindly ignore all data files.
- Reproducible processed datasets that are intentionally part of the reviewer experience may need to remain version-controlled.
- Do not ignore files required to run the project simply because they are generated.
- Make deliberate decisions about which artifacts belong in Git versus which should be regenerated locally.
- If a file is large, generated, environment-specific, or contains secrets, evaluate whether it belongs in `.gitignore`.
- Never add `.env` or real secrets to Git.
- If a secret file was accidentally tracked previously, do not assume adding it to `.gitignore` removes it from Git history; explicitly surface that issue to me.
- Keep `.gitignore` organized and readable as the stack evolves.

Whenever `.gitignore` is updated, record any important repository-hygiene decision in `memory.md` if future sessions need to know about it.
