import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main():
    config = json.loads((ROOT / "config/whitespace_v1.json").read_text())
    priority = config["research_priority"]
    assert config["model_id"] == "whitespace-v1"
    assert config["status"] == "research_priority_scored_with_required_evidence"
    assert config["residential_context"]["role"] == "required_research_priority_factor"
    assert config["candidate_grid"]["system"] == "h3" and config["candidate_grid"]["resolution"] == 8
    assert config["missingness"]["withheld_label"] == "RESEARCH_REQUIRED"
    assert abs(sum(priority["weights"].values()) - 1) < 1e-12
    assert priority["required_evidence"] == ["residential_population_context"]
    assert priority["thresholds"]["prioritize_research_at_or_above"] > priority["thresholds"]["watch_research_at_or_above"]
    assert set(config["labels"]["current"]) == {"PRIORITIZE_RESEARCH", "WATCH_RESEARCH", "DEPRIORITIZE_RESEARCH", "RESEARCH_REQUIRED"}
    assert {"GROW_RESEARCH", "OPEN", "CLOSE"}.issubset(config["labels"]["prohibited"])
    components = priority["confidence"]["components"]
    assert round(100 * sum(components.values()) / len(components)) == priority["confidence"]["score_when_required_evidence_available"]
    print("VALID: whitespace research-priority contract is complete and bounded")


if __name__ == "__main__":
    main()
