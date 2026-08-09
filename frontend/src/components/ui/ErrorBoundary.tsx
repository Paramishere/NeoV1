/**
 * ErrorBoundary — Catches React render errors gracefully.
 */
import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[NEO ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex flex-col items-center justify-center h-screen gap-6 p-8"
          style={{ background: '#020810' }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            <span className="text-2xl">⚠</span>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-display font-semibold mb-2" style={{ color: '#ef4444' }}>
              NEO Encountered an Error
            </h2>
            <p className="text-sm mb-1" style={{ color: 'rgba(100, 116, 139, 0.8)' }}>
              {this.state.error?.message ?? 'An unexpected error occurred'}
            </p>
            <p className="text-xs" style={{ color: 'rgba(100, 116, 139, 0.4)' }}>
              Check the logs for more details
            </p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="neo-btn-primary px-6 py-2 rounded-neo"
          >
            Try Again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
