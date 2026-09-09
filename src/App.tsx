import { useCallback, useMemo, useState } from 'react'
import { branches, networkMetrics, snapshot } from './data'
import { NetworkMap } from './NetworkMap'
import type { Branch, BranchNetworkMetric } from './types'

const emirates = ['All', ...Array.from(new Set(branches.map((branch) => branch.emirate))).sort()]

function statusLabel(status: Branch['status']) {
  return status === 'observed_currently_listed' ? 'Currently listed' : status.replaceAll('_', ' ')
}

export function App() {
  const [emirate, setEmirate] = useState('All')
  const [query, setQuery] = useState('')
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(branches[0]?.branch_id ?? null)

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
          <NetworkMap branches={filteredBranches} selectedBranchId={selectedBranchId} onSelect={selectBranch} />
          <div className="map-caption">Point locations are secondary-map coordinates. Service-radius metrics in the evidence panel are geometric distance bands—not drive-time catchments or performance.</div>
        </section>

        <aside className="detail-panel" aria-live="polite">
          {selectedBranch ? <BranchDetail branch={selectedBranch} metric={selectedMetric} /> : <p className="empty">Select a location to inspect its evidence.</p>}
        </aside>
      </div>
    </main>
  )
}

function BranchDetail({ branch, metric }: { branch: Branch, metric: BranchNetworkMetric | null }) {
  const nearestBranch = branches.find((item) => item.branch_id === metric?.nearest_own_branch_id)
  const primaryRadiusMetric = metric?.service_radius_metrics.find((item) => item.radius_km === networkMetrics.primary_radius_km)
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
      {branch.validation_needed.length > 0 && <section className="caution"><h3>Still to verify</h3><p>{branch.validation_needed.join(' · ')}</p></section>}
    </>
  )
}
