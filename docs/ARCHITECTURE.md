# Architecture

## Purpose

This is a case-study prototype for a Head of Retail / Portfolio and Expansion Lead at Bedashing Beauty. It answers strategic network questions using public, reproducible proxies; it is not a revenue model or an automated closure engine.

## Implemented runtime

```text
Attributed public/manual evidence
        -> Python validation and deterministic model builders
        -> committed, versioned JSON snapshots
        -> React + TypeScript + MapLibre reviewer workspace

Browser analyst request
        -> local Node.js read-only HTTP facade
        -> allowlisted deterministic portfolio tools
        -> optional server-side OpenAI Responses tool loop
        -> grounded answer + safe tool-activity trace
```

The browser receives processed, reviewer-safe data and never receives the OpenAI credential. The core product remains usable when AI is disabled: map, scores, labels, factor contributions, sources, and scenario results are deterministic.

## Implemented boundaries

| Boundary | Responsibility | Current implementation |
|---|---|---|
| Collection | Normalize manually validated evidence and preserve provenance | Python collection/build scripts plus source registry |
| Snapshot | Reproducible reviewer input | Small committed JSON snapshots and manifests under `data/processed/` |
| Analytics | Distances, geometric overlap, pressure, health proxy, scenarios, whitespace screens | Deterministic Python scripts; H3 for whitespace cells |
| UI | Explore, compare, and disclose evidence | React + TypeScript + Vite + MapLibre |
| Local API | Serve the optional analyst without exposing credentials | Node.js read-only HTTP server |
| AI | Interpret intent and synthesize allowlisted tool evidence | Optional server-side OpenAI Responses API loop |

FastAPI, DuckDB Spatial, Parquet/GeoParquet, GeoPandas, Shapely, and deck.gl were Phase 0 candidates, not the final prototype runtime. They remain reasonable scale-up options but were unnecessary for this bounded committed dataset.

## Data contracts

Each core entity carries source IDs or source URLs and a snapshot/model identifier. Derived outputs identify their input snapshot and model version. Branch-health records contain the displayed score, review label, factor values and contributions, confidence components, peer-comparison basis, omitted factors, and missing requirements.

## Deliberate omissions

No PostGIS, Redis, queue, Kubernetes, paid Places API, live-on-load data refresh, browser-held secret, autonomous branch action, or multi-agent mesh belongs in this prototype. See [DECISIONS.md](DECISIONS.md) for decisions and revisit conditions.
