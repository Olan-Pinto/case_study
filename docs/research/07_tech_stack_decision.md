# Technology stack decision

See [ADRs](../DECISIONS.md) for the compact decision record.

**Frontend:** React + TypeScript + Vite. **Map:** MapLibre GL JS plus deck.gl only where H3/dense visual overlays justify it. **Backend:** FastAPI/Pydantic, read-only initially. **Analytics:** Python, GeoPandas/Shapely, H3, DuckDB Spatial, Parquet/GeoParquet. **AI:** direct OpenAI Responses function calls with a small provider abstraction. **State:** snapshot files; no Redis/Kafka. **Deployment:** local first.

Map attribution and data license compliance are a release requirement. Overture supports DuckDB and area-bounded download; however its Places data needs deduplication and confidence filtering. [Overture quickstart](https://docs.overturemaps.org/getting-data/), [Places limitations](https://docs.overturemaps.org/guides/places/), accessed 2026-09-08.

The agent layer uses no heavy orchestration framework initially. Direct typed tools are more observable and portable. Add an adapter boundary so MCP can expose those same domain functions later without changing their semantics. Current Impeccable guidance says Codex projects should install its skill before UI work, then run `/impeccable init`, which records `PRODUCT.md`; Codex hook approval is a deliberate user/platform step. [Impeccable README](https://github.com/pbakaus/impeccable), accessed 2026-09-08. **USER DECISION:** approve its installation when UI work begins; do not install it automatically in Phase 0.
