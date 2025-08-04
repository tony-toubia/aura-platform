// apps/web/lib/hooks/use-auto-save.ts
import { useCallback, useRef, useState } from 'react'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface UseAutoSaveOptions {
  delay?: number
  onSave: () => Promise<void>
  onError?: (error: Error) => void
}

export function useAutoSave({ delay = 1000, onSave, onError }: UseAutoSaveOptions) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isInitialMount = useRef(true)
  const isSaving = useRef(false) // Prevent concurrent saves

  const debouncedSave = useCallback(async () => {
    // Skip auto-save on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    // Skip if already saving
    if (isSaving.current) {
      console.log('🔄 Skipping debounced save - already saving')
      return
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set up new timeout
    timeoutRef.current = setTimeout(async () => {
      if (isSaving.current) {
        console.log('🔄 Skipping timeout save - already saving')
        return
      }

      try {
        isSaving.current = true
        setSaveStatus('saving')
        await onSave()
        setSaveStatus('saved')
        
        // Reset to idle after showing saved status
        setTimeout(() => setSaveStatus('idle'), 2000)
      } catch (error) {
        console.error('Auto-save failed:', error)
        setSaveStatus('error')
        onError?.(error as Error)
        
        // Reset to idle after showing error status
        setTimeout(() => setSaveStatus('idle'), 3000)
      } finally {
        isSaving.current = false
      }
    }, delay)
  }, [delay, onSave, onError])

  const saveImmediately = useCallback(async () => {
    // Skip if already saving
    if (isSaving.current) {
      console.log('🔄 Skipping immediate save - already saving')
      return
    }

    // Clear any pending debounced save
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    try {
      isSaving.current = true
      setSaveStatus('saving')
      await onSave()
      setSaveStatus('saved')
      
      // Reset to idle after showing saved status
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (error) {
      console.error('Immediate save failed:', error)
      setSaveStatus('error')
      onError?.(error as Error)
      
      // Reset to idle after showing error status
      setTimeout(() => setSaveStatus('idle'), 3000)
    } finally {
      isSaving.current = false
    }
  }, [onSave, onError])

  const cancelPendingSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  return {
    saveStatus,
    debouncedSave,
    saveImmediately,
    cancelPendingSave
  }
}