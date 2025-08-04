// apps/web/components/ui/save-status-indicator.tsx
import React from 'react'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SaveStatus } from '@/lib/hooks/use-auto-save'

interface SaveStatusIndicatorProps {
  status: SaveStatus
  className?: string
}

export function SaveStatusIndicator({ status, className }: SaveStatusIndicatorProps) {
  if (status === 'idle') {
    return null
  }

  return (
    <div className={cn('flex items-center gap-2 text-sm', className)}>
      {status === 'saving' && (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          <span className="text-blue-600">Saving...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-green-600">Saved</span>
        </>
      )}
      {status === 'error' && (
        <>
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-red-600">Save failed</span>
        </>
      )}
    </div>
  )
}