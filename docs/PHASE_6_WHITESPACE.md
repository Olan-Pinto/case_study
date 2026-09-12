# Phase 6 — Whitespace research

## Outcome

Phase 6 produces 1,939 bounded H3 research-screening cells across the Dubai and Abu Dhabi city clusters. A later remediation adds WorldPop 2025 modelled residential context to those cells without treating residents as customers or demand. It does not recommend an opening or rank locations as commercial opportunities.

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
4. Apply conservative research labels:
   - `SKIP_RESEARCH` when lower-bound pressure is at least 1.5.
   - `WATCH_RESEARCH` when pressure is below 1.5 and the cell is within 2 km of a high-priority anchor.
   - `RESEARCH_REQUIRED` in every other case.

`WATCH_RESEARCH` means only “worth manually investigating next”; it does not mean “open here.” `SKIP_RESEARCH` means the limited model sees high pressure, not that the area has no opportunity. Confidence is deliberately capped at 20% because built-environment and demand evidence are absent.

## Residential-context remediation

The project now downloads the versioned 6.52 MB WorldPop Global2 UAE 2025 raster into ignored `data/raw/`, verifies SHA-256 `8cf781de6e1031425dc645c743f932cf778af10a93a890a51255f76c34f2e5b9`, and aggregates non-negative approximately 100 m pixel values by pixel centre into each H3 cell. Raw data stays out of Git; the small per-cell context snapshot is committed. Percentiles are calculated within each configured study area rather than presented as an absolute UAE opportunity rank.

WorldPop describes the R2025A v1 product as an alpha, random-forest dasymetric population estimate. It is useful as a consistent residential-presence proxy across both cities, but it is not an observation of Bedashing customers, women, income, spending power, footfall, or beauty-service demand. Cells with no valid raster pixels remain explicitly missing instead of being converted to zero. This first component exposes the evidence in the UI but does not yet use it in WATCH/SKIP/RESEARCH_REQUIRED labels.

## Product surface and verification

The map has an opt-in “Show whitespace research areas” layer and an always-visible WATCH/SKIP/RESEARCH color key. It renders the actual H3 hexagon boundaries—not centroid dots—so each mark means a screening area rather than a precise proposed site. Selecting anywhere inside a hexagon outlines it and exposes the calculated network distance, high-priority-anchor distance, limited competitor-pressure lower bound, confidence, and limitation. A branch selection returns the detail panel to branch evidence. Permanently closed Bedashing locations are bold red in the roster and red on the map, so they remain historically auditable but are visually distinct from the active network.

`scripts/acquire_worldpop_population.py` downloads and verifies the ignored source raster. `scripts/build_whitespace_population_context.py` creates its derived context snapshot. `scripts/build_whitespace_candidates.py` joins that evidence into the map snapshot. The population-context validator, whitespace validators, and whitespace tests protect missingness, source version, geometry, and label boundaries. Overture Places was assessed for a richer POI route but did not yield a usable bounded UAE extract, so it is recorded as an attempted—not substituted—source.
