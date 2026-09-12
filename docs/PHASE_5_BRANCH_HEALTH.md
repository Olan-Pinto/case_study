# Phase 5 — Branch-health public proxy

## Completion

`branch_health_v1` scores 22 active branches from peer-adjusted public reputation, inverse limited competitor pressure, and inverse 3 km own-network overlap. It exposes a review priority, confidence, peer basis, and omitted coverage-uniqueness factor. It is not financial health or an operating action.

## 5A: Contract before score

Phase 5 will create a peer-aware, explainable **public-proxy** screen for existing Bedashing branches. It must not present public signals as financial, operational, or customer data.

The first component is intentionally a no-score contract in `config/branch_health_v1.json`. It blocks a score until a branch has source-backed format-archetype and public-reputation evidence, a peer-comparison basis (or an explicit network-only fallback), and input/model provenance.

### Inputs permitted later

- Public reputation, only from an attributable and permitted source, with rating, count, observation date, and source link.
- The Phase 4 limited competitor-pressure signal.
- The Phase 3 own-network geometric-overlap signal.
- Coverage uniqueness only after it has its own method and source/version evidence.

### Guardrails

- No missing reputation, format archetype, or coverage-uniqueness value may be imputed.
- Branches without the required evidence render `INSUFFICIENT_EVIDENCE`; they do not receive a proxy score or review label.
- Peer percentile comparisons require at least three branches in the same source-backed format archetype. Smaller groups state `NETWORK_COMPARISON_ONLY`.
- `PROTECT_REVIEW`, `HOLD_REVIEW`, and `SHRINK_REVIEW` are future human-review priorities, never automatic actions or claims about revenue, profitability, demand, or closure.
- Confidence is separate from the score and must disclose reliability, freshness, peer adequacy, feature completeness, and the limited competitor scope.

### Correctness and confidence contract

The displayed two-decimal score is the value used for the review-label boundary. This prevents a hidden floating-point value such as `64.999...` from displaying as `65.00` while remaining labelled `HOLD_REVIEW`. The boundaries are:

- `65.00` or more: `PROTECT_REVIEW`;
- `35.00` through `64.99`: `HOLD_REVIEW`;
- below `35.00`: `SHRINK_REVIEW`.

Confidence is the equally weighted mean of six evidence-quality components, each stored on the branch record:

- source reliability: `0.85` for direct Google Maps listings manually transcribed and user-validated, discounted because this is not a reproducible API feed;
- source freshness: a dated band relative to the model's declared `model_as_of` date;
- review-sample adequacy: `min(review count / 500, 1)`;
- peer-group adequacy: `1.0` for a venue-context peer group meeting the three-branch minimum, or `0.5` for the disclosed network-only fallback;
- feature completeness: `0.75` because three of four permitted factors are available;
- competitor scope: `0.60` because two relevant chains are verified but the market is not exhaustive.

The constants and their bases are declared in `config/branch_health_v1.json`; they are model assumptions, not learned facts. Missing required reputation, context, pressure, or network evidence now produces `INSUFFICIENT_EVIDENCE` in code instead of a failed build or imputed score.

### Verify

```powershell
py -3 scripts/validate_branch_health_contract.py
py -3 -m unittest discover -s tests -v
```

### Next component

5B is complete. 5C requires a human source-authority choice for public reputation values before any values can be collected or scored.

## 5B: Reputation-source decision and venue-context peer groups

Google Places API research confirms that Place Details can return a branch's rating and user-rating count with its address and Google Maps link. Those fields require an API key/billing-enabled project and are governed by Google Maps Platform usage and attribution policies. No key was requested, used, or stored.

Several secondary directories expose isolated Google-derived ratings, but they are incomplete across the 24 branches, may be stale, and do not establish a consistent source or permitted reuse path. They are rejected as scoring inputs.

The current source-backed peer groups are stored in `branch_venue_context_v1.json`. They are deliberately modest **venue contexts inferred from the 2GIS address evidence**:

- `destination_retail` — 9 named mall, plaza, or destination-walk venues;
- `community_or_streetfront` — 13 community/street-address venues;
- `commercial_building` and `airport_concession` — one location each, explicitly `NETWORK_COMPARISON_ONLY` rather than false peer groups.

These groups do not claim similar revenue, clientele, lease economics, service mix, or performance. They simply stop an airport concession or fourth-floor office from being percentile-compared to a mall venue without disclosure.

### 5C required human decision

The user selected manual validation rather than the paid Google Places API. Use [the collection worksheet](PHASE_5_REPUTATION_COLLECTION.md) to provide a dated rating, review count, and Maps link for each branch. The prototype will label those records as user-validated map evidence. It will retain ambiguous or missing results as missing and withhold the branch score rather than impute it.
