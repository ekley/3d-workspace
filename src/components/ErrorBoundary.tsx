import { Component, type ReactNode } from 'react'

export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="fatal" role="alert">
          <div className="fatal-code">NEXUS // FAULT</div>
          <div className="fatal-title">Something went wrong.</div>
          <div className="fatal-sub">{String(this.state.error?.message ?? this.state.error)}</div>
          <button className="fatal-reload" onClick={() => location.reload()}>
            Reload workspace
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
