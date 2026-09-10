import { useCallback, useMemo, useState } from 'react'
import { activeCompetitors, branchHealth, branches, competitorPressure, competitorSnapshot, networkMetrics, snapshot } from './data'
import { NetworkMap } from './NetworkMap'
import type { Branch, BranchCompetitorPressure, BranchNetworkMetric } from './types'

const emirates = ['All', ...Array.from(new Set(branches.map((branch) => branch.emirate))).sort()]

function statusLabel(status: Branch['status']) {
  return status === 'observed_currently_listed' ? 'Currently listed' : status.replaceAll('_', ' ')
}

export function App() {
  const [emirate, setEmirate] = useState('All')
  const [query, setQuery] = useState('')
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(branches[0]?.branch_id ?? null)
  const [showCompetitors, setShowCompetitors] = useState(true)

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
  const selectedHealth = branchHealth.records.find((metric: any) => metric.branch_id === selectedBranchId) ?? null
  const selectBranch = useCallback((branchId: string) => setSelectedBranchId(branchId), [])

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
        <strong>{snapshot.official_claimed_uae_lounges} lounges</strong>
        <span>Reconciled current roster</span>
        <span>•</span>
        <span>24 coordinates</span>
        <span>•</span>
        <span>Public mapping evidence, not operating performance</span>
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
              <button className={`branch-row ${branch.branch_id === selectedBranchId ? 'selected' : ''}`} key={branch.branch_id} onClick={() => selectBranch(branch.branch_id)}>
                <span className="branch-marker" />
                <span>
                  <strong>{branch.name.replace('Bedashing Beauty Lounge — ', '')}</strong>
                  <small>{branch.community} · {branch.emirate}</small>
                </span>
              </button>
            ))}
            {!filteredBranches.length && <p className="empty">No locations match this filter.</p>}
          </div>
        </aside>

        <section className="map-panel">
          <NetworkMap branches={filteredBranches} selectedBranchId={selectedBranchId} competitors={activeCompetitors} showCompetitors={showCompetitors} onSelect={selectBranch} />
          <label className="competitor-toggle"><input type="checkbox" checked={showCompetitors} onChange={(event) => setShowCompetitors(event.target.checked)} /> Show {activeCompetitors.length} verified competitors</label>
          <div className="map-caption">Point locations are secondary-map coordinates. Service-radius metrics in the evidence panel are geometric distance bands—not drive-time catchments or performance.</div>
        </section>

        <aside className="detail-panel" aria-live="polite">
          {selectedBranch ? <BranchDetail branch={selectedBranch} metric={selectedMetric} pressure={selectedPressure} health={selectedHealth} /> : <p className="empty">Select a location to inspect its evidence.</p>}
        </aside>
      </div>
    </main>
  )
}

function BranchDetail({ branch, metric, pressure, health }: { branch: Branch, metric: BranchNetworkMetric | null, pressure: BranchCompetitorPressure | null, health: any }) {
  const nearestBranch = branches.find((item) => item.branch_id === metric?.nearest_own_branch_id)
  const primaryRadiusMetric = metric?.service_radius_metrics.find((item) => item.radius_km === networkMetrics.primary_radius_km)
  const confirmedClosedCompetitorCount = competitorSnapshot.records.filter((competitor) => competitor.status === 'user_confirmed_permanently_closed').length
  return (
    <>
      <p className="eyebrow">Location evidence</p>
      <h2>{branch.name.replace('Bedashing Beauty Lounge — ', '')}</h2>
      <p className="place">{branch.community}, {branch.emirate}</p>
      <div className="status"><span className="status-dot" />{statusLabel(branch.status)}</div>
      <dl className="facts">
        <div><dt>Address</dt><dd>{branch.address}</dd></div>
        <div><dt>Coordinates</dt><dd>{branch.latitude?.toFixed(6)}, {branch.longitude?.toFixed(6)}</dd></div>
        <div><dt>Coordinate evidence</dt><dd>2GIS-attributed, user validated</dd></div>
        <div><dt>Snapshot</dt><dd>{snapshot.snapshot_id}</dd></div>
      </dl>
      <section className="sources">
        <h3>Sources</h3>
        <p>Location-level URLs are preserved with this record. They support presence and geography—not financial performance or a final portfolio decision.</p>
        <ul>
          {branch.source_urls.map((url) => <li key={url}><a href={url} target="_blank" rel="noreferrer">Open evidence source <span aria-hidden="true">↗</span></a></li>)}
        </ul>
      </section>
      {metric && primaryRadiusMetric && <section className="geometry">
        <h3>Network geometry · {networkMetrics.primary_radius_km} km</h3>
        <p>Nearest own location: <strong>{nearestBranch?.name.replace('Bedashing Beauty Lounge — ', '')}</strong> · {metric.nearest_own_branch_distance_km.toFixed(2)} km</p>
        <p>Overlapping service radii: <strong>{primaryRadiusMetric.overlapping_branch_count}</strong> · largest pairwise overlap: <strong>{(primaryRadiusMetric.maximum_pairwise_overlap_coefficient * 100).toFixed(0)}%</strong></p>
        <p className="geometry-note">Geometry is a screening input only. It does not measure customer behavior, performance, or drive time.</p>
      </section>}
      {pressure && <section className="competitor-evidence">
        <h3>Verified competitor screen</h3>
        <p className="coverage-warning"><strong>Candidate review complete:</strong> {competitorPressure.competitor_geo_coverage.geocoded_verified_record_count} active geocoded locations; {confirmedClosedCompetitorCount} user-confirmed closed locations excluded. <strong>Scope limit:</strong> this screen covers only the two researched brands, so zero does not mean no competition.</p>
        <p>Lower-bound pressure: <strong>{pressure.verified_competitor_pressure_lower_bound.toFixed(2)}</strong></p>
        {pressure.contributions.length ? <ul className="contributions">
          {pressure.contributions.map((contribution) => {
            const competitor = competitorSnapshot.records.find((item) => item.competitor_id === contribution.competitor_id)
            return <li key={contribution.competitor_id}><strong>{competitor?.name.replace(' Beauty Lounge — ', ' — ') ?? contribution.competitor_id}</strong><small>{contribution.distance_km.toFixed(2)} km · relevance {contribution.similarity_weight.toFixed(1)} · contribution {contribution.contribution.toFixed(2)}</small>{competitor?.source_urls[0] && <a href={competitor.source_urls[0]} target="_blank" rel="noreferrer">Source ↗</a>}</li>
          })}
        </ul> : <p className="empty-inline">No contributor within the model threshold. This is not evidence that local competition is absent.</p>}
      </section>}
      {health && <section className="competitor-evidence"><h3>Branch-health public proxy</h3><p><strong>{health.review_label.replace('_', ' ')}</strong> · score {health.public_proxy_score.toFixed(0)}/100 · confidence {health.confidence.toFixed(0)}%</p><p className="geometry-note">Peer basis: {health.comparison_basis.replaceAll('_', ' ')}. Public-proxy evidence only; not financial health or a closure decision.</p></section>}
      {branch.validation_needed.length > 0 && <section className="caution"><h3>Still to verify</h3><p>{branch.validation_needed.join(' · ')}</p></section>}
    </>
  )
}
