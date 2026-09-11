# Phase 6 — Whitespace research

## Outcome

Phase 6 produces 1,939 bounded H3 research-screening cells across the Dubai and Abu Dhabi city clusters. It does not recommend an opening, estimate demand, or rank locations as commercial opportunities.

## 6A: Candidate-cell contract

Phase 6 identifies places that warrant expansion **research**, not sites that should open. Candidate cells will use H3 resolution 8 with resolution 7/9 sensitivity checks, inside a bounded and source-reviewed urban study area.

The current data cannot support a demand claim. Therefore the contract permits active-network distance/coverage and limited competitor validation/saturation only as geographic screening inputs. It withholds all opportunity labels as `RESEARCH_REQUIRED` until source-backed built-environment context and an urban study boundary exist.

It explicitly prohibits inferring demand from an empty competitor field, distance from Bedashing, or absent POI data.

## 6B–6F: Bounded screening

The user supplied coordinates and status validation for seven urban-context anchors. Four active anchors are used only to identify cells near a researched urban context: Dubai Hills Mall, Dubai Hills Estate, Reem Mall, and Saadiyat Cultural District. City Walk and Yas Mall are retained as controls; Rashid Yachts is excluded because the user marked it temporarily closed. The authoritative context and the user validation are both retained in the source registry.

The process is deterministic:

1. Generate H3 resolution-8 centroids only inside the two configured study-area bounding boxes.
2. Retain a centroid only when it is 3–8 km from an active Bedashing branch. This is a spacing screen, not a catchment or travel-time measure.
3. Calculate a limited, transparent competitor-pressure lower bound from the verified Sisters and NStyle records. It is not a full competitive census.
4. Apply conservative research labels:
   - `SKIP_RESEARCH` when lower-bound pressure is at least 1.5.
   - `WATCH_RESEARCH` when pressure is below 1.5 and the cell is within 2 km of a high-priority anchor.
   - `RESEARCH_REQUIRED` in every other case.

`WATCH_RESEARCH` means only “worth manually investigating next”; it does not mean “open here.” `SKIP_RESEARCH` means the limited model sees high pressure, not that the area has no opportunity. Confidence is deliberately capped at 20% because built-environment and demand evidence are absent.

## Product surface and verification

The map has an opt-in “Show bounded whitespace research cells” layer and an always-visible WATCH/SKIP/RESEARCH color key. Selecting a cell exposes the calculated network distance, high-priority-anchor distance, limited competitor-pressure lower bound, confidence, and the limitation. A branch selection returns the detail panel to branch evidence. User-confirmed permanently closed Bedashing locations are bold red in the roster and red on the map, so they remain historically auditable but are visually distinct from the active network.

`scripts/build_whitespace_candidates.py` regenerates the snapshot. `scripts/validate_whitespace_contract.py`, `scripts/validate_whitespace_candidates.py`, and the whitespace tests protect the contract and label boundaries. Overture Places was assessed for a richer POI route but did not yield a usable bounded UAE extract, so it is recorded as an attempted—not substituted—source.
