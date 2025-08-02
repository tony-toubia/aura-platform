// lib/oauth/fitbit.ts
"use client"

export interface FitbitConfig {
  clientId: string
  redirectUri: string
  scopes: string[]
}

export interface FitbitTokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  scope: string
  user_id: string
}

export interface FitbitUser {
  encodedId: string
  displayName: string
  fullName: string
  nickname: string
  avatar: string
  avatar150: string
  avatar640: string
  city: string
  state: string
  country: string
  dateOfBirth: string
  gender: string
  height: number
  weight: number
  timezone: string
  memberSince: string
}

export interface FitbitActivity {
  date: string
  steps: number
  distance: number
  floors: number
  elevation: number
  minutesSedentary: number
  minutesLightlyActive: number
  minutesFairlyActive: number
  minutesVeryActive: number
  activityCalories: number
  caloriesOut: number
  marginalCalories: number
  caloriesBMR: number
}

export interface FitbitSleep {
  dateOfSleep: string
  duration: number
  efficiency: number
  endTime: string
  infoCode: number
  isMainSleep: boolean
  logId: number
  minutesAfterWakeup: number
  minutesAsleep: number
  minutesAwake: number
  minutesToFallAsleep: number
  startTime: string
  timeInBed: number
  type: string
  levels: {
    summary: {
      deep: { count: number; minutes: number }
      light: { count: number; minutes: number }
      rem: { count: number; minutes: number }
      wake: { count: number; minutes: number }
    }
    data: Array<{
      dateTime: string
      level: string
      seconds: number
    }>
  }
}

export interface FitbitHeartRate {
  date: string
  value: {
    customHeartRateZones: any[]
    heartRateZones: Array<{
      caloriesOut: number
      max: number
      min: number
      minutes: number
      name: string
    }>
    restingHeartRate: number
  }
}

export class FitbitOAuth {
  private config: FitbitConfig

  constructor(config: FitbitConfig) {
    this.config = config
  }

  /**
   * Generate the OAuth authorization URL for Fitbit
   */
  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: 'code',
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(' '),
      expires_in: '31536000', // 1 year
      prompt: 'consent',
    })

    return `https://www.fitbit.com/oauth2/authorize?${params.toString()}`
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<FitbitTokenResponse> {
    const response = await fetch('/api/auth/fitbit/exchange', {
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
  async initiateOAuth(): Promise<FitbitTokenResponse> {
    return new Promise((resolve, reject) => {
      const authUrl = this.getAuthUrl()
      const popup = window.open(
        authUrl,
        'fitbit-oauth',
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

        if (event.data.type === 'FITBIT_OAUTH_SUCCESS' && event.data.code) {
          clearInterval(checkClosed)
          popup.close()
          window.removeEventListener('message', handleMessage)

          try {
            const tokenResponse = await this.exchangeCodeForToken(event.data.code)
            resolve(tokenResponse)
          } catch (error) {
            reject(error)
          }
        } else if (event.data.type === 'FITBIT_OAUTH_ERROR') {
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
   * Get user profile information
   */
  async getUserProfile(accessToken: string): Promise<FitbitUser> {
    const response = await fetch('https://api.fitbit.com/1/user/-/profile.json', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch user profile')
    }

    const data = await response.json()
    return data.user
  }

  /**
   * Get daily activity summary
   */
  async getDailyActivity(
    accessToken: string,
    date: string = 'today'
  ): Promise<FitbitActivity> {
    const response = await fetch(
      `https://api.fitbit.com/1/user/-/activities/date/${date}.json`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch daily activity')
    }

    const data = await response.json()
    return data.summary
  }

  /**
   * Get activity time series data
   */
  async getActivityTimeSeries(
    accessToken: string,
    resource: string,
    baseDate: string = 'today',
    period: string = '7d'
  ): Promise<any[]> {
    const response = await fetch(
      `https://api.fitbit.com/1/user/-/activities/${resource}/date/${baseDate}/${period}.json`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch activity time series')
    }

    const data = await response.json()
    return data[`activities-${resource}`] || []
  }

  /**
   * Get steps data
   */
  async getSteps(
    accessToken: string,
    baseDate: string = 'today',
    period: string = '7d'
  ): Promise<any[]> {
    return this.getActivityTimeSeries(accessToken, 'steps', baseDate, period)
  }

  /**
   * Get distance data
   */
  async getDistance(
    accessToken: string,
    baseDate: string = 'today',
    period: string = '7d'
  ): Promise<any[]> {
    return this.getActivityTimeSeries(accessToken, 'distance', baseDate, period)
  }

  /**
   * Get calories burned data
   */
  async getCalories(
    accessToken: string,
    baseDate: string = 'today',
    period: string = '7d'
  ): Promise<any[]> {
    return this.getActivityTimeSeries(accessToken, 'calories', baseDate, period)
  }

  /**
   * Get sleep data
   */
  async getSleep(
    accessToken: string,
    date: string = 'today'
  ): Promise<FitbitSleep[]> {
    const response = await fetch(
      `https://api.fitbit.com/1.2/user/-/sleep/date/${date}.json`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch sleep data')
    }

    const data = await response.json()
    return data.sleep || []
  }

  /**
   * Get heart rate data
   */
  async getHeartRate(
    accessToken: string,
    date: string = 'today'
  ): Promise<FitbitHeartRate> {
    const response = await fetch(
      `https://api.fitbit.com/1/user/-/activities/heart/date/${date}/1d.json`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch heart rate data')
    }

    const data = await response.json()
    return data['activities-heart'][0] || null
  }

  /**
   * Get intraday heart rate data
   */
  async getIntradayHeartRate(
    accessToken: string,
    date: string = 'today',
    detailLevel: string = '1min'
  ): Promise<any> {
    const response = await fetch(
      `https://api.fitbit.com/1/user/-/activities/heart/date/${date}/1d/${detailLevel}.json`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch intraday heart rate data')
    }

    return response.json()
  }

  /**
   * Get body weight data
   */
  async getWeight(
    accessToken: string,
    baseDate: string = 'today',
    period: string = '30d'
  ): Promise<any[]> {
    const response = await fetch(
      `https://api.fitbit.com/1/user/-/body/log/weight/date/${baseDate}/${period}.json`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch weight data')
    }

    const data = await response.json()
    return data.weight || []
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<FitbitTokenResponse> {
    const response = await fetch('/api/auth/fitbit/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to refresh token')
    }

    return response.json()
  }
}