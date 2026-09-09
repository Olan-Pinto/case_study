# Recommendation methodology

## Principle

Models are strategic public-data proxy models, not financial forecasts. All transforms, weights, thresholds, missingness behavior, and versions are data/configuration artifacts (`existing_branch_model_v1`, `whitespace_model_v1`), never hidden UI logic.

## Existing branch model

Create normalized 0–100 features only when evidence exists: peer-relative reputation (Bayesian-adjusted), local market proxy, competitive condition, own-network overlap, coverage uniqueness, accessibility/context, and data confidence. Peer normalization occurs within archetype where the group is sufficiently large; otherwise label “network comparison only.”

Use an explicit scorecard with positive/negative factor contributions and guardrails instead of an opaque model. A proposed decision process is: (1) calculate strategic strength, (2) apply coverage-uniqueness protection check, (3) flag extreme overlap/low strength for SHRINK review, (4) otherwise HOLD. Labels require minimum confidence; below it, show `HOLD — validate` rather than false precision. Thresholds are initially hypotheses and must be tested against manually authored, explainable fixtures.

## Opportunity model

Score demand/context proxy, market validation, saturation penalty, own-network cannibalization penalty, access/context, and confidence. `GROW` requires sufficient demand/context + validation + low own overlap; `WATCH` is plausible but uncertain/mixed; `SKIP` has weak demand, high saturation, or high cannibalization. Never claim an underserved cell has latent customer demand from absence alone.

## Scenario and confidence

Scenarios adjust bounded, named priorities (coverage preservation, growth, cannibalization reduction, reputation, premium context), then rerun exactly the same deterministic functions. Store baseline and scenario model parameters, changed labels, and sensitivity.

Confidence is separate from score: source reliability/freshness/corroboration/completeness/coordinate certainty, review sample adequacy, competitor coverage, geographic method adequacy. A score cannot compensate for weak evidence.

## Tests

Golden cases, deterministic replay, threshold inclusivity, label exclusivity, missing-feature behavior, confidence monotonicity, scenario parameter bounds, and source/model version presence on every output.
