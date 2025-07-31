// apps/web/components/ui/error-boundary.tsx
// Reusable error boundary and error display components

'use client'

import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ErrorDisplayProps {
  title?: string
  message: string
  details?: string
  onRetry?: () => void
  className?: string
}

export function ErrorDisplay({ 
  title = "Something went wrong",
  message, 
  details,
  onRetry,
  className 
}: ErrorDisplayProps) {
  return (
    <Card className={cn("border-red-200 bg-red-50", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <CardTitle className="text-red-800">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-red-700">{message}</p>
        {details && (
          <details className="text-sm">
            <summary className="cursor-pointer text-red-600 hover:text-red-800">
              Show details
            </summary>
            <pre className="mt-2 p-2 bg-red-100 rounded text-xs overflow-auto">
              {details}
            </pre>
          </details>
        )}
        {onRetry && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback
      
      if (FallbackComponent && this.state.error) {
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />
      }

      return (
        <ErrorDisplay
          title="Application Error"
          message="An unexpected error occurred. Please try refreshing the page."
          details={this.state.error?.stack}
          onRetry={this.resetError}
          className="m-4"
        />
      )
    }

    return this.props.children
  }
}

// Hook for handling async errors
export function useErrorHandler() {
  const [error, setError] = React.useState<string | null>(null)

  const handleError = React.useCallback((error: Error | string) => {
    const message = error instanceof Error ? error.message : error
    setError(message)
    console.error('Error handled:', error)
  }, [])

  const clearError = React.useCallback(() => {
    setError(null)
  }, [])

  return { error, handleError, clearError }
}