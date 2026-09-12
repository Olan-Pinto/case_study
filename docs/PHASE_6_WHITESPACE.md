# Phase 6 — Whitespace research

## Outcome

Phase 6 produces 1,939 bounded H3 research-screening cells across the Dubai and Abu Dhabi city clusters. The remediated model ranks cells for manual follow-up using WorldPop 2025 residential context, own-network spacing, validated urban-context proximity, and a limited two-brand competitor screen. It does not recommend an opening or estimate commercial success.

## 6A: Candidate-cell contract

Phase 6 identifies places that warrant expansion **research**, not sites that should open. Candidate cells will use H3 resolution 8 with resolution 7/9 sensitivity checks, inside a bounded and source-reviewed urban study area.

The current data cannot support a demand claim. Therefore the contract permits active-network distance/coverage and limited competitor validation/saturation only as geographic screening inputs. It withholds all opportunity labels as `RESEARCH_REQUIRED` until source-backed built-environment context and an urban study boundary exist.

It explicitly prohibits inferring demand from an empty competitor field, distance from Bedashing, or absent POI data.

## 6B–6F: Bounded screening

The user supplied coordinates and status validation for seven urban-context anchors. Four active anchors are used only to identify cells near a researched urban context: Dubai Hills Mall, Dubai Hills Estate, Reem Mall, and Saadiyat Cultural District. City Walk and Yas Mall are retained as controls; Rashid Yachts is excluded because the user marked it temporarily closed. The authoritative context and the user validation are both retained in the source registry.

The process is deterministic:

1. Generate H3 resolution-8 cells only inside the two configured study-area bounding boxes and preserve each cell's true polygon boundary.
2. Retain a cell only when its centre is 3–8 km from an active Bedashing branch. This is a spacing screen, not a catchment or travel-time measure.
3. Calculate a limited, transparent competitor-pressure lower bound from the verified Sisters and NStyle records. It is not a full competitive census.
4. Convert each available input to a 0–1 factor and calculate a 0–100 research-priority score:
   - residential intensity: 50 points, using the within-study-area WorldPop percentile;
   - own-network spacing: 20 points, linear from zero at 3 km to full credit at 8 km;
   - urban-context proximity: 15 points, full credit at a validated high-priority anchor and zero at 5 km;
   - competitor market validation: 15 points, using a triangular transform that peaks at lower-bound pressure 0.75 and falls to zero at pressure 0 or 1.5.
5. Apply queue labels: `PRIORITIZE_RESEARCH` at 60+, `WATCH_RESEARCH` at 40–59.99, and `DEPRIORITIZE_RESEARCH` below 40. A cell without valid WorldPop coverage receives no score and remains `RESEARCH_REQUIRED`.

The weights and thresholds are declared product assumptions, not facts learned from historical openings. They make the research queue reproducible and challengeable. Moderate competitor evidence can validate an active category; heavy pressure reduces priority. `DEPRIORITIZE_RESEARCH` replaces the overly absolute `SKIP_RESEARCH` wording.

## Residential-context remediation

The project now downloads the versioned 6.52 MB WorldPop Global2 UAE 2025 raster into ignored `data/raw/`, verifies SHA-256 `8cf781de6e1031425dc645c743f932cf778af10a93a890a51255f76c34f2e5b9`, and aggregates non-negative approximately 100 m pixel values by pixel centre into each H3 cell. Raw data stays out of Git; the small per-cell context snapshot is committed. Percentiles are calculated within each configured study area rather than presented as an absolute UAE opportunity rank.

WorldPop describes the R2025A v1 product as an alpha, random-forest dasymetric population estimate. It is useful as a consistent residential-presence proxy across both cities, but it is not an observation of Bedashing customers, women, income, spending power, footfall, or beauty-service demand. Cells with no valid raster pixels remain explicitly missing instead of being converted to zero, and the research score is withheld for those cells.

Evidence confidence is 70% for scored cells: the rounded simple average of population-model reliability (65%), cell coverage (100%), active-network completeness (90%), competitor scope (35%), destination-anchor scope (30%), and transformation reproducibility (100%). This is confidence in the bounded research screen—not the probability that a salon would succeed.

## Product surface and verification

The map has an opt-in “Show whitespace research areas” layer and a four-state priority key. It renders the actual H3 hexagon boundaries—not centroid dots—so each mark means a screening area rather than a precise proposed site. Selecting anywhere inside a hexagon exposes the score, all four factor values and point contributions, confidence components, required-evidence missingness, and limitations. A branch selection returns the detail panel to branch evidence.

`scripts/acquire_worldpop_population.py` downloads and verifies the ignored source raster. Both population aggregation and final scoring generate the candidate universe through `scripts/whitespace_grid.py`, avoiding a circular dependency on an already-built output. Validators and tests protect source version, geometry, transforms, score decomposition, thresholds, and missingness.
