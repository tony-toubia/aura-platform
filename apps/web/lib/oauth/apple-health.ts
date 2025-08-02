// lib/oauth/apple-health.ts
"use client"

export interface AppleHealthConfig {
  clientId: string
  redirectUri: string
  scopes: string[]
}

export interface AppleHealthTokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  token_type: string
  scope: string
}

export interface AppleHealthData {
  id: string
  type: string
  value: number
  unit: string
  startDate: string
  endDate: string
  sourceName: string
  sourceVersion?: string
  device?: {
    name: string
    manufacturer: string
    model: string
    hardwareVersion?: string
    softwareVersion?: string
  }
}

export interface AppleHealthWorkout {
  id: string
  workoutActivityType: string
  duration: number
  totalEnergyBurned?: number
  totalDistance?: number
  startDate: string
  endDate: string
  sourceName: string
  metadata?: Record<string, any>
}

export class AppleHealthOAuth {
  private config: AppleHealthConfig

  constructor(config: AppleHealthConfig) {
    this.config = config
  }

  /**
   * Generate the OAuth authorization URL for Apple Health
   * Note: Apple Health uses HealthKit which requires native iOS integration
   * For web applications, we'll simulate the OAuth flow for demonstration
   */
  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: 'code',
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(' '),
      response_mode: 'query',
      prompt: 'consent',
    })

    // Note: Apple Health doesn't have a direct web OAuth endpoint
    // This would typically require iOS app integration with HealthKit
    return `https://appleid.apple.com/auth/authorize?${params.toString()}`
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<AppleHealthTokenResponse> {
    const response = await fetch('/api/auth/apple-health/exchange', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        redirect_uri: this.config.redirectUri,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to exchange code for token')
    }

    return response.json()
  }

  /**
   * Initiate OAuth flow in a popup window
   */
  async initiateOAuth(): Promise<AppleHealthTokenResponse> {
    return new Promise((resolve, reject) => {
      const authUrl = this.getAuthUrl()
      const popup = window.open(
        authUrl,
        'apple-health-oauth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      )

      if (!popup) {
        reject(new Error('Failed to open popup window'))
        return
      }

      // Check if popup was closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed)
          reject(new Error('OAuth cancelled by user'))
        }
      }, 1000)

      // Listen for OAuth callback
      const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return

        if (event.data.type === 'APPLE_HEALTH_OAUTH_SUCCESS' && event.data.code) {
          clearInterval(checkClosed)
          popup.close()
          window.removeEventListener('message', handleMessage)

          try {
            const tokenResponse = await this.exchangeCodeForToken(event.data.code)
            resolve(tokenResponse)
          } catch (error) {
            reject(error)
          }
        } else if (event.data.type === 'APPLE_HEALTH_OAUTH_ERROR') {
          clearInterval(checkClosed)
          popup.close()
          window.removeEventListener('message', handleMessage)
          reject(new Error(event.data.error || 'OAuth failed'))
        }
      }

      window.addEventListener('message', handleMessage)
    })
  }

  /**
   * Fetch user's health data (requires valid access token)
   */
  async getHealthData(
    accessToken: string,
    dataTypes: string[] = ['steps', 'heart_rate', 'active_energy'],
    startDate?: string,
    endDate?: string,
    limit: number = 100
  ): Promise<AppleHealthData[]> {
    const params = new URLSearchParams({
      data_types: dataTypes.join(','),
      start_date: startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: endDate || new Date().toISOString(),
      limit: limit.toString(),
    })

    const response = await fetch(
      `https://api.apple-health.com/v1/health-data?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch health data')
    }

    const data = await response.json()
    return data.data || []
  }

  /**
   * Fetch user's workout data
   */
  async getWorkouts(
    accessToken: string,
    startDate?: string,
    endDate?: string,
    limit: number = 50
  ): Promise<AppleHealthWorkout[]> {
    const params = new URLSearchParams({
      start_date: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: endDate || new Date().toISOString(),
      limit: limit.toString(),
    })

    const response = await fetch(
      `https://api.apple-health.com/v1/workouts?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch workout data')
    }

    const data = await response.json()
    return data.workouts || []
  }

  /**
   * Get user's health profile information
   */
  async getUserProfile(accessToken: string) {
    const response = await fetch('https://api.apple-health.com/v1/user/profile', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch user profile')
    }

    return response.json()
  }

  /**
   * Get available health data types
   */
  async getAvailableDataTypes(accessToken: string) {
    const response = await fetch('https://api.apple-health.com/v1/data-types', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch available data types')
    }

    return response.json()
  }
}