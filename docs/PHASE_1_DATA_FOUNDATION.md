# Phase 1 data foundation

## Current snapshot

`data/processed/branches_snapshot_v2.json` is the current roster snapshot: 24 historically observed 2GIS beauty-lounge entries, excluding one separate head-office entry, match Bedashing’s official 24-UAE-lounge claim. User validation on 2026-09-09 identified 22 active records and two permanently closed records; the closed records remain in the historical roster but are excluded from active analysis. The prior 15-record `v0` snapshot is retained as research history. All 24 records are geocoded, but no coordinate is inferred or fabricated.

The official Bedashing locator claims 24 UAE lounges, but the server-rendered locator showed zero results and the official Zenoti booking endpoint returned an error during Phase 1 retrieval on 2026-09-08. These are retrieval limitations, not closure evidence.

## Reproducible checks

Run from the repository root:

```powershell
py -3 scripts/validate_branches.py
py -3 scripts/inspect_branches.py
py -3 -m unittest discover -s tests -v
```

These commands validate stable IDs, duplicate prevention, source presence, coordinate pairs, plausible UAE bounds, status guardrails, and manifest counts. They use Python's standard library only.

## Data contract

The formal record shape is [branch_record_v1.json](../schemas/branch_record_v1.json). Every record requires source IDs and a validation queue. All v1 coordinates are user-validated, 2GIS-attributed evidence; later snapshots may use null only when a coordinate is not responsibly evidenced.

## Next reconciliation work

Obtain a functioning official booking/locator feed or independently current official venue evidence for each location, reconcile canonical branch names/addresses, and then increment the snapshot version. Keep raw downloads out of Git and record every source in `docs/research/source_registry.csv`.

`py -3 scripts/geocode_openstreetmap.py` produces an ignored, review-only Nominatim candidate file in `data/interim/`. It never modifies a committed snapshot; a location is promoted only after human reconciliation with its source address.
