# Modular execution roadmap

Each phase ends reviewable and should be committed only after user inspection.

| Phase | Scope | Acceptance criteria | Suggested commit boundary |
|---|---|---|---|
| 1 | Branch data foundation | Source-backed branch roster; reconciliation; schemas; validation; provenance; minimal inspect command; no invented fields | `feat(data): add validated Bedashing branch snapshot` |
| 2 | Map/network exploration | Local app renders snapshot, map/table selection and branch detail; works with no key | `feat(map): explore Bedashing network` |
| 3 | Catchment/self-overlap | Configured radii, intersections, nearest own branch, tests and honest labels | `feat(geo): add network overlap analysis` |
| 4 | Competitors | Taxonomy, source-backed candidate data, dedupe/classification, pressure layer | `feat(data): add competitor pressure` |
| 5 | Branch health | Peer-aware public proxy score, labels, contributions/confidence, golden tests | `feat(model): explain existing branch recommendations` |
| 6 | Whitespace | H3 candidate generation, validation/saturation logic, opportunity layer/tests | `feat(model): identify growth opportunity cells` |
| 7 | Scenarios/explainability | Bounded scenario controls, deltas, evidence/provenance UX | `feat(workspace): add scenarios and evidence` |
| 8 | AI analyst | Optional server-side typed tools, grounded answers, eval fixture, no-AI fallback | `feat(ai): add grounded portfolio analyst` |
| 9 | Justified agentic enhancements | Bounded refresh workflow and/or MCP adapter only if clear use case passes tests | `feat(ai): add approved refresh or interoperability adapter` |
| 10 | Harden and communicate | Accessibility, errors, performance, tested setup, README, demo plan | `docs: finalize reviewer quick start and limitations` |

Phase 1 is intentionally data-only plus a minimal inspection path. Its purpose is to prove the case rests on a real, auditable network before a map makes uncertain data look authoritative.
