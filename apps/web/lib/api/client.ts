// apps/web/lib/api/client.ts
// Centralized API client with common patterns and error handling

import type { ApiResponse, ApiError } from '@/types/api'

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP ${response.status}`)
      }

      return data
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error)
      
      if (error instanceof Error) {
        return {
          success: false,
          error: error.message,
        }
      }
      
      return {
        success: false,
        error: 'An unexpected error occurred',
      }
    }
  }

  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const timestamp = new Date().toISOString()
    console.log(`[${timestamp}] ApiClient.post called - endpoint: ${endpoint}`)
    
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

// Create singleton instance
export const apiClient = new ApiClient()

// Specific API methods
export const auraApi = {
  // Aura operations
  getAuras: () => apiClient.get('/auras'),
  getAura: (id: string) => apiClient.get(`/auras/${id}`),
  createAura: (data: any) => {
    const timestamp = new Date().toISOString()
    console.log(`[${timestamp}] auraApi.createAura called with data:`, data)
    return apiClient.post('/auras', data)
  },
  updateAura: (id: string, data: any) => apiClient.put(`/auras/${id}`, data),
  deleteAura: (id: string) => apiClient.delete(`/auras/${id}`),
  
  // Chat operations
  sendMessage: (data: any) => apiClient.post('/aura/chat', data),
  
  // Rule operations
  getRules: (auraId: string) => apiClient.get(`/behavior-rules?auraId=${auraId}`),
  createRule: (data: any) => apiClient.post('/behavior-rules', data),
  updateRule: (id: string, data: any) => apiClient.put(`/behavior-rules/${id}`, data),
  deleteRule: (id: string) => apiClient.delete(`/behavior-rules/${id}`),
  
  // Preview operations
  previewPersonality: (data: any) => apiClient.post('/personality/preview', data),
  previewRule: (data: any) => apiClient.post('/rule/preview', data),
}

export const subscriptionApi = {
  createCheckoutSession: (data: any) => apiClient.post('/subscription/checkout', data),
  createPortalSession: () => apiClient.post('/subscription/portal'),
}

export const wildlifeApi = {
  getTracks: (params?: any) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : ''
    return apiClient.get(`/wildlife/tracks${query}`)
  },
  getAllIndividuals: () => apiClient.get('/wildlife/all-individuals'),
}

// Error handling utilities
export function isApiError(response: ApiResponse): response is ApiResponse & { success: false } {
  return !response.success
}

export function getErrorMessage(response: ApiResponse, fallback = 'An error occurred'): string {
  if (isApiError(response)) {
    return response.error || fallback
  }
  return fallback
}

// Response validation utilities
export function validateApiResponse<T>(
  response: ApiResponse<T>,
  validator?: (data: any) => boolean
): T {
  if (isApiError(response)) {
    throw new Error(response.error || 'API request failed')
  }
  
  if (validator && response.data && !validator(response.data)) {
    throw new Error('Invalid response data format')
  }
  
  return response.data as T
}