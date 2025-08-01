// apps/web/hooks/use-async.ts
// Common async state management hook

import { useState, useCallback, useRef, useEffect } from 'react'

interface AsyncState<T> {
  data: T | null
  isLoading: boolean
  error: string | null
}

interface UseAsyncOptions {
  immediate?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}

export function useAsync<T = any>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: UseAsyncOptions = {}
) {
  const { immediate = false, onSuccess, onError } = options
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    isLoading: false,
    error: null,
  })

  const mountedRef = useRef(true)
  const lastCallIdRef = useRef(0)

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  const execute = useCallback(
    async (...args: any[]) => {
      const callId = ++lastCallIdRef.current

      setState(prev => ({ ...prev, isLoading: true, error: null }))

      try {
        const data = await asyncFunction(...args)
        
        if (mountedRef.current && callId === lastCallIdRef.current) {
          setState({ data, isLoading: false, error: null })
          onSuccess?.(data)
        }
        
        return data
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred'
        
        if (mountedRef.current && callId === lastCallIdRef.current) {
          setState({ data: null, isLoading: false, error: errorMessage })
          onError?.(error instanceof Error ? error : new Error(errorMessage))
        }
        
        throw error
      }
    },
    [asyncFunction, onSuccess, onError]
  )

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null })
  }, [])

  // Execute immediately if requested
  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [immediate, execute])

  return {
    ...state,
    execute,
    reset,
  }
}

// Hook for API calls with common patterns
export function useApiCall<T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseAsyncOptions & {
    successMessage?: string
    errorMessage?: string
  } = {}
) {
  const { successMessage, errorMessage, ...asyncOptions } = options

  return useAsync(apiFunction, {
    ...asyncOptions,
    onSuccess: (data) => {
      if (successMessage) {
        // You can integrate with your toast/notification system here
        console.log(successMessage)
      }
      options.onSuccess?.(data)
    },
    onError: (error) => {
      if (errorMessage) {
        console.error(errorMessage, error)
      }
      options.onError?.(error)
    },
  })
}

// Hook for form submissions
export function useFormSubmit<T = any>(
  submitFunction: (data: any) => Promise<T>,
  options: {
    onSuccess?: (data: T) => void
    onError?: (error: Error) => void
    resetOnSuccess?: boolean
  } = {}
) {
  const { onSuccess, onError, resetOnSuccess = false } = options
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isSubmittingRef = useRef(false)

  const submit = useCallback(
    async (formData: any) => {
      const timestamp = new Date().toISOString()
      console.log(`[${timestamp}] useFormSubmit.submit called`, { isSubmitting: isSubmittingRef.current })
      
      if (isSubmittingRef.current) {
        console.log(`[${timestamp}] Already submitting, ignoring duplicate call`)
        return
      }
      
      isSubmittingRef.current = true
      setIsSubmitting(true)
      setError(null)

      try {
        console.log(`[${timestamp}] Calling submitFunction with data:`, formData)
        const result = await submitFunction(formData)
        onSuccess?.(result)
        
        if (resetOnSuccess) {
          setError(null)
        }
        
        return result
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Submission failed'
        setError(errorMessage)
        onError?.(err instanceof Error ? err : new Error(errorMessage))
        throw err
      } finally {
        isSubmittingRef.current = false
        setIsSubmitting(false)
      }
    },
    [submitFunction, onSuccess, onError, resetOnSuccess]
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    submit,
    isSubmitting,
    error,
    clearError,
  }
}