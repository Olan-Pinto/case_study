# Phase 7 — Bounded scenario and explainability workspace

## Purpose

Phase 7 makes the existing branch-health public proxy interactive without changing the evidence. A scenario answers a narrow question: **how would the same proxy change if leadership explicitly placed more importance on one declared factor?** It is not a forecast, recommendation, or simulation of actual customer behavior.

## Bounded scenarios

The four versioned scenarios are Baseline, Reputation priority, Competitor-pressure priority, and Network-spacing priority. They alter only the three existing scorecard weights: peer-adjusted public reputation, inverse limited competitor pressure, and inverse geometric network overlap. Each weight is constrained to 0–1 and the set must sum to 1.

Peer groups, observed rating data, competitor records, geometric metrics, label thresholds, confidence, active/closed status, and all limitations remain fixed. The replay reports each branch’s scenario score, baseline score, numeric delta, scenario label, baseline label, and whether its review label changed.

## Interpretation

This is sensitivity analysis, not evidence that a branch became healthier or weaker. In particular, competitor pressure remains a two-brand lower bound and overlap remains geometry, not proven cannibalization. A changed label means that strategic preference crossed a configured review threshold; it requires human review, not operational action.

## Verification

`scripts/build_branch_health_scenarios.py` creates the committed snapshot. The validator checks configuration bounds, label counts, and delta consistency. Tests prove the Baseline replay matches the existing branch-health snapshot exactly and that label-change flags are truthful.
