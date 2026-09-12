# Requirement traceability

Source: authoritative assessment, `problem_statement/ai-case-study.docx`, reviewed again during Phase 10 on 2026-09-12.

| Assessment requirement | Implemented evidence | Verification | Reviewer action |
|---|---|---|---|
| Business framing | README names the Head of Retail / Portfolio and Expansion Lead, supported decisions, proxy boundaries, and human ownership | README content review against the brief | Read the opening and limitations, then open the network workspace |
| Current branch network | Reconciled 24-location historical roster, 22 active locations, two retained closures, searchable map and details | Branch schema validator and roster tests | Filter the roster and select an active and closed location |
| Catchment / coverage | 1/3/5 km geometric service radii, nearest-own-branch distance, pairwise circle overlap | Network validator and analytic geometry tests | Select Noya Plaza, enable radii, and change the distance band |
| Competition | Fifteen active verified Sisters/NStyle locations, taxonomy, distance-decayed lower-bound pressure, closed-location exclusion | Competitor validator and pressure tests | Select Al Khaleej Al Arabi and inspect its contributors |
| Branch health / comparison | `branch-health-v1` peer-adjusted public-proxy score, venue peer groups, confidence, exact contributions, four scenario replays, and AI comparison tool | Health/peer/scenario validators and tests | Explain one label, change scenario, or ask AI to compare branches |
| Existing-branch classification | `PROTECT_REVIEW`, `HOLD_REVIEW`, `SHRINK_REVIEW`, or `INSUFFICIENT_EVIDENCE`; labels are human review priorities | Threshold, decomposition, missingness, and baseline-replay tests | Expand **Why this score?** and confidence |
| Opportunity classification | `whitespace-research-priority-v1` combines four declared factors for 1,939 bounded H3 cells; missing WorldPop evidence withholds a score | H3, boundary, transform, decomposition, threshold, and missingness tests | Select blue and grey cells and compare their evidence |
| Geographic reasoning | Haversine distance, analytic circle intersection, H3 polygons, WorldPop aggregation, destination proximity, competitor decay | Unit tests and committed model contracts | Toggle radii, competitors, and whitespace areas |
| AI-relevant design | Optional Responses API analyst with eight typed read-only tools, branch resolver, grounded Markdown, provenance, and no-key fallback | Node tool tests, six eval fixtures, analyst contract validator | Ask for a branch explanation and expand **Evidence activity** |
| Agentic flow | Forced-scope portfolio workflow followed by model-selected branch/opportunity checks, capped at four sequential calls | Portfolio workflow validator and tool tests | Build a Dubai or Abu Dhabi research worklist |
| Explainability | Scores, normalized values, contributions, confidence components, source URLs/IDs, model IDs, limitations, and safe tool trace | Validators assert decomposition, provenance, and bounded outputs | Recalculate a displayed total and open its evidence |
| Easy to run | Three-command deterministic startup, optional second AI process, committed snapshots, one offline verification runner | `python scripts/verify_project.py` | Clone, install, run, and verify without an API call |
| Secret or paid dependency fallback | Server-only ignored `.env`; deterministic workspace and explicit `AI_DISABLED` behavior | Git ignore inspection, analyst contract, no-key path | Run without a key and confirm deterministic features remain usable |
| Short demo | README contains a timed eight-step walkthrough; detailed explanations live in `docs/DEMO_PREP.md` | Phase 10 documentation review | Record or present the five-to-ten-minute path |

## Result

Every minimum functional requirement has an implemented surface, a runnable deterministic check, and a demoable action. The solution deliberately simplifies unavailable internal economics, complete competition, routing travel time, and outcome calibration; those omissions are visible rather than imputed.
