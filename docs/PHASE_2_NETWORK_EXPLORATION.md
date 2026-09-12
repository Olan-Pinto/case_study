# Phase 2 network exploration

## What this module does

The local React workspace reads the committed `branches_snapshot_v2.json` directly in the browser. It provides:

- A UAE map with all 24 evidence-backed branch points.
- Emirate and text filters.
- Linked map and roster selection.
- An evidence panel with address, coordinate provenance, snapshot ID, outstanding validation notes, and exact source URLs.

It needs no API key and has no backend, live branch refresh, score, recommendation, or AI call. The OSM basemap is optional visual context: browser users may still inspect all branch facts and evidence if tiles cannot load.

## Run and verify

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite. For a production verification:

```powershell
npm run build
py -3 scripts/validate_branches.py
py -3 -m unittest discover -s tests -v
```

## Map-source boundary

MapLibre GL JS renders the local branch GeoJSON. The interactive basemap uses `tile.openstreetmap.org` with visible OpenStreetMap attribution and is subject to its tile-use policy. It is used only for ordinary human viewport browsing: no prefetching, tile scraping, offline download, or data extraction is implemented. A production deployment must review its actual traffic against that policy and move to an approved provider or self-hosted tiles if usage requires it.

## Deliberate exclusions

The points do **not** represent catchments, travel times, coverage, competitive pressure, performance, or recommendations. Those are separate testable modules, beginning with Phase 3 catchment and self-overlap analysis.
