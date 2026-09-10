# Phase 4 competitor pressure

## What is in v1

This phase establishes a transparent competitor taxonomy and an intentionally limited, source-backed pressure lower bound. Official current locator evidence identifies Sisters Beauty Lounge as a direct premium full-service competitor and NStyle Beauty Lounge as a near-direct premium beauty competitor. The current evidence snapshot contains 15 active geocoded candidates, plus two user-confirmed permanently closed locations retained outside active pressure.

`competitors_snapshot_v1.json` preserves each record and its limitations. `competitor_pressure_v1.json` applies:

```text
lower_bound_pressure = Σ similarity_weight × exp(-great_circle_distance_km / 3)
```

The weights are 1.0 for direct premium full-service and 0.7 for near-direct premium beauty. They are transparent classification assumptions, not measurements of market share, pricing, quality, or performance.

## Crucial limitation

The active snapshot is limited to two high-relevance brands and does not represent all UAE salons. The user confirmed that Arabian Ranches and Zero 6 Mall are permanently closed through map and location validation; they are preserved for provenance and excluded from active pressure, even though the official locator still lists them. A zero value still means **no verified competitor from this evidence subset contributed**—not “there is no competition.” The product must not rank, classify, or make recommendations from this pressure output yet.

## Reproduce

```powershell
py -3 scripts/build_competitor_pressure.py
py -3 scripts/validate_competitor_pressure.py
py -3 -m unittest discover -s tests -v
```

## Next data-improvement path

Use independently current official locators and an attributable, licence-compatible UAE POI extraction (such as a bounded Overture Places query) to add relevant brands. Preserve raw input outside Git, retain release/source version, deduplicate, and increment the snapshot only after review.
