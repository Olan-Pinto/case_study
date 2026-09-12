import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Activity = { step: number, title: string, tool_name: string, input: Record<string, unknown>, status: string, duration_ms: number, source_ids: string[], error_code?: string }
type ReviewResult = { status: string, answer?: string, message?: string, fallback?: string, scope_label?: string, elapsed_ms?: number, activity_trace?: Activity[] }

const scopeOptions = [
  { value: 'uae', label: 'Whole UAE portfolio' },
  { value: 'dubai', label: 'Dubai portfolio' },
  { value: 'abu_dhabi', label: 'Abu Dhabi portfolio' },
]

function formatElapsed(milliseconds?: number) { if (milliseconds === undefined) return ''; return milliseconds < 1000 ? `${milliseconds} ms` : `${(milliseconds / 1000).toFixed(1)} s` }
function formatInput(input: Record<string, unknown>) { return Object.entries(input).filter(([, value]) => value !== undefined).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`).join(' · ') || 'No public input summary' }

export function PortfolioReviewPanel() {
  const [scope, setScope] = useState('abu_dhabi')
  const [result, setResult] = useState<ReviewResult | null>(null)
  const [loading, setLoading] = useState(false)

  async function runReview() {
    setLoading(true); setResult(null)
    try {
      const response = await fetch('/api/portfolio-review', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ scope }) })
      setResult(await response.json())
    } catch {
      setResult({ status: 'AI_UNAVAILABLE', message: 'The local analyst server is not running.', fallback: 'Start npm run analyst to use the tool-grounded review agent. The deterministic workspace remains available without it.' })
    } finally { setLoading(false) }
  }

  return <section className="portfolio-review-panel" aria-busy={loading}>
    <p className="eyebrow">Phase 9 · AI research worklist</p>
    <h2>Review a portfolio scope</h2>
    <p>The agent gathers bounded portfolio evidence, selects follow-up checks, and gives a cited list of what a human should investigate next. It does not make a business decision.</p>
    <label className="review-scope-label">Scope
      <select value={scope} onChange={(event) => setScope(event.target.value)} disabled={loading}>{scopeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
    </label>
    <button className="portfolio-review-submit" onClick={runReview} disabled={loading}>{loading ? 'Building research worklist…' : 'Build research worklist'}</button>
    {result && <div className={`portfolio-review-result ${result.status === 'ok' ? 'grounded' : 'fallback'}`}><strong>{result.status === 'ok' ? `Grounded worklist · ${result.scope_label}` : result.status.replaceAll('_', ' ')}</strong>{result.answer && <div className="portfolio-review-markdown"><ReactMarkdown remarkPlugins={[remarkGfm]}>{result.answer}</ReactMarkdown></div>}{result.message && <p>{result.message}</p>}{result.fallback && <p className="geometry-note">{result.fallback}</p>}{result.activity_trace && result.activity_trace.length > 0 && <details className="portfolio-review-trace"><summary>Evidence activity · {result.activity_trace.length} {result.activity_trace.length === 1 ? 'tool' : 'tools'} · {formatElapsed(result.elapsed_ms)}</summary><p>Shows approved evidence activity, not private model reasoning.</p><ol>{result.activity_trace.map((activity) => <li key={`${activity.step}-${activity.tool_name}`}><strong>{activity.step}. {activity.title}</strong><small>{activity.status} · {formatElapsed(activity.duration_ms)}</small><small>Input: {formatInput(activity.input)}</small><small>Source IDs: {activity.source_ids.join(', ') || 'none returned'}{activity.error_code ? ` · ${activity.error_code}` : ''}</small></li>)}</ol></details>}</div>}
  </section>
}
