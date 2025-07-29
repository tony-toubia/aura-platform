// apps/web/hooks/use-personality-preview.ts

import { useState, useCallback } from 'react'
import type { Personality } from '@/types'

interface UsePersonalityPreviewReturn {
  preview: string
  isLoading: boolean
  error: string | null
  generatePreview: (params: {
    personality: Personality
    vesselType: string
    vesselCode?: string
    auraName?: string
  }) => Promise<void>
  clearError: () => void
}

export function usePersonalityPreview(): UsePersonalityPreviewReturn {
  const [preview, setPreview] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const generatePreview = useCallback(async (params: {
    personality: Personality
    vesselType: string
    vesselCode?: string
    auraName?: string
  }) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/personality/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personality: params.personality,
          vesselType: params.vesselType,
          vesselCode: params.vesselCode || '',
          auraName: params.auraName || 'Your Aura'
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate preview')
      }
      
      const data = await response.json()
      setPreview(data.preview)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate preview'
      setError(errorMessage)
      console.error('Preview generation error:', err)
      
      // Fallback to static preview on error
      const { generatePersonalityPreview: fallback } = await import('@/lib/personality-preview')
      const fallbackPreview = fallback(params.personality, params.vesselCode)
      setPreview(fallbackPreview)
    } finally {
      setIsLoading(false)
    }
  }, [])
  
  const clearError = useCallback(() => {
    setError(null)
  }, [])
  
  return {
    preview,
    isLoading,
    error,
    generatePreview,
    clearError
  }
}