// apps/web/hooks/use-rule-preview.ts

import { useState, useCallback } from 'react'
import type { SensorMetadata } from '@/types'

interface UseRulePreviewReturn {
  preview: string
  isLoading: boolean
  error: string | null
  generatePreview: (params: {
    guidelines: string
    tones: string[]
    sensorConfig: SensorMetadata
    sensorValue: any
    operator: string
    vesselType?: string
    vesselCode?: string
    auraName?: string
  }) => Promise<void>
  clearError: () => void
  clearPreview: () => void
}

export function useRulePreview(): UseRulePreviewReturn {
  const [preview, setPreview] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generatePreview = useCallback(async (params: {
    guidelines: string
    tones: string[]
    sensorConfig: SensorMetadata
    sensorValue: any
    operator: string
    vesselType?: string
    vesselCode?: string
    auraName?: string
  }) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/rule/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guidelines: params.guidelines,
          tones: params.tones,
          sensorConfig: params.sensorConfig,
          sensorValue: params.sensorValue,
          operator: params.operator,
          vesselType: params.vesselType || 'digital',
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
      console.error('Rule preview generation error:', err)
      
      // Fallback to static preview on error
      try {
        const { generateRulePreview } = await import('@/lib/rule-preview')
        const fallbackPreview = generateRulePreview({
          guidelines: params.guidelines,
          tones: params.tones,
          sensorConfig: params.sensorConfig,
          sensorValue: params.sensorValue,
          operator: params.operator,
          vesselType: params.vesselType || 'digital',
          vesselCode: params.vesselCode,
          auraName: params.auraName
        })
        setPreview(fallbackPreview)
      } catch (fallbackError) {
        console.error('Fallback preview generation failed:', fallbackError)
        setPreview('Unable to generate preview at this time.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])
  
  const clearError = useCallback(() => {
    setError(null)
  }, [])
  
  const clearPreview = useCallback(() => {
    setPreview('')
    setError(null)
  }, [])
  
  return {
    preview,
    isLoading,
    error,
    generatePreview,
    clearError,
    clearPreview
  }
}