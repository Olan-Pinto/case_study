# Product and UX plan

## Workspace concept

An operator’s geospatial decision workspace: persistent map at center, portfolio navigation/filters on the left, contextual branch or opportunity evidence panel on the right, and an optional analyst drawer—not a hero page or KPI-card grid.

Layers: network, service radii, own overlap, relevant competitors, competitive condition, market proxy, and opportunity cells. Layer legend always identifies method/version. Selection synchronizes map, table, recommendation, factor contributions, evidence, and confidence.

## Core journeys

1. **Network overview:** filter emirate/archetype; see label mix, overlap and opportunity layer, then select a priority.
2. **Investigate a branch:** inspect context, peers, proximity, competition, overlap, recommendation, contributions, confidence, evidence and caveats.
3. **Compare branches:** select two+ branches and compare normalized values with peer basis shown.
4. **Find whitespace:** select a cell, understand GROW/WATCH/SKIP and market-validation vs saturation evidence.
5. **Scenario plan:** adjust bounded priorities; inspect changed labels and sensitivities.
6. **Ask analyst:** ask a portfolio question; see its sources/tool evidence; use deterministic fallback when disabled.

## Explanation design

Use ranked contributions (supports/pressures), confidence badge with a textual reason, source list with access date, model version, and an explicit “what this does not measure.” Avoid SHAP language: this is a configured scorecard, not a learned model.

## Impeccable plan

Before implementation, install/approve the current Codex-compatible Impeccable workflow, run its init, create `PRODUCT.md` from confirmed persona/constraints, then establish `DESIGN.md` and surface briefs as prompted. Use shape -> critique -> audit -> polish -> accessibility/responsive hardening. This honors the current upstream sequence without creating speculative UI artifacts now.

## UI tests later

Keyboard-select map/list records; visible focus; color-independent labels; layer toggle and selection synchronization; loading/error/empty states; small viewport behavior; AI-disabled flow; contrast and attribution.
