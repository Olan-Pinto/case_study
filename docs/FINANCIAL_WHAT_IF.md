# Financial what-if sensitivity

The financial what-if is an optional, deliberately hypothetical extension to the existing-branch review model. It answers one narrow question: **if a selected branch's cash-flow generation ranked at a stated percentile among comparable active Bedashing branches, how much could that change its current review priority?** The comparison scope is Bedashing's portfolio only, preferably branches in the same source-backed venue peer group. Competitors and the wider salon market are never part of the percentile.

No branch financials are available, estimated, backfilled, or stored. The reviewer must enable the control and supply the assumption. The input exists only in React state for the current browser session and resets when another branch is selected.

## Calculation

The assumed Bedashing cash-flow percentile `F` and the currently selected public-proxy scenario score `P` are both on a 0–100 scale. An input of `80` means the selected branch is assumed to generate more cash than approximately 80% of comparable active Bedashing branches:

`financial what-if score = 0.50 × F + 0.50 × P`

The existing displayed-score thresholds are reused: `65.00+` is `PROTECT REVIEW`, `35.00–64.99` is `HOLD REVIEW`, and below `35.00` is `SHRINK REVIEW`. Reusing the thresholds makes the sensitivity result comparable without changing the committed baseline model.

The 50/50 weights are an explicit demonstration assumption, not learned parameters. Cash flow receives enough weight to be decision-material, while public reputation, limited competitor pressure, and geometric spacing still provide context. A real deployment must calibrate the definition, weights, and thresholds against internal outcomes.

## Required production data contract

Before replacing the slider with real data, the business must agree on a comparable branch-level metric—recommended starting point: trailing-12-month operating cash contribution—and document currency, period, rent, payroll, central allocations, capital expenditure, source system, freshness, actual-versus-forecast status, and like-for-like peer rules.

The what-if result has no evidence-confidence score because its most important input is fictional. It is sensitivity analysis, not a forecast, valuation, or authorization to protect, hold, shrink, or close a branch.

## Internal evidence roadmap

Three additional Bedashing-only signals are exposed in the UI as an unscored data roadmap:

- **Bookings and capacity utilization** distinguish a low-demand branch from a busy branch whose weak cash generation may instead reflect capacity, pricing, or service mix. Utilization is diagnostic rather than monotonically good or bad, so it should not receive an arbitrary score weight.
- **Repeat-customer rate** adds observed retention behavior instead of relying on public ratings as a loyalty proxy. A production definition needs an agreed period, eligible-customer cohort, and comparable Bedashing peer group.
- **Coarse customer home areas plus anonymized cross-branch visits** measure whether nearby Bedashing branches actually share customers and whether customers switch after a network change. With sufficient longitudinal coverage, this should replace geometric catchment overlap as the primary network-value signal.

All three remain `NOT_AVAILABLE` and have zero effect on the current result. This avoids fabricating operational evidence while making the intended internal-data path explicit.
