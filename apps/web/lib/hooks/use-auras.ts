// apps/web/lib/hooks/use-auras.ts

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Aura } from '@/types'

interface UseAurasOptions {
  initialAuras?: Aura[]
  autoRefresh?: boolean
}

interface UseAurasReturn {
  auras: Aura[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  updateAura: (auraId: string, updates: Partial<Aura>) => void
  removeAura: (auraId: string) => void
  addAura: (aura: Aura) => void
}

// Global cache for auras data
let aurasCache: Aura[] | null = null
let cacheTimestamp: number | null = null
const CACHE_DURATION = 5000 // 5 seconds

// Event emitter for cross-component communication
class AurasEventEmitter extends EventTarget {
  emitRefresh() {
    this.dispatchEvent(new Event('refresh'))
  }
  
  emitUpdate(auraId: string, updates: Partial<Aura>) {
    this.dispatchEvent(new CustomEvent('update', { detail: { auraId, updates } }))
  }
  
  emitRemove(auraId: string) {
    this.dispatchEvent(new CustomEvent('remove', { detail: { auraId } }))
  }
  
  emitAdd(aura: Aura) {
    this.dispatchEvent(new CustomEvent('add', { detail: { aura } }))
  }
}

const aurasEvents = new AurasEventEmitter()

export function useAuras({ initialAuras = [], autoRefresh = true }: UseAurasOptions = {}): UseAurasReturn {
  const router = useRouter()
  const [auras, setAuras] = useState<Aura[]>(initialAuras)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch auras from API
  const fetchAuras = useCallback(async (force = false) => {
    // Check cache first
    if (!force && aurasCache && cacheTimestamp && Date.now() - cacheTimestamp < CACHE_DURATION) {
      setAuras(aurasCache)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/auras', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch auras')
      }
      
      const data = await response.json()
      
      // Update cache
      aurasCache = data
      cacheTimestamp = Date.now()
      
      setAuras(data)
    } catch (err) {
      console.error('Error fetching auras:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch auras')
    } finally {
      setLoading(false)
    }
  }, [])

  // Refresh function that forces a new fetch
  const refresh = useCallback(async () => {
    await fetchAuras(true)
    // Also refresh the Next.js router cache
    router.refresh()
  }, [fetchAuras, router])

  // Update a specific aura
  const updateAura = useCallback((auraId: string, updates: Partial<Aura>) => {
    setAuras(prev => prev.map(a => a.id === auraId ? { ...a, ...updates } : a))
    
    // Update cache
    if (aurasCache) {
      aurasCache = aurasCache.map(a => a.id === auraId ? { ...a, ...updates } : a)
    }
    
    // Emit event for other components
    aurasEvents.emitUpdate(auraId, updates)
  }, [])

  // Remove an aura
  const removeAura = useCallback((auraId: string) => {
    setAuras(prev => prev.filter(a => a.id !== auraId))
    
    // Update cache
    if (aurasCache) {
      aurasCache = aurasCache.filter(a => a.id !== auraId)
    }
    
    // Emit event for other components
    aurasEvents.emitRemove(auraId)
  }, [])

  // Add a new aura
  const addAura = useCallback((aura: Aura) => {
    setAuras(prev => [...prev, aura])
    
    // Update cache
    if (aurasCache) {
      aurasCache = [...aurasCache, aura]
    }
    
    // Emit event for other components
    aurasEvents.emitAdd(aura)
  }, [])

  // Listen for events from other components
  useEffect(() => {
    const handleRefresh = () => {
      fetchAuras(true)
    }
    
    const handleUpdate = (event: Event) => {
      const { auraId, updates } = (event as CustomEvent).detail
      setAuras(prev => prev.map(a => a.id === auraId ? { ...a, ...updates } : a))
    }
    
    const handleRemove = (event: Event) => {
      const { auraId } = (event as CustomEvent).detail
      setAuras(prev => prev.filter(a => a.id !== auraId))
    }
    
    const handleAdd = (event: Event) => {
      const { aura } = (event as CustomEvent).detail
      setAuras(prev => [...prev, aura])
    }
    
    aurasEvents.addEventListener('refresh', handleRefresh)
    aurasEvents.addEventListener('update', handleUpdate)
    aurasEvents.addEventListener('remove', handleRemove)
    aurasEvents.addEventListener('add', handleAdd)
    
    return () => {
      aurasEvents.removeEventListener('refresh', handleRefresh)
      aurasEvents.removeEventListener('update', handleUpdate)
      aurasEvents.removeEventListener('remove', handleRemove)
      aurasEvents.removeEventListener('add', handleAdd)
    }
  }, [fetchAuras])

  // Auto-refresh on mount if enabled and no initial data
  useEffect(() => {
    if (autoRefresh && initialAuras.length === 0) {
      fetchAuras()
    }
  }, [autoRefresh, initialAuras.length, fetchAuras])

  // Check for URL parameters that indicate a refresh is needed
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('refresh') === 'true' || params.get('created') === 'true') {
      // Remove the parameter and refresh
      params.delete('refresh')
      params.delete('created')
      const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`
      window.history.replaceState({}, '', newUrl)
      
      // Force refresh
      refresh()
    }
  }, [refresh])

  return {
    auras,
    loading,
    error,
    refresh,
    updateAura,
    removeAura,
    addAura
  }
}

// Export the event emitter for use in other components
export const refreshAuras = () => {
  // Clear cache to force refresh
  aurasCache = null
  cacheTimestamp = null
  aurasEvents.emitRefresh()
}

export const invalidateAurasCache = () => {
  aurasCache = null
  cacheTimestamp = null
}