"""Build a deterministic, non-financial branch-health public proxy."""
from __future__ import annotations

import json
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def percentile(value: float, values: list[float]) -> float:
    """Return the configured empirical-CDF percentile used by model v1."""
    ordered = sorted(values)
    return 0.5 if len(ordered) == 1 else sum(item <= value for item in ordered) / len(ordered)


def inverse_percentile(value: float, values: list[float]) -> float:
    return 1 - percentile(value, values)


def label_for_score(score: float, config: dict) -> str:
    """Classify the same two-decimal score that is shown to a reviewer."""
    displayed_score = round(score, 2)
    labels = config["labels"]
    if displayed_score >= labels["protect_review_min"]:
        return "PROTECT_REVIEW"
    if displayed_score < labels["shrink_review_max_exclusive"]:
        return "SHRINK_REVIEW"
    return "HOLD_REVIEW"


def load_datasets() -> dict:
    paths = {
        "branches": "data/processed/branches_snapshot_v2.json",
        "reputation": "data/processed/branch_reputation_snapshot_v1.json",
        "context": "data/processed/branch_venue_context_v1.json",
        "pressure": "data/processed/competitor_pressure_v1.json",
        "metrics": "data/processed/network_metrics_v1.json",
    }
    return {
        name: json.loads((ROOT / path).read_text(encoding="utf-8"))
        for name, path in paths.items()
    }


def freshness_score(observed_at: str, model_as_of: str, bands: list[dict]) -> float:
    age_days = max(0, (date.fromisoformat(model_as_of) - date.fromisoformat(observed_at)).days)
    for band in bands:
        if age_days <= band["max_age_days"]:
            return band["value"]
    return 0.0


def confidence_breakdown(
    reputation_record: dict,
    peer_group_adequacy: float,
    config: dict,
) -> dict[str, float]:
    confidence = config["confidence"]
    review_count = reputation_record["rating_count"]
    review_sample = min(review_count / confidence["review_sample_full_credit_count"], 1)
    freshness = freshness_score(
        reputation_record["observed_at"],
        confidence["model_as_of"],
        confidence["freshness_bands"],
    )
    return {
        "source_reliability": confidence["source_reliability"]["value"],
        "source_freshness": freshness,
        "review_sample_adequacy": review_sample,
        "peer_group_adequacy": peer_group_adequacy,
        "feature_completeness": confidence["feature_completeness"]["value"],
        "competitor_scope": confidence["competitor_scope"]["value"],
    }


def withheld_record(branch_id: str, missing: list[str], config: dict) -> dict:
    return {
        "branch_id": branch_id,
        "peer_group_id": None,
        "comparison_basis": None,
        "public_proxy_score": None,
        "review_label": config["missingness"]["withheld_label"],
        "confidence": None,
        "confidence_components": {},
        "factor_values": {},
        "factor_contributions": {},
        "omitted_factors": ["coverage_uniqueness_not_available"],
        "missing_requirements": sorted(set(missing)),
        "source_ids": [],
    }


def build_records(config: dict, datasets: dict | None = None) -> list[dict]:
    datasets = datasets or load_datasets()
    branches = datasets["branches"]["records"]
    active = [branch for branch in branches if "permanently_closed" not in branch["status"]]
    reputation = {record["branch_id"]: record for record in datasets["reputation"]["records"]}
    context = {record["branch_id"]: record for record in datasets["context"]["records"]}
    pressure = {record["branch_id"]: record for record in datasets["pressure"]["branch_pressure"]}
    metrics = {record["branch_id"]: record for record in datasets["metrics"]["branch_metrics"]}

    eligible_reputation = [
        reputation[branch["branch_id"]]
        for branch in active
        if branch["branch_id"] in reputation
        and reputation[branch["branch_id"]].get("rating_value") is not None
        and reputation[branch["branch_id"]].get("rating_count") is not None
    ]
    global_mean = (
        sum(record["rating_value"] for record in eligible_reputation) / len(eligible_reputation)
        if eligible_reputation
        else None
    )

    groups: dict[str, list[str]] = {}
    for branch in active:
        branch_id = branch["branch_id"]
        if branch_id in context and context[branch_id].get("peer_group_id"):
            groups.setdefault(context[branch_id]["peer_group_id"], []).append(branch_id)

    active_ids = [branch["branch_id"] for branch in active]
    minimum_peer_group_size = config["peer_comparison"]["minimum_peer_group_size"]
    out = []

    for branch in active:
        branch_id = branch["branch_id"]
        missing = []
        reputation_record = reputation.get(branch_id)
        context_record = context.get(branch_id)
        pressure_record = pressure.get(branch_id)
        metrics_record = metrics.get(branch_id)

        if not reputation_record or any(
            reputation_record.get(field) is None
            for field in config["permitted_factors"]["public_reputation"]["required_fields"]
        ):
            missing.append("public_reputation")
        if not context_record or not context_record.get("peer_group_id"):
            missing.append("format_archetype")
        if not pressure_record:
            missing.append("competitor_pressure")
        if not metrics_record:
            missing.append("own_network_overlap")
        if global_mean is None:
            missing.append("network_reputation_mean")
        if missing:
            out.append(withheld_record(branch_id, missing, config))
            continue

        group = context_record["peer_group_id"]
        same_group = groups.get(group, [])
        has_adequate_group = group != "network_comparison_only" and len(same_group) >= minimum_peer_group_size
        peers = same_group if has_adequate_group else active_ids
        comparison_basis = "VENUE_CONTEXT_PEERS" if has_adequate_group else "NETWORK_COMPARISON_ONLY"
        peer_group_adequacy = 1.0 if has_adequate_group else config["confidence"]["network_fallback_peer_adequacy"]

        peers = [
            peer_id
            for peer_id in peers
            if peer_id in reputation
            and reputation[peer_id].get("rating_value") is not None
            and reputation[peer_id].get("rating_count") is not None
            and peer_id in pressure
            and peer_id in metrics
        ]
        if branch_id not in peers or not peers:
            out.append(withheld_record(branch_id, ["peer_comparison_evidence"], config))
            continue

        adjusted = {}
        prior_strength = config["reputation_adjustment"]["prior_review_count"]
        for peer_id in peers:
            peer_reputation = reputation[peer_id]
            weight = peer_reputation["rating_count"] / (peer_reputation["rating_count"] + prior_strength)
            adjusted[peer_id] = weight * peer_reputation["rating_value"] + (1 - weight) * global_mean

        reputation_percentile = percentile(adjusted[branch_id], list(adjusted.values()))
        competitor_values = [pressure[peer_id]["verified_competitor_pressure_lower_bound"] for peer_id in peers]

        def primary_overlap(peer_id: str) -> float:
            primary_radius = datasets["metrics"]["primary_radius_km"]
            return next(
                metric["maximum_pairwise_overlap_coefficient"]
                for metric in metrics[peer_id]["service_radius_metrics"]
                if metric["radius_km"] == primary_radius
            )

        overlap_values = [primary_overlap(peer_id) for peer_id in peers]
        inverse_competitor = inverse_percentile(
            pressure_record["verified_competitor_pressure_lower_bound"], competitor_values
        )
        inverse_overlap = inverse_percentile(primary_overlap(branch_id), overlap_values)
        factor_values = {
            "peer_adjusted_reputation_percentile": reputation_percentile,
            "inverse_competitor_pressure_percentile": inverse_competitor,
            "inverse_own_network_overlap_percentile": inverse_overlap,
        }
        weights = config["weights"]
        contributions = {
            "peer_adjusted_reputation": round(100 * weights["peer_adjusted_reputation"] * reputation_percentile, 2),
            "inverse_competitor_pressure": round(100 * weights["inverse_competitor_pressure"] * inverse_competitor, 2),
            "inverse_own_network_overlap": round(100 * weights["inverse_own_network_overlap"] * inverse_overlap, 2),
        }
        raw_score = 100 * (
            weights["peer_adjusted_reputation"] * reputation_percentile
            + weights["inverse_competitor_pressure"] * inverse_competitor
            + weights["inverse_own_network_overlap"] * inverse_overlap
        )
        displayed_score = round(raw_score, 2)
        components = confidence_breakdown(reputation_record, peer_group_adequacy, config)
        confidence = round(100 * sum(components.values()) / len(components), 2)

        out.append(
            {
                "branch_id": branch_id,
                "peer_group_id": group,
                "comparison_basis": comparison_basis,
                "public_proxy_score": displayed_score,
                "review_label": label_for_score(displayed_score, config),
                "confidence": confidence,
                "confidence_components": {key: round(value, 6) for key, value in components.items()},
                "factor_values": {
                    **{key: round(value, 6) for key, value in factor_values.items()},
                    "raw_rating_value": reputation_record["rating_value"],
                    "raw_rating_count": reputation_record["rating_count"],
                    "bayesian_adjusted_rating": round(adjusted[branch_id], 6),
                    "peer_count": len(peers),
                },
                "factor_contributions": contributions,
                "omitted_factors": ["coverage_uniqueness_not_available"],
                "missing_requirements": [],
                "source_ids": sorted(
                    set(
                        reputation_record.get("source_ids", [])
                        + context_record.get("source_ids", [])
                        + datasets["pressure"].get("source_ids", [])
                        + datasets["metrics"].get("source_ids", [])
                    )
                ),
            }
        )
    return out


def main() -> None:
    config = json.loads((ROOT / "config/branch_health_v1.json").read_text(encoding="utf-8"))
    datasets = load_datasets()
    output = {
        "model_id": config["model_id"],
        "input_branch_snapshot_id": datasets["branches"]["snapshot_id"],
        "interpretation": "Peer-aware public proxy only; not financial health, demand, or an operating decision.",
        "records": build_records(config, datasets),
    }
    (ROOT / "data/processed/branch_health_v1.json").write_text(
        json.dumps(output, indent=2) + "\n", encoding="utf-8"
    )
    print(f"Wrote health proxy for {len(output['records'])} active branches")


if __name__ == "__main__":
    main()
