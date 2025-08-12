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
      // Create an AbortController for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
      
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
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to generate preview' }))
        throw new Error(errorData.error || 'Failed to generate preview')
      }
      
      const data = await response.json()
      setPreview(data.preview)
      setError(null) // Clear any previous errors
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate preview'
      
      // Check if it was an abort error (timeout)
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Preview generation timed out, using fallback')
      } else {
        console.error('Rule preview generation error:', err)
      }
      
      // Always use fallback on any error
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
        setError(null) // Clear error since we have a fallback
      } catch (fallbackError) {
        console.error('Fallback preview generation failed:', fallbackError)
        setPreview('Your assistant will respond based on your guidelines when this rule triggers.')
        setError(null) // Don't show error to user since we have a generic message
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