# Technology stack decision

See [ADRs](../DECISIONS.md) for the compact decision record.

**Phase 0 proposal:** React + TypeScript + Vite; MapLibre with deck.gl if needed; FastAPI/Pydantic; Python geospatial tooling; DuckDB Spatial and Parquet/GeoParquet; direct OpenAI Responses tools; local-first deployment.

**Implemented prototype:** React + TypeScript + Vite and MapLibre; deterministic standard-library Python builders plus H3; committed JSON snapshots; a small read-only Node.js analyst server; and optional server-side OpenAI Responses tool calling. FastAPI, DuckDB Spatial, Parquet/GeoParquet, GeoPandas/Shapely, and deck.gl were not needed for the bounded prototype and are scale-up options rather than current dependencies.

Map attribution and data license compliance are a release requirement. Overture supports DuckDB and area-bounded download; however its Places data needs deduplication and confidence filtering. [Overture quickstart](https://docs.overturemaps.org/getting-data/), [Places limitations](https://docs.overturemaps.org/guides/places/), accessed 2026-09-08.

The agent layer uses no heavy orchestration framework initially. Direct typed tools are more observable and portable. Add an adapter boundary so MCP can expose those same domain functions later without changing their semantics. Current Impeccable guidance says Codex projects should install its skill before UI work, then run `/impeccable init`, which records `PRODUCT.md`; Codex hook approval is a deliberate user/platform step. [Impeccable README](https://github.com/pbakaus/impeccable), accessed 2026-09-08. **USER DECISION:** approve its installation when UI work begins; do not install it automatically in Phase 0.
