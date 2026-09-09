# Architecture

## Purpose

This is a case-study prototype for a Head of Retail / Portfolio and Expansion Lead at Bedashing Beauty. It answers strategic network questions using public, reproducible proxies; it is not a revenue model or an automated closure engine.

## Proposed runtime

```text
Versioned public-source snapshot -> validation -> deterministic spatial engine
                                                -> FastAPI read API -> React workspace + MapLibre/deck.gl
                                                -> structured evidence / template explanations
                                                                    -> optional server-only OpenAI Responses tool agent
```

The browser receives only processed, reviewer-safe data. It never receives provider credentials. The product remains fully usable when AI is disabled: map, scores, labels, factor contributions, source links, and scenario results are deterministic.

## Boundaries

| Boundary | Responsibility | Chosen form |
|---|---|---|
| Ingestion | Fetch, preserve source metadata, normalize and reconcile | Explicit Python refresh scripts, later |
| Snapshot | Reviewer reproducibility | Small committed `data/processed/` Parquet/GeoParquet plus manifest |
| Analytics | Distances, catchments, scoring, confidence, scenarios | Python packages and DuckDB Spatial; pure functions where feasible |
| API | Read-only query facade | FastAPI, later |
| UI | Explore, compare, disclose evidence | React + TypeScript + Vite, later |
| AI | Interpret user intent and synthesize tool evidence | OpenAI Responses API, server-side and optional |

## Data contracts

Every entity includes `source_ids`, `observed_at`, `confidence`, `completeness`, and a snapshot/model version. Derived records include their input IDs and transformation version. Recommendation records contain a label, score, factor contributions, confidence, model version, and scenario parameters.

## Deliberate omissions

No PostGIS, Redis, queue, Kubernetes, paid Places API, live-on-load data fetch, browser-held secret, autonomous branch action, or multi-agent mesh belongs in the first working prototype. See [DECISIONS.md](DECISIONS.md) and the research documents for revisit conditions.
