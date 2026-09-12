import { useCallback, useMemo, useState } from 'react'
import { activeCompetitors, branchHealthScenarios, branchReputation, branches, competitorPressure, competitorSnapshot, networkMetrics, snapshot, whitespaceCandidates } from './data'
import { NetworkMap } from './NetworkMap'
import { AnalystPanel } from './AnalystPanel'
import { PortfolioReviewPanel } from './PortfolioReviewPanel'
import type { Branch, BranchCompetitorPressure, BranchNetworkMetric } from './types'

const emirates = ['All', ...Array.from(new Set(branches.map((branch) => branch.emirate))).sort()]

function statusLabel(status: Branch['status']) {
  if (status === 'observed_currently_listed') return 'Currently listed'
  if (status === 'user_confirmed_permanently_closed') return 'Permanently closed'
  return status.replaceAll('_', ' ')
}

export function App() {
  const [emirate, setEmirate] = useState('All')
  const [query, setQuery] = useState('')
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(branches[0]?.branch_id ?? null)
  const [showCompetitors, setShowCompetitors] = useState(true)
  const [showWhitespace, setShowWhitespace] = useState(false)
  const [showServiceRadii, setShowServiceRadii] = useState(false)
  const [radiusKm, setRadiusKm] = useState(networkMetrics.primary_radius_km)
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null)
  const [scenarioId, setScenarioId] = useState('baseline')

  const filteredBranches = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return branches.filter((branch) => {
      const inEmirate = emirate === 'All' || branch.emirate === emirate
      const searchable = `${branch.name} ${branch.community} ${branch.address}`.toLowerCase()
      return inEmirate && (!normalizedQuery || searchable.includes(normalizedQuery))
    })
  }, [emirate, query])

  const selectedBranch = branches.find((branch) => branch.branch_id === selectedBranchId) ?? null
  const selectedMetric = networkMetrics.branch_metrics.find((metric) => metric.branch_id === selectedBranchId) ?? null
  const selectedPressure = competitorPressure.branch_pressure.find((metric) => metric.branch_id === selectedBranchId) ?? null
  const selectedScenario = branchHealthScenarios.scenarios.find((scenario: any) => scenario.scenario_id === scenarioId) ?? branchHealthScenarios.scenarios[0]
  const selectedHealth = selectedScenario.records.find((metric: any) => metric.branch_id === selectedBranchId) ?? null
  const selectedBranchIsActive = selectedBranch !== null && !selectedBranch.status.includes('permanently_closed')
  const selectBranch = useCallback((branchId: string) => { setSelectedCandidate(null); setSelectedBranchId(branchId) }, [])
  const selectCandidate = useCallback((candidate: any) => { setSelectedBranchId(null); setSelectedCandidate(candidate) }, [])

  return (
    <main className="workspace">
      <header className="topbar">
        <div>
          <p className="eyebrow">Bedashing Beauty · UAE network</p>
          <h1>Network workspace</h1>
        </div>
        <div className="snapshot-note">
          <span className="signal" />
          Static evidence snapshot · {snapshot.generated_at}
        </div>
      </header>

      <section className="context-strip" aria-label="Data scope">
        <strong>{snapshot.official_claimed_uae_lounges} historical roster records</strong>
        <span>22 active · 2 permanently closed</span>
        <span>•</span>
        <span>24 geocoded records</span>
        <span>•</span>
        <span>Public mapping evidence, not operating performance</span>
        <label className="scenario-control">Scenario
          <select value={scenarioId} onChange={(event) => setScenarioId(event.target.value)}>
            {branchHealthScenarios.scenarios.map((scenario: any) => <option key={scenario.scenario_id} value={scenario.scenario_id}>{scenario.label}</option>)}
          </select>
        </label>
      </section>

      <div className="layout">
        <aside className="branch-panel" aria-label="Branch roster">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Network roster</p>
              <h2>{filteredBranches.length} locations</h2>
            </div>
            <label className="filter-label">
              Emirate
              <select value={emirate} onChange={(event) => setEmirate(event.target.value)}>
                {emirates.map((value) => <option key={value}>{value}</option>)}
              </select>
            </label>
          </div>
          <input className="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search area or location" aria-label="Search branches" />
          <div className="branch-list">
            {filteredBranches.map((branch) => (
              <button className={`branch-row ${branch.branch_id === selectedBranchId ? 'selected' : ''} ${branch.status === 'user_confirmed_permanently_closed' ? 'permanently-closed' : ''}`} key={branch.branch_id} onClick={() => selectBranch(branch.branch_id)}>
                <span className="branch-marker" />
                <span>
                  <strong>{branch.name.replace('Bedashing Beauty Lounge — ', '')}{branch.status === 'user_confirmed_permanently_closed' && ' — PERMANENTLY CLOSED'}</strong>
                  <small>{branch.community} · {branch.emirate}</small>
                </span>
              </button>
            ))}
            {!filteredBranches.length && <p className="empty">No locations match this filter.</p>}
          </div>
        </aside>

        <section className="map-panel">
          <NetworkMap branches={filteredBranches} allBranches={branches} networkMetrics={networkMetrics} selectedBranchId={selectedBranchId} competitors={activeCompetitors} showCompetitors={showCompetitors} candidates={whitespaceCandidates.records} selectedCandidateId={selectedCandidate?.cell_id ?? null} showCandidates={showWhitespace} showServiceRadii={showServiceRadii} radiusKm={radiusKm} onSelect={selectBranch} onSelectCandidate={selectCandidate} />
          <label className="competitor-toggle"><input type="checkbox" checked={showCompetitors} onChange={(event) => setShowCompetitors(event.target.checked)} /> Show {activeCompetitors.length} verified competitors</label>
          <label className="competitor-toggle"><input type="checkbox" checked={showWhitespace} onChange={(event) => setShowWhitespace(event.target.checked)} /> Show whitespace research areas</label>
          <div className="whitespace-legend" aria-label="Whitespace research-cell legend">
            <strong>Whitespace screening</strong>
            <span><i className="legend-watch" />Watch research</span>
            <span><i className="legend-skip" />Skip research</span>
            <span><i className="legend-required" />Research required</span>
          </div>
          <div className="radius-control">
            <label><input type="checkbox" checked={showServiceRadii} onChange={(event) => setShowServiceRadii(event.target.checked)} disabled={!selectedBranchIsActive} /> Show geometric radius</label>
            <label>Distance band
              <select value={radiusKm} onChange={(event) => setRadiusKm(Number(event.target.value))} disabled={!showServiceRadii || !selectedBranchIsActive}>
                {networkMetrics.radius_bands_km.map((radius) => <option key={radius} value={radius}>{radius} km</option>)}
              </select>
            </label>
            {showServiceRadii && selectedBranchIsActive && <div className="radius-key"><span><i className="radius-selected" />Selected branch</span><span><i className="radius-overlap" />Overlapping branch</span><small>Distance only—not drive time or customers</small></div>}
          </div>
          <div className="map-caption">Branch points are mapped coordinates. Whitespace hexagons are research areas, not precise sites. Service radii are geometric distance bands—not drive-time catchments or performance.</div>
        </section>

        <aside className="detail-panel" aria-live="polite">
          {selectedCandidate ? <WhitespaceDetail candidate={selectedCandidate} residentialContext={whitespaceCandidates.residential_context} /> : selectedBranch ? <BranchDetail branch={selectedBranch} metric={selectedMetric} pressure={selectedPressure} health={selectedHealth} scenario={selectedScenario} radiusKm={radiusKm} /> : <p className="empty">Select a location to inspect its evidence.</p>}
          {!selectedCandidate && selectedBranchIsActive && <AnalystPanel branch={selectedBranch} scenarioId={scenarioId} />}
          {!selectedCandidate && selectedBranchIsActive && <PortfolioReviewPanel />}
        </aside>
      </div>
    </main>
  )
}

function WhitespaceDetail({ candidate, residentialContext }: { candidate: any, residentialContext: any }) {
  const residentialAvailable = candidate.residential_context_coverage_status === 'available'
  return <><p className="eyebrow">Whitespace evidence</p><h2>{candidate.label.replaceAll('_', ' ')}</h2><p className="place">{candidate.study_area_id.replaceAll('_', ' ')}</p><dl className="facts"><div><dt>Nearest active branch</dt><dd>{candidate.nearest_active_branch_distance_km.toFixed(2)} km</dd></div><div><dt>Nearest high-priority anchor</dt><dd>{candidate.nearest_high_priority_anchor_km.toFixed(2)} km</dd></div><div><dt>Limited competitor pressure</dt><dd>{candidate.competitor_pressure_lower_bound.toFixed(2)}</dd></div><div><dt>Confidence</dt><dd>{candidate.confidence}%</dd></div></dl><section className="residential-context"><h3>Residential context · 2025 estimate</h3>{residentialAvailable ? <><p><strong>{Math.round(candidate.estimated_residents_2025).toLocaleString()}</strong> modelled residents in this hexagon</p><p>Relative residential intensity: <strong>{candidate.residential_intensity_percentile_within_study_area.toFixed(0)} / 100</strong> within this study area</p></> : <p><strong>Unavailable.</strong> No valid raster pixels were present, so the value remains missing—not zero.</p>}<p>{residentialContext.interpretation}</p><p>{residentialContext.label_role}</p><a href={residentialContext.source_url} target="_blank" rel="noreferrer">Open WorldPop source ↗</a></section><section className="caution"><h3>Important limitation</h3><p>{candidate.limitations[0]}</p></section></>
}

function BranchDetail({ branch, metric, pressure, health, scenario, radiusKm }: { branch: Branch, metric: BranchNetworkMetric | null, pressure: BranchCompetitorPressure | null, health: any, scenario: any, radiusKm: number }) {
  const nearestBranch = branches.find((item) => item.branch_id === metric?.nearest_own_branch_id)
  const selectedRadiusMetric = metric?.service_radius_metrics.find((item) => item.radius_km === radiusKm)
  const confirmedClosedCompetitorCount = competitorSnapshot.records.filter((competitor) => competitor.status === 'user_confirmed_permanently_closed').length
  const reputation = branchReputation.records.find((record: any) => record.branch_id === branch.branch_id)
  const permanentlyClosed = branch.status === 'user_confirmed_permanently_closed'
  return (
    <>
      <p className="eyebrow">Location evidence</p>
      <h2>{branch.name.replace('Bedashing Beauty Lounge — ', '')}</h2>
      <p className="place">{branch.community}, {branch.emirate}</p>
      <div className="status"><span className="status-dot" />{statusLabel(branch.status)}</div>
      <dl className="facts">
        <div><dt>Address</dt><dd>{branch.address}</dd></div>
        <div><dt>Coordinates</dt><dd>{branch.latitude?.toFixed(6)}, {branch.longitude?.toFixed(6)}</dd></div>
      </dl>
      {permanentlyClosed ? <section className="closed-record">
        <h3>Excluded from active analysis</h3>
        <p>This location is permanently closed. It remains in the historical roster for traceability and is excluded from geometry, competitor-pressure, branch-health, scenario, and AI analysis.</p>
        <details className="archival-sources">
          <summary>Historical location evidence</summary>
          <ul>{branch.source_urls.map((url) => <li key={url}><a href={url} target="_blank" rel="noreferrer">Open archived source <span aria-hidden="true">↗</span></a></li>)}</ul>
        </details>
      </section> : <section className="sources">
          <h3>Sources</h3>
          <p>Location-level URLs are preserved with this record. They support presence and geography—not financial performance or a final portfolio decision.</p>
          <ul>
            {branch.source_urls.map((url) => <li key={url}><a href={url} target="_blank" rel="noreferrer">Open evidence source <span aria-hidden="true">↗</span></a></li>)}
          </ul>
        </section>}
      {metric && selectedRadiusMetric && <section className="geometry">
        <h3>Network geometry · {radiusKm} km</h3>
        <p>Nearest own location: <strong>{nearestBranch?.name.replace('Bedashing Beauty Lounge — ', '')}</strong> · {metric.nearest_own_branch_distance_km.toFixed(2)} km</p>
        <p>Overlapping service radii: <strong>{selectedRadiusMetric.overlapping_branch_count}</strong> · largest pairwise overlap: <strong>{(selectedRadiusMetric.maximum_pairwise_overlap_coefficient * 100).toFixed(0)}%</strong></p>
        <p className="geometry-note">Geometry is a screening input only. It does not measure customer behavior, performance, or drive time.</p>
      </section>}
      {pressure && <section className="competitor-evidence">
        <h3>Verified competitor screen</h3>
        <p className="coverage-warning"><strong>Candidate review complete:</strong> {competitorPressure.competitor_geo_coverage.geocoded_verified_record_count} active geocoded locations; {confirmedClosedCompetitorCount} permanently closed locations excluded. <strong>Scope limit:</strong> this screen covers only the two researched brands, so zero does not mean no competition.</p>
        <p>Lower-bound pressure: <strong>{pressure.verified_competitor_pressure_lower_bound.toFixed(2)}</strong></p>
        {pressure.contributions.length ? <ul className="contributions">
          {pressure.contributions.map((contribution) => {
            const competitor = competitorSnapshot.records.find((item) => item.competitor_id === contribution.competitor_id)
            return <li key={contribution.competitor_id}><strong>{competitor?.name.replace(' Beauty Lounge — ', ' — ') ?? contribution.competitor_id}</strong><small>{contribution.distance_km.toFixed(2)} km · relevance {contribution.similarity_weight.toFixed(1)} · contribution {contribution.contribution.toFixed(2)}</small>{competitor?.source_urls[0] && <a href={competitor.source_urls[0]} target="_blank" rel="noreferrer">Source ↗</a>}</li>
          })}
        </ul> : <p className="empty-inline">No contributor within the model threshold. This is not evidence that local competition is absent.</p>}
      </section>}
      {health && <BranchHealthEvidence health={health} scenario={scenario} reputation={reputation} />}
      {!permanentlyClosed && branch.validation_needed.length > 0 && <section className="caution"><h3>Still to verify</h3><p>{branch.validation_needed.join(' · ')}</p></section>}
    </>
  )
}

const confidenceLabels: Record<string, string> = {
  source_reliability: 'Source reliability',
  source_freshness: 'Source freshness',
  review_sample_adequacy: 'Review sample size',
  peer_group_adequacy: 'Peer-group fit',
  feature_completeness: 'Available model factors',
  competitor_scope: 'Competitor coverage',
}

function BranchHealthEvidence({ health, scenario, reputation }: { health: any, scenario: any, reputation: any }) {
  if (health.review_label === 'INSUFFICIENT_EVIDENCE') {
    return <section className="competitor-evidence"><h3>Branch-health public proxy</h3><p><strong>Insufficient evidence</strong></p><p>No score was produced. Missing: {health.missing_requirements.join(', ').replaceAll('_', ' ')}.</p></section>
  }
  const contributionRows = [
    ['Public reputation', 'peer_adjusted_reputation', 'peer_adjusted_reputation_percentile', scenario.weights.peer_adjusted_reputation],
    ['Limited competitor pressure', 'inverse_competitor_pressure', 'inverse_competitor_pressure_percentile', scenario.weights.inverse_competitor_pressure],
    ['Own-network spacing', 'inverse_own_network_overlap', 'inverse_own_network_overlap_percentile', scenario.weights.inverse_own_network_overlap],
  ] as const
  return <section className="competitor-evidence health-evidence">
    <h3>Branch-health public proxy</h3>
    <p className="health-result"><strong>{health.review_label.replaceAll('_', ' ')}</strong><span>Score {health.public_proxy_score.toFixed(2)}/100</span><span>Evidence confidence {health.confidence.toFixed(0)}%</span></p>
    <p className="geometry-note">This tells a reviewer where to investigate first. It is not financial health, customer demand, or a closure decision.</p>
    <details className="health-explanation" open>
      <summary>Why this score?</summary>
      {reputation && <div className="reputation-evidence"><strong>Observed public reputation</strong><span>{reputation.rating_value.toFixed(1)} rating · {reputation.rating_count.toLocaleString()} reviews · observed {reputation.observed_at}</span><span>Adjusted rating: {health.factor_values.bayesian_adjusted_rating.toFixed(3)} before comparison with {health.factor_values.peer_count} peers.</span>{reputation.source_url && <a href={reputation.source_url} target="_blank" rel="noreferrer">Open rating evidence ↗</a>}</div>}
      <ol className="score-breakdown">
        {contributionRows.map(([label, contributionKey, valueKey, weight]) => <li key={contributionKey}>
          <div><strong>{label}</strong><span>{(health.factor_values[valueKey] * 100).toFixed(0)}th percentile × {Math.round(weight * 100)} points</span></div>
          <b>+{health.factor_contributions[contributionKey].toFixed(2)}</b>
        </li>)}
      </ol>
      <p className="score-equation">Total: {Object.values(health.factor_contributions).map((value: any) => Number(value).toFixed(2)).join(' + ')} = <strong>{health.public_proxy_score.toFixed(2)}</strong></p>
      <p className="geometry-note">Higher reputation helps. Lower verified competitor pressure and lower 3 km network overlap help. Coverage uniqueness is omitted because it is not available.</p>
    </details>
    <details className="health-explanation">
      <summary>Why {health.confidence.toFixed(0)}% confidence?</summary>
      <ul className="confidence-breakdown">
        {Object.entries(health.confidence_components).map(([key, value]: [string, any]) => <li key={key}><span>{confidenceLabels[key] ?? key.replaceAll('_', ' ')}</span><strong>{Math.round(value * 100)}%</strong></li>)}
      </ul>
      <p className="score-equation">Confidence is the simple average of these six evidence-quality checks. It does not increase the branch score.</p>
    </details>
    <p className="peer-basis">Compared with: <strong>{health.comparison_basis.replaceAll('_', ' ')}</strong></p>
    <section className="scenario-evidence"><h3>Scenario sensitivity · {scenario.label}</h3><p>{scenario.description}</p><dl className="scenario-facts"><div><dt>Baseline → scenario</dt><dd>{health.baseline_public_proxy_score.toFixed(2)} → {health.public_proxy_score.toFixed(2)} <strong className={health.score_delta > 0 ? 'positive-delta' : health.score_delta < 0 ? 'negative-delta' : ''}>({health.score_delta > 0 ? '+' : ''}{health.score_delta.toFixed(2)})</strong></dd></div><div><dt>Review label</dt><dd>{health.baseline_review_label.replaceAll('_', ' ')} → {health.review_label.replaceAll('_', ' ')}{health.label_changed && <strong className="label-change"> changed</strong>}</dd></div><div><dt>Weights</dt><dd>Reputation {Math.round(scenario.weights.peer_adjusted_reputation * 100)}% · competitors {Math.round(scenario.weights.inverse_competitor_pressure * 100)}% · spacing {Math.round(scenario.weights.inverse_own_network_overlap * 100)}%</dd></div></dl><p className="geometry-note">Same evidence; only declared priorities changed. This shows sensitivity, not a forecast.</p></section>
  </section>
}
