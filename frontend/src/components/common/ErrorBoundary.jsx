// components/common/ErrorBoundary.jsx
// React class ErrorBoundary — catches render errors in child trees.
// Displays a professional error UI instead of crashing.

import { Component } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // In production, send to error tracking (e.g. Sentry)
    if (import.meta.env.PROD) {
      console.error('[ErrorBoundary] Caught:', error, info)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    const { fallback } = this.props

    // Allow custom fallback from parent
    if (fallback) {
      return typeof fallback === 'function'
        ? fallback({ error: this.state.error, reset: this.handleReset })
        : fallback
    }

    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center',
          'min-h-[60vh] gap-6 px-6 text-center',
        )}
        role="alert"
      >
        {/* Icon */}
        <div className="rounded-full bg-amber-50 dark:bg-amber-900/20 p-4">
          <AlertTriangle
            size={36}
            className="text-amber-500 dark:text-amber-400"
          />
        </div>

        {/* Message */}
        <div className="space-y-2 max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Something went wrong
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            An unexpected error occurred. Please try refreshing the page.
            If the problem persists, contact support.
          </p>

          {/* Error details in dev mode */}
          {import.meta.env.DEV && this.state.error && (
            <pre
              className={cn(
                'mt-4 p-3 text-left text-xs rounded-lg overflow-auto',
                'bg-red-50 dark:bg-red-900/20',
                'text-red-700 dark:text-red-400',
                'border border-red-200 dark:border-red-800',
                'max-h-40',
              )}
            >
              {this.state.error.message}
            </pre>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={this.handleReset}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg',
              'bg-indigo-600 text-white hover:bg-indigo-700',
              'transition-colors duration-150',
            )}
          >
            <RefreshCw size={14} />
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg',
              'border border-gray-200 dark:border-gray-700',
              'text-gray-700 dark:text-gray-300',
              'hover:bg-gray-50 dark:hover:bg-gray-800',
              'transition-colors duration-150',
            )}
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }
}
