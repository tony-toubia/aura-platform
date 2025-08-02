// apps/web/hooks/use-creation-context.ts

import { useState, useCallback, useEffect, useContext, createContext } from 'react'
import { useRouter } from 'next/navigation'
import type { 
  CreationContext, 
  CreationStep, 
  CreationMethod, 
  VesselTypeId,
  AuraConfiguration,
  CreationContextActions 
} from '@/types/creation-wizard'
import { auraApi } from '@/lib/api/client'
import { getCurrentUserId } from '@/lib/oauth/token-storage'

const STORAGE_KEY = 'aura-creation-context'

const defaultPersonality = {
  warmth: 50,
  playfulness: 50,
  verbosity: 50,
  empathy: 50,
  creativity: 50,
  persona: 'balanced',
  tone: 'casual' as const,
  vocabulary: 'average' as const,
  quirks: []
}

const defaultConfiguration: AuraConfiguration = {
  name: '',
  vesselType: 'digital',
  personality: defaultPersonality,
  senses: [],
  rules: []
}

const defaultContext: CreationContext = {
  step: 'welcome',
  progress: 0,
  method: null,
  vessel: null,
  configuration: defaultConfiguration,
  sessionId: '',
  lastSaved: null,
  isDirty: false
}

const CreationContextContext = createContext<(CreationContext & CreationContextActions) | null>(null)

export function useCreationContext() {
  const context = useContext(CreationContextContext)
  if (!context) {
    throw new Error('useCreationContext must be used within a CreationContextProvider')
  }
  return context
}

export function useCreationContextProvider(options?: { restoreSession?: boolean }) {
  const router = useRouter()
  const [context, setContext] = useState<CreationContext>(() => {
    // Only restore from localStorage if explicitly requested
    if (options?.restoreSession && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          // Only restore if it's not a completed session
          if (parsed.step !== 'success') {
            return {
              ...defaultContext,
              ...parsed,
              lastSaved: parsed.lastSaved ? new Date(parsed.lastSaved) : null
            }
          }
        }
      } catch (error) {
        console.warn('Failed to restore creation context:', error)
      }
    }
    
    // Always start fresh by default
    return {
      ...defaultContext,
      sessionId: generateSessionId()
    }
  })

  // Auto-save to localStorage whenever context changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(context))
    }
  }, [context])

  const updateContext = useCallback((updates: Partial<CreationContext>) => {
    setContext(prev => ({
      ...prev,
      ...updates,
      isDirty: true
    }))
  }, [])

  const updateConfiguration = useCallback((updates: Partial<AuraConfiguration>) => {
    setContext(prev => ({
      ...prev,
      configuration: {
        ...prev.configuration,
        ...updates
      },
      isDirty: true
    }))
  }, [])

  const goToStep = useCallback((step: CreationStep) => {
    const stepOrder: CreationStep[] = ['welcome', 'method', 'vessel', 'config', 'review', 'success']
    const progress = (stepOrder.indexOf(step) / (stepOrder.length - 1)) * 100
    
    updateContext({ step, progress })
  }, [updateContext])

  const nextStep = useCallback(async () => {
    const stepOrder: CreationStep[] = ['welcome', 'method', 'vessel', 'config', 'review', 'success']
    const currentIndex = stepOrder.indexOf(context.step)
    
    if (currentIndex < stepOrder.length - 1) {
      const nextStepId = stepOrder[currentIndex + 1]
      
      if (nextStepId) {
        // Auto-save before moving to config step if we have enough data
        if (nextStepId === 'config' && context.configuration.name && context.vessel) {
          try {
            await saveProgress()
          } catch (error) {
            console.error('Failed to auto-save before config step:', error)
            // Continue anyway - user can save manually later
          }
        }
        
        goToStep(nextStepId)
      }
    }
  }, [context.step, context.configuration.name, context.vessel, goToStep])

  const prevStep = useCallback(() => {
    const stepOrder: CreationStep[] = ['welcome', 'method', 'vessel', 'config', 'review', 'success']
    const currentIndex = stepOrder.indexOf(context.step)
    
    if (currentIndex > 0) {
      const prevStepId = stepOrder[currentIndex - 1]
      if (prevStepId) {
        goToStep(prevStepId)
      }
    }
  }, [context.step, goToStep])

  const canGoNext = useCallback(() => {
    switch (context.step) {
      case 'welcome':
        return true
      case 'method':
        return context.method !== null
      case 'vessel':
        return context.vessel !== null
      case 'config':
        return context.configuration.name.trim().length > 0
      case 'review':
        return context.configuration.name.trim().length > 0
      case 'success':
        return false
      default:
        return false
    }
  }, [context.step, context.method, context.vessel, context.configuration.name])

  const canGoPrev = useCallback(() => {
    const stepOrder: CreationStep[] = ['welcome', 'method', 'vessel', 'config', 'review', 'success']
    return stepOrder.indexOf(context.step) > 0
  }, [context.step])

  const saveProgress = useCallback(async (): Promise<string | null> => {
    try {
      const userId = await getCurrentUserId()
      if (!userId) {
        throw new Error('User not authenticated')
      }

      const config = context.configuration
      if (!config.name.trim()) {
        throw new Error('Aura name is required')
      }

      // Prepare sense codes
      const senseCodes = config.senses.map(s => 
        s.includes('.') ? s.replace(/\./g, '_') : s
      )

      let response
      if (config.id) {
        // Update existing aura
        response = await auraApi.updateAura(config.id, {
          name: config.name,
          personality: config.personality,
          senses: senseCodes,
          rules: config.rules.filter(r => r.name && r.name.trim()),
          locationInfo: config.locationInfo,
          newsType: config.newsType
        })
      } else {
        // Create new aura
        response = await auraApi.createAura({
          userId,
          name: config.name,
          vesselType: config.vesselType,
          vesselCode: config.vesselCode || (config.vesselType === 'digital' ? 'digital-only' : ''),
          personality: config.personality,
          senses: senseCodes,
          rules: config.rules.filter(r => r.name && r.name.trim()),
          locationInfo: config.locationInfo,
          newsType: config.newsType
        })
      }

      if (!response.success) {
        throw new Error(response.error || 'Failed to save Aura')
      }

      const auraId = response.data?.auraId || response.data?.id || config.id
      
      // Update context with saved state
      updateContext({
        lastSaved: new Date(),
        isDirty: false
      })
      
      updateConfiguration({ id: auraId })

      return auraId
    } catch (error) {
      console.error('Failed to save progress:', error)
      throw error
    }
  }, [context.configuration, updateContext, updateConfiguration])

  const restoreSession = useCallback(async (sessionId: string) => {
    try {
      // In a real implementation, this would fetch from a backend
      // For now, we'll just try localStorage
      const saved = localStorage.getItem(`${STORAGE_KEY}-${sessionId}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        setContext({
          ...parsed,
          lastSaved: parsed.lastSaved ? new Date(parsed.lastSaved) : null
        })
      }
    } catch (error) {
      console.error('Failed to restore session:', error)
    }
  }, [])

  const clearSession = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
    setContext({
      ...defaultContext,
      sessionId: generateSessionId()
    })
  }, [])

  const resetWizard = useCallback(() => {
    clearSession()
  }, [clearSession])

  const completeWizard = useCallback(() => {
    // Clear the session when wizard is completed successfully
    clearSession()
  }, [clearSession])

  return {
    ...context,
    updateContext,
    updateConfiguration,
    goToStep,
    nextStep,
    prevStep,
    canGoNext: canGoNext(),
    canGoPrev: canGoPrev(),
    saveProgress,
    restoreSession,
    clearSession,
    resetWizard,
    completeWizard
  }
}

function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export { CreationContextContext }