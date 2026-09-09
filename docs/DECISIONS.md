# Architecture Decision Records

All decisions are Phase 0 proposals and must be revisited if Phase 1 validation contradicts them. Detailed evidence is linked from the research set.

| ID | Decision | Selected option | Reason and trade-off | Revisit when |
|---|---|---|---|---|
| ADR-01 | Frontend | React, TypeScript, Vite | Fast map integration and simple static deployment; less built-in routing/SSR than Next.js. | SEO/server rendering becomes material (unlikely). |
| ADR-02 | Map | MapLibre GL JS + deck.gl overlays | Open stack supports points, polygons, H3 and picking; requires attribution and careful layer performance. | Data volume exceeds browser rendering comfort. |
| ADR-03 | API | FastAPI read-only service | Pydantic contracts align with Python analytics; adds a second runtime. | Static files alone prove sufficient for all required interaction. |
| ADR-04 | Spatial compute/storage | GeoPandas/Shapely/H3 + DuckDB Spatial + Parquet/GeoParquet | Reproducible local computation without a database server; not concurrent-enterprise optimized. | Multi-user editing or large operational data arrives. |
| ADR-05 | Snapshot | Committed small processed snapshot, refresh scripts separate | Meets offline assessment requirement and preserves evidence; needs disciplined snapshot versioning. | Licensing or size makes a snapshot unsuitable. |
| ADR-06 | Opportunity unit | H3, initially resolution 8, sensitivity test at 7/9 | Stable, visualizable cells and no hand-picked neighborhoods; resolution must be validated against UAE density. | Cell size masks meaningful variation or produces noise. |
| ADR-07 | Catchments | Transparent archetype-specific radii / bands first | Honest and reproducible; not labelled travel-time. Network routing is deferred. | Free routing materially changes decisions and passes validation. |
| ADR-08 | Recommendations | Versioned, rule-based multi-factor model with factor contributions | No outcome-labelled financial data exists to justify ML; subjective weights need scenarios and documentation. | Internal historical outcomes become available. |
| ADR-09 | AI | Direct OpenAI Responses API function calling | Typed tool loop is sufficient and has low framework overhead; optional agent feature. | Multi-step state/branching becomes demonstrably complex. |
| ADR-10 | MCP | DEFER as adapter | Valuable interoperability, but app needs ordinary in-process tools first. | A second MCP client or external analyst consumer is demonstrated. |
| ADR-11 | A2A | REJECT for prototype | A2A connects independent agents, not local analytics functions; adding agents would be theatre. | Independent owned agents/services must delegate work. |
| ADR-12 | HITL | ADOPT at consequential publish/override gates | Read analysis needs no approval; model/snapshot publication and overrides do. | Scope becomes strictly read-only forever. |
| ADR-13 | Loop/graph orchestration | Bounded refresh loop DEFER; graph runtime REJECT initially | Explicit tool state machine and retry ceiling are enough; graph framework adds surface area. | Tool paths, resumability, or durable jobs become complex. |
| ADR-14 | Deployment | Local-first Docker-free dev path plus static snapshot; host only after working | Reviewer reproducibility outranks cloud sophistication. | Hosting is required for the final demo. |
