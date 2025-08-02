// lib/oauth/google-fit.ts
"use client"

export interface GoogleFitConfig {
  clientId: string
  redirectUri: string
  scopes: string[]
}

export interface GoogleFitTokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  token_type: string
  scope: string
}

export interface GoogleFitDataPoint {
  dataTypeName: string
  startTimeNanos: string
  endTimeNanos: string
  value: Array<{
    intVal?: number
    fpVal?: number
    stringVal?: string
    mapVal?: Array<{
      key: string
      value: {
        intVal?: number
        fpVal?: number
        stringVal?: string
      }
    }>
  }>
  originDataSourceId: string
  modifiedTimeMillis: string
}

export interface GoogleFitSession {
  id: string
  name: string
  description?: string
  startTimeMillis: string
  endTimeMillis: string
  modifiedTimeMillis: string
  activityType: number
  application?: {
    packageName: string
    version?: string
    detailsUrl?: string
    name?: string
  }
}

export interface GoogleFitDataSource {
  dataStreamId: string
  dataStreamName: string
  type: string
  dataType: {
    name: string
    field: Array<{
      name: string
      format: string
      optional?: boolean
    }>
  }
  application?: {
    packageName: string
    version?: string
    name?: string
  }
  device?: {
    uid: string
    type: string
    version: string
    model: string
    manufacturer: string
  }
}

export class GoogleFitOAuth {
  private config: GoogleFitConfig

  constructor(config: GoogleFitConfig) {
    this.config = config
  }

  /**
   * Generate the OAuth authorization URL for Google Fit
   */
  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: this.config.scopes.join(' '),
      access_type: 'offline', // Important for refresh tokens
      prompt: 'consent', // Force consent screen to get refresh token
      include_granted_scopes: 'true',
    })

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
    console.log('🔗 Generated OAuth URL:', authUrl)
    console.log('📋 OAuth config:', {
      clientId: this.config.clientId.substring(0, 20) + '...',
      redirectUri: this.config.redirectUri,
      scopes: this.config.scopes
    })
    
    return authUrl
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<GoogleFitTokenResponse> {
    const response = await fetch('/api/auth/google-fit/exchange', {
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
      let errorMessage = 'Failed to exchange code for token'
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorData.details || errorMessage
        console.error('Google Fit token exchange failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        })
      } catch (parseError) {
        console.error('Failed to parse error response:', parseError)
      }
      throw new Error(errorMessage)
    }

    return response.json()
  }

  /**
   * Initiate OAuth flow in a popup window
   */
  async initiateOAuth(): Promise<GoogleFitTokenResponse> {
    return new Promise((resolve, reject) => {
      const authUrl = this.getAuthUrl()
      console.log('🔗 Opening OAuth popup with URL:', authUrl)
      
      const popup = window.open(
        authUrl,
        'google-fit-oauth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      )

      if (!popup) {
        console.error('❌ Failed to open popup window - likely blocked by browser')
        reject(new Error('Failed to open popup window - please allow popups for this site'))
        return
      }
      
      console.log('✅ OAuth popup opened successfully')

      // Check if popup was closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed)
          console.log('❌ OAuth popup was closed by user')
          reject(new Error('OAuth cancelled by user'))
        }
      }, 1000)

      // Listen for OAuth callback
      const handleMessage = async (event: MessageEvent) => {
        console.log('📨 Received message from popup:', event.data)
        
        if (event.origin !== window.location.origin) {
          console.log('❌ Message origin mismatch:', event.origin, 'vs', window.location.origin)
          return
        }

        if (event.data.type === 'GOOGLE_FIT_OAUTH_SUCCESS' && event.data.code) {
          console.log('✅ OAuth success message received with code')
          clearInterval(checkClosed)
          popup.close()
          window.removeEventListener('message', handleMessage)

          try {
            console.log('🔄 Exchanging code for token...')
            const tokenResponse = await this.exchangeCodeForToken(event.data.code)
            console.log('✅ Token exchange successful')
            resolve(tokenResponse)
          } catch (error) {
            console.error('❌ Token exchange failed:', error)
            reject(error)
          }
        } else if (event.data.type === 'GOOGLE_FIT_OAUTH_ERROR') {
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
   * Fetch user's fitness data from Google Fit
   */
  async getFitnessData(
    accessToken: string,
    dataSourceId: string,
    startTimeMillis: number,
    endTimeMillis: number
  ): Promise<GoogleFitDataPoint[]> {
    const requestBody = {
      aggregateBy: [{
        dataTypeName: dataSourceId,
        dataSourceId: dataSourceId
      }],
      bucketByTime: { durationMillis: 86400000 }, // 1 day buckets
      startTimeMillis: startTimeMillis.toString(),
      endTimeMillis: endTimeMillis.toString()
    }

    const response = await fetch(
      'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch fitness data')
    }

    const data = await response.json()
    return data.bucket?.flatMap((bucket: any) => 
      bucket.dataset?.flatMap((dataset: any) => dataset.point || [])
    ) || []
  }

  /**
   * Get step count data
   */
  async getStepCount(
    accessToken: string,
    startTimeMillis: number,
    endTimeMillis: number
  ): Promise<GoogleFitDataPoint[]> {
    return this.getFitnessData(
      accessToken,
      'com.google.step_count.delta',
      startTimeMillis,
      endTimeMillis
    )
  }

  /**
   * Get calories burned data
   */
  async getCaloriesBurned(
    accessToken: string,
    startTimeMillis: number,
    endTimeMillis: number
  ): Promise<GoogleFitDataPoint[]> {
    return this.getFitnessData(
      accessToken,
      'com.google.calories.expended',
      startTimeMillis,
      endTimeMillis
    )
  }

  /**
   * Get heart rate data
   */
  async getHeartRate(
    accessToken: string,
    startTimeMillis: number,
    endTimeMillis: number
  ): Promise<GoogleFitDataPoint[]> {
    return this.getFitnessData(
      accessToken,
      'com.google.heart_rate.bpm',
      startTimeMillis,
      endTimeMillis
    )
  }

  /**
   * Get distance data
   */
  async getDistance(
    accessToken: string,
    startTimeMillis: number,
    endTimeMillis: number
  ): Promise<GoogleFitDataPoint[]> {
    return this.getFitnessData(
      accessToken,
      'com.google.distance.delta',
      startTimeMillis,
      endTimeMillis
    )
  }

  /**
   * Get workout sessions
   */
  async getSessions(
    accessToken: string,
    startTimeMillis: number,
    endTimeMillis: number
  ): Promise<GoogleFitSession[]> {
    const params = new URLSearchParams({
      startTime: new Date(startTimeMillis).toISOString(),
      endTime: new Date(endTimeMillis).toISOString(),
    })

    const response = await fetch(
      `https://www.googleapis.com/fitness/v1/users/me/sessions?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch sessions')
    }

    const data = await response.json()
    return data.session || []
  }

  /**
   * Get available data sources
   */
  async getDataSources(accessToken: string): Promise<GoogleFitDataSource[]> {
    const response = await fetch(
      'https://www.googleapis.com/fitness/v1/users/me/dataSources',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch data sources')
    }

    const data = await response.json()
    return data.dataSource || []
  }

  /**
   * Get user's fitness profile
   */
  async getUserProfile(accessToken: string) {
    const response = await fetch(
      'https://www.googleapis.com/fitness/v1/users/me',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch user profile')
    }

    return response.json()
  }
}