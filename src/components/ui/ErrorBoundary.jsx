import { Component } from 'react'
import Button from './Button'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5 text-2xl">⚠️</div>
            <h2 className="text-xl font-bold text-text mb-2">Something went wrong</h2>
            <p className="text-text-muted text-sm mb-6">An unexpected error occurred. Please refresh the page.</p>
            <Button onClick={() => window.location.reload()}>Refresh Page</Button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
