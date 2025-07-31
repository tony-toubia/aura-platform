// apps/web/hooks/use-local-storage.ts
// Hook for managing localStorage with SSR safety

import { useState, useEffect, useCallback } from 'react'

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize from localStorage on mount (client-side only)
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        const parsed = JSON.parse(item)
        setStoredValue(parsed)
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
    } finally {
      setIsInitialized(true)
    }
  }, [key])

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value
        
        // Save state
        setStoredValue(valueToStore)
        
        // Save to local storage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key, storedValue]
  )

  // Function to remove the item from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  // Return the value from state if initialized, otherwise return initial value
  return [isInitialized ? storedValue : initialValue, setValue, removeValue]
}

// Hook for session storage
export function useSessionStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    try {
      const item = window.sessionStorage.getItem(key)
      if (item) {
        const parsed = JSON.parse(item)
        setStoredValue(parsed)
      }
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error)
    } finally {
      setIsInitialized(true)
    }
  }, [key])

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(key, JSON.stringify(valueToStore))
        }
      } catch (error) {
        console.warn(`Error setting sessionStorage key "${key}":`, error)
      }
    },
    [key, storedValue]
  )

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(key)
      }
    } catch (error) {
      console.warn(`Error removing sessionStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  return [isInitialized ? storedValue : initialValue, setValue, removeValue]
}

// Hook for managing user preferences
export function useUserPreferences<T extends Record<string, any>>(
  defaultPreferences: T
) {
  const [preferences, setPreferences, clearPreferences] = useLocalStorage(
    'user-preferences',
    defaultPreferences
  )

  const updatePreference = useCallback(
    <K extends keyof T>(key: K, value: T[K]) => {
      setPreferences(prev => ({
        ...prev,
        [key]: value
      }))
    },
    [setPreferences]
  )

  const resetPreferences = useCallback(() => {
    setPreferences(defaultPreferences)
  }, [setPreferences, defaultPreferences])

  return {
    preferences,
    updatePreference,
    resetPreferences,
    clearPreferences
  }
}