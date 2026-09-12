# Phase 3 network geometry

## Deliverable

`data/processed/network_metrics_v1.json` is a deterministic derived snapshot from the committed 24-location roster. It contains:

- nearest-own-branch ID and great-circle distance for every location;
- pairwise overlap metrics for 1 km, 3 km, and 5 km service-radius sensitivity bands; and
- each branch's overlap counts, maximum pairwise overlap coefficient, and sum of pairwise intersection areas.

The primary display band is **3 km**. It is a reviewable assumption, not a claim about travel time or actual customer catchment.

## Method

Distances use haversine with an Earth radius of 6,371.0088 km. For each band, overlap uses the analytic intersection area of two equal planar circles after distance is calculated. At this small scale, that is a transparent screening approximation. `sum_pairwise_intersection_area_km2` intentionally may double-count area shared with multiple locations; it is not a union-coverage measure.

## Reviewer visualization

The map can display the same 1 km, 3 km, or 5 km geometric radius used by the committed metrics. The selected active branch is orange; teal polygons are only the active branches with a recorded same-band pairwise overlap. Changing the distance band updates both the map and the selected branch's overlap count/coefficient in the evidence panel. Permanently closed locations never receive a radius.

These polygons are visual explanations of straight-line geometry. They are not routing isochrones, drive-time catchments, customer-origin areas, or measured cannibalization.

## Interpretation boundary

An overlap is a **network-density screen** only. It does not establish cannibalization, poor branch performance, or a closure/expansion decision. Later phases will add peer context, competitors, demand proxies, network uniqueness, and confidence before any recommendation label exists.

## Reproduce and verify

```powershell
py -3 scripts/build_network_metrics.py
py -3 scripts/validate_network_metrics.py
py -3 -m unittest discover -s tests -v
```

The interactive workspace now displays selected-branch nearest-network distance and the 3 km overlap screen in the evidence panel.
