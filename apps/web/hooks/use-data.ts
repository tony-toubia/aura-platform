// apps/web/hooks/use-data.ts
// Common data fetching patterns and hooks

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAsync } from './use-async'
import type { ApiResponse } from '@/types/api'

// ============================================================================
// GENERIC DATA FETCHING HOOK
// ============================================================================

interface UseDataOptions<T> {
  immediate?: boolean
  dependencies?: any[]
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  transform?: (data: any) => T
}

export function useData<T = any>(
  fetcher: () => Promise<ApiResponse<T>>,
  options: UseDataOptions<T> = {}
) {
  const { 
    immediate = true, 
    dependencies = [], 
    onSuccess, 
    onError,
    transform 
  } = options

  const { data, isLoading, error, execute, reset } = useAsync(
    async () => {
      const response = await fetcher()
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch data')
      }
      return transform ? transform(response.data) : response.data
    },
    { immediate: false, onSuccess, onError }
  )

  // Execute when dependencies change
  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [immediate, execute, ...dependencies])

  const refetch = useCallback(() => {
    return execute()
  }, [execute])

  return {
    data,
    isLoading,
    error,
    refetch,
    reset,
  }
}

// ============================================================================
// PAGINATED DATA HOOK
// ============================================================================

interface UsePaginatedDataOptions<T> extends UseDataOptions<T> {
  pageSize?: number
  initialPage?: number
}

interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function usePaginatedData<T = any>(
  fetcher: (page: number, limit: number) => Promise<ApiResponse<PaginatedResponse<T[]>>>,
  options: UsePaginatedDataOptions<T[]> = {}
) {
  const { pageSize = 10, initialPage = 1, ...dataOptions } = options
  const [page, setPage] = useState(initialPage)
  const [allData, setAllData] = useState<T[]>([])

  const { data, isLoading, error, refetch } = useData(
    () => fetcher(page, pageSize),
    {
      immediate: dataOptions.immediate,
      onError: dataOptions.onError,
      dependencies: [page, pageSize],
      onSuccess: (response) => {
        const paginatedResponse = response as PaginatedResponse<T[]>
        if (page === 1) {
          setAllData(paginatedResponse.data as T[])
        } else {
          setAllData(prev => [...prev, ...(paginatedResponse.data as T[])])
        }
        if (dataOptions.onSuccess) {
          dataOptions.onSuccess(paginatedResponse.data as T[])
        }
      }
    }
  )

  const loadMore = useCallback(() => {
    if (data?.pagination && page < data.pagination.totalPages) {
      setPage(prev => prev + 1)
    }
  }, [data?.pagination, page])

  const refresh = useCallback(() => {
    setPage(1)
    setAllData([] as T[])
    return refetch()
  }, [refetch])

  const hasMore = data?.pagination ? page < data.pagination.totalPages : false

  return {
    data: allData,
    pagination: data?.pagination,
    isLoading,
    error,
    hasMore,
    loadMore,
    refresh,
    setPage,
  }
}

// ============================================================================
// CACHED DATA HOOK
// ============================================================================

interface UseCachedDataOptions<T> extends UseDataOptions<T> {
  cacheKey: string
  cacheTime?: number // in milliseconds
  staleTime?: number // in milliseconds
}

const cache = new Map<string, { data: any; timestamp: number }>()

export function useCachedData<T = any>(
  fetcher: () => Promise<ApiResponse<T>>,
  options: UseCachedDataOptions<T>
) {
  const { 
    cacheKey, 
    cacheTime = 5 * 60 * 1000, // 5 minutes
    staleTime = 1 * 60 * 1000,  // 1 minute
    ...dataOptions 
  } = options

  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async (force = false) => {
    const cached = cache.get(cacheKey)
    const now = Date.now()

    // Return cached data if it's still fresh and not forced
    if (!force && cached && (now - cached.timestamp) < cacheTime) {
      setData(cached.data)
      setError(null)
      return cached.data
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetcher()
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch data')
      }

      const transformedData = dataOptions.transform 
        ? dataOptions.transform(response.data) 
        : response.data

      // Cache the data
      cache.set(cacheKey, { data: transformedData, timestamp: now })
      setData(transformedData as T | null)
      if (transformedData !== undefined) {
        dataOptions.onSuccess?.(transformedData)
      }
      
      return transformedData
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      dataOptions.onError?.(err instanceof Error ? err : new Error(errorMessage))
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [cacheKey, cacheTime, fetcher, dataOptions])

  // Check if cached data is stale
  const isStale = useCallback(() => {
    const cached = cache.get(cacheKey)
    if (!cached) return true
    return (Date.now() - cached.timestamp) > staleTime
  }, [cacheKey, staleTime])

  // Initial fetch
  useEffect(() => {
    if (dataOptions.immediate !== false) {
      fetchData()
    }
  }, [fetchData, dataOptions.immediate, ...dataOptions.dependencies || []])

  const refetch = useCallback(() => fetchData(true), [fetchData])
  const invalidate = useCallback(() => {
    cache.delete(cacheKey)
    return fetchData(true)
  }, [cacheKey, fetchData])

  return {
    data,
    isLoading,
    error,
    isStale: isStale(),
    refetch,
    invalidate,
  }
}

// ============================================================================
// REAL-TIME DATA HOOK
// ============================================================================

interface UseRealTimeDataOptions<T> extends UseDataOptions<T> {
  interval?: number // polling interval in milliseconds
  enabled?: boolean
}

export function useRealTimeData<T = any>(
  fetcher: () => Promise<ApiResponse<T>>,
  options: UseRealTimeDataOptions<T> = {}
) {
  const { interval = 30000, enabled = true, ...dataOptions } = options
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const { data, isLoading, error, execute, reset } = useAsync(
    async () => {
      const response = await fetcher()
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch data')
      }
      return dataOptions.transform ? dataOptions.transform(response.data) : response.data
    },
    { immediate: false, onSuccess: dataOptions.onSuccess, onError: dataOptions.onError }
  )

  // Start/stop polling based on enabled state
  useEffect(() => {
    if (enabled) {
      // Initial fetch
      execute()
      
      // Set up polling
      intervalRef.current = setInterval(() => {
        execute()
      }, interval)
    } else {
      // Clear polling
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled, interval, execute])

  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }, [])

  const resume = useCallback(() => {
    if (enabled && !intervalRef.current) {
      intervalRef.current = setInterval(() => {
        execute()
      }, interval)
    }
  }, [enabled, interval, execute])

  return {
    data,
    isLoading,
    error,
    refetch: execute,
    reset,
    pause,
    resume,
  }
}