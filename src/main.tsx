import { Component, StrictMode, type ErrorInfo, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import 'maplibre-gl/dist/maplibre-gl.css'
import './styles.css'
import { App } from './App'

class ApplicationErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Application render failed', error, info) }
  render() {
    if (this.state.failed) return <main className="fatal-error" role="alert"><h1>The workspace could not be displayed</h1><p>Reload the page. If the problem continues, run the offline verification command shown in the README.</p><button onClick={() => window.location.reload()}>Reload workspace</button></main>
    return this.props.children
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApplicationErrorBoundary><App /></ApplicationErrorBoundary>
  </StrictMode>,
)
