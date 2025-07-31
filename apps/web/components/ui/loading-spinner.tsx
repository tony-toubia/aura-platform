// apps/web/components/ui/loading-spinner.tsx
// Reusable loading spinner component

import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8'
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center space-x-2", className)}>
      <Loader2 className={cn("animate-spin", sizeClasses[size])} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  )
}

interface LoadingStateProps {
  isLoading: boolean
  error?: string | null
  children: React.ReactNode
  loadingText?: string
  errorText?: string
  className?: string
}

export function LoadingState({ 
  isLoading, 
  error, 
  children, 
  loadingText = "Loading...",
  errorText = "Something went wrong",
  className 
}: LoadingStateProps) {
  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <LoadingSpinner text={loadingText} />
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn("flex items-center justify-center p-8 text-center", className)}>
        <div className="text-red-600">
          <p className="font-medium">{errorText}</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}