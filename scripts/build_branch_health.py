"""Build a deterministic, non-financial branch-health public proxy."""
from __future__ import annotations
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def percentile(value, values):
    ordered = sorted(values)
    return 0.5 if len(ordered) == 1 else sum(item <= value for item in ordered) / len(ordered)

def inverse_percentile(value, values):
    return 1 - percentile(value, values)

def main():
    branches = json.loads((ROOT / "data/processed/branches_snapshot_v1.json").read_text())["records"]
    active = [b for b in branches if "permanently_closed" not in b["status"]]
    reputation = {r["branch_id"]: r for r in json.loads((ROOT / "data/processed/branch_reputation_snapshot_v1.json").read_text())["records"]}
    context = {r["branch_id"]: r for r in json.loads((ROOT / "data/processed/branch_venue_context_v1.json").read_text())["records"]}
    pressure = {r["branch_id"]: r for r in json.loads((ROOT / "data/processed/competitor_pressure_v1.json").read_text())["branch_pressure"]}
    metrics = {r["branch_id"]: r for r in json.loads((ROOT / "data/processed/network_metrics_v1.json").read_text())["branch_metrics"]}
    config = json.loads((ROOT / "config/branch_health_v1.json").read_text())
    global_mean = sum(reputation[b["branch_id"]]["rating_value"] for b in active) / len(active)
    groups = {}
    for b in active:
        key = context[b["branch_id"]]["peer_group_id"]
        if key == "network_comparison_only": key = "network_comparison_only"
        groups.setdefault(key, []).append(b["branch_id"])
    out=[]
    for b in active:
        bid=b["branch_id"]; group=context[bid]["peer_group_id"]; peers=groups[group] if group != "network_comparison_only" else [x["branch_id"] for x in active]
        adjusted={};
        for pid in peers:
            r=reputation[pid]; weight=r["rating_count"]/(r["rating_count"]+100); adjusted[pid]=weight*r["rating_value"]+(1-weight)*global_mean
        reput=percentile(adjusted[bid], list(adjusted.values()))
        comp_values=[pressure[p]["verified_competitor_pressure_lower_bound"] for p in peers]
        overlap=lambda p: next(x for x in metrics[p]["service_radius_metrics"] if x["radius_km"]==3)["maximum_pairwise_overlap_coefficient"]
        overlap_values=[overlap(p) for p in peers]
        comp=inverse_percentile(pressure[bid]["verified_competitor_pressure_lower_bound"], comp_values); own=inverse_percentile(overlap(bid), overlap_values)
        w=config["weights"]; score=100*(w["peer_adjusted_reputation"]*reput+w["inverse_competitor_pressure"]*comp+w["inverse_own_network_overlap"]*own)
        label="PROTECT_REVIEW" if score>=config["labels"]["protect_review_min"] else "SHRINK_REVIEW" if score<config["labels"]["shrink_review_max_exclusive"] else "HOLD_REVIEW"
        confidence=round(100*((min(reputation[bid]["rating_count"]/500,1)+1+0.75+0.6)/4),2)
        out.append({"branch_id":bid,"peer_group_id":group,"comparison_basis":"NETWORK_COMPARISON_ONLY" if group=="network_comparison_only" else "VENUE_CONTEXT_PEERS","public_proxy_score":round(score,2),"review_label":label,"confidence":confidence,"factor_contributions":{"peer_adjusted_reputation":round(100*w["peer_adjusted_reputation"]*reput,2),"inverse_competitor_pressure":round(100*w["inverse_competitor_pressure"]*comp,2),"inverse_own_network_overlap":round(100*w["inverse_own_network_overlap"]*own,2)},"omitted_factors":["coverage_uniqueness_not_available"]})
    output={"model_id":config["model_id"],"input_branch_snapshot_id":"bedashing-branches-v1-2026-09-08","interpretation":"Peer-aware public proxy only; not financial health, demand, or an operating decision.","records":out}
    (ROOT / "data/processed/branch_health_v1.json").write_text(json.dumps(output,indent=2)+"\n")
    print(f"Wrote health proxy for {len(out)} active branches")
if __name__=="__main__": main()
