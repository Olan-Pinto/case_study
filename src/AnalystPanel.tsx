import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Branch } from './types'

type Activity = { step: number, title: string, tool_name: string, input: Record<string, unknown>, status: string, duration_ms: number, source_ids: string[], error_code?: string }
type AnalystResult = { status: string, answer?: string, message?: string, fallback?: string, elapsed_ms?: number, activity_trace?: Activity[], evidence?: Array<{ tool_name: string, result: { source_ids?: string[] } }> }

function formatInput(input: Record<string, unknown>) { return Object.entries(input).filter(([, value]) => value !== undefined).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`).join(' · ') || 'No public input summary' }
function formatElapsed(milliseconds?: number) { if (milliseconds === undefined) return ''; return milliseconds < 1000 ? `${milliseconds} ms` : `${(milliseconds / 1000).toFixed(1)} s` }

export function AnalystPanel({ branch, scenarioId }: { branch: Branch | null, scenarioId: string }) {
  const [question, setQuestion] = useState('')
  const [result, setResult] = useState<AnalystResult | null>(null)
  const [loading, setLoading] = useState(false)
  const suggestedQuestion = branch ? `Explain ${branch.branch_id} under the ${scenarioId} scenario using its evidence and limitations.` : 'Explain the limits of the current portfolio evidence.'

  async function submit(value = question) {
    const trimmed = value.trim(); if (!trimmed) return
    setLoading(true); setResult(null)
    try {
      const response = await fetch('/api/analyst', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ question: trimmed }) })
      setResult(await response.json())
    } catch {
      setResult({ status: 'AI_UNAVAILABLE', message: 'The local analyst server is not running.', fallback: 'Start the server with npm run analyst, configure OPENAI_API_KEY only on the server, or continue with the deterministic evidence panels.' })
    } finally { setLoading(false) }
  }

  return <section className="analyst-panel" aria-busy={loading}>
    <p className="eyebrow">Optional AI analyst</p>
    <h2>Ask about the evidence</h2>
    <p>It can read approved snapshots through tools. It cannot change scores, browse the web, or make operating decisions.</p>
    <button className="suggested-question" onClick={() => { setQuestion(suggestedQuestion); submit(suggestedQuestion) }} disabled={loading}>Explain selected evidence</button>
    <label className="analyst-input-label">Your question
      <textarea value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={500} placeholder="Ask about a known branch, scenario, source, or research cell." />
    </label>
    <button className="analyst-submit" onClick={() => submit()} disabled={loading || !question.trim()}>{loading ? 'Checking approved evidence…' : 'Ask analyst'}</button>
    {result && <div className={`analyst-result ${result.status === 'ok' ? 'grounded' : 'fallback'}`}><strong>{result.status === 'ok' ? 'Grounded response' : result.status.replaceAll('_', ' ')}</strong>{result.answer && <div className="analyst-markdown"><ReactMarkdown remarkPlugins={[remarkGfm]}>{result.answer}</ReactMarkdown></div>}{result.message && <p>{result.message}</p>}{result.fallback && <p className="geometry-note">{result.fallback}</p>}{result.activity_trace && result.activity_trace.length > 0 ? <details className="analyst-trace"><summary>Evidence activity · {result.activity_trace.length} {result.activity_trace.length === 1 ? 'tool' : 'tools'} · {formatElapsed(result.elapsed_ms)}</summary><p>Shows approved evidence activity, not private model reasoning.</p><ol>{result.activity_trace.map((activity) => <li key={`${activity.step}-${activity.tool_name}`}><strong>{activity.step}. {activity.title}</strong><small>{activity.status} · {formatElapsed(activity.duration_ms)}</small><small>Input: {formatInput(activity.input)}</small><small>Source IDs: {activity.source_ids.join(', ') || 'none returned'}{activity.error_code ? ` · ${activity.error_code}` : ''}</small></li>)}</ol></details> : result.evidence && result.evidence.length > 0 && <ul>{result.evidence.map((item, index) => <li key={`${item.tool_name}-${index}`}><strong>{item.tool_name}</strong><small>Source IDs: {item.result.source_ids?.join(', ') || 'none returned'}</small></li>)}</ul>}</div>}
  </section>
}
