# Geospatial methodology

## Coordinate and geometry rules

Store WGS84 longitude/latitude with accuracy and source. Validate UAE-plausible bounds before computation; use a projected CRS appropriate to each local metric for areas/buffers. Great-circle distance supports ranking; it is not travel time.

## Catchments

Start with transparent archetype-specific radial bands, e.g. 1/3/5 km, configured rather than hard-coded. Display them as **service radii**, not drive-time catchments. **ASSUMPTION:** the later exact radii will be chosen after examining branch spacing and archetype; Phase 3 must include sensitivity tests. Free road routing is deferred because it introduces operational/download weight without current proof that it changes material recommendations.

Compute own-network proximity, pairwise buffer intersection, overlap coefficient `area(A∩B)/min(area(A), area(B))`, share of branch buffer overlapped, nearest-own-branch distance, and coverage uniqueness (loss of reachable cells if removed). High density is not automatically cannibalization: density plus poor uniqueness and similar archetype/market context is the signal.

## Competition and market signal

`pressure = Σ(similarity × quality_proxy × exp(-distance/decay))` within disclosed bands. Compute a separate “market validation” term that rises from zero to moderate competitor presence then declines under high pressure. This non-linear treatment prevents the false inference that zero competition proves opportunity.

## Whitespace

Study urban UAE footprints, then H3 resolution 8 cells (candidate, **VALIDATION NEEDED**) with resolution 7/9 sensitivity checks. Filter non-urban/water/excluded cells. Aggregate only interpretable available signals: residential/urban intensity, premium/lifestyle/commercial POIs, tourism/hospitality where relevant, competitor validation/pressure, own-network distance/coverage, and confidence. Avoid unsupported demographic estimates.

## Tests

Test known-distance fixtures, symmetrical intersections, metric CRS area units, H3 round trips/neighbours, nearest-neighbour ties, bounds, coordinate precision, and geometry validity. Snapshot test a small fixed UAE fixture so geospatial-library upgrades cannot silently change recommendations.

## Phase 3 implementation note

`network_metrics_v1` implements the first transparent screen: 1/3/5 km geometric service radii, with 3 km primary. Great-circle distances use haversine; equal-radius intersection uses an analytic planar-circle formula at these small bands. It is explicitly not travel time or observed customer behavior. See `docs/PHASE_3_NETWORK_GEOMETRY.md`.
