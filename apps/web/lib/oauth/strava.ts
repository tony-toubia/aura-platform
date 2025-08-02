// lib/oauth/strava.ts
"use client"

export interface StravaConfig {
  clientId: string
  redirectUri: string
  scopes: string[]
}

export interface StravaTokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  expires_at: number
  token_type: string
  athlete: StravaAthlete
}

export interface StravaAthlete {
  id: number
  username: string
  resource_state: number
  firstname: string
  lastname: string
  bio: string
  city: string
  state: string
  country: string
  sex: string
  premium: boolean
  summit: boolean
  created_at: string
  updated_at: string
  badge_type_id: number
  weight: number
  profile_medium: string
  profile: string
  friend: string | null
  follower: string | null
}

export interface StravaActivity {
  id: number
  resource_state: number
  external_id: string
  upload_id: number
  athlete: {
    id: number
    resource_state: number
  }
  name: string
  distance: number
  moving_time: number
  elapsed_time: number
  total_elevation_gain: number
  type: string
  sport_type: string
  workout_type: number | null
  start_date: string
  start_date_local: string
  timezone: string
  utc_offset: number
  location_city: string | null
  location_state: string | null
  location_country: string
  achievement_count: number
  kudos_count: number
  comment_count: number
  athlete_count: number
  photo_count: number
  map: {
    id: string
    summary_polyline: string
    resource_state: number
  }
  trainer: boolean
  commute: boolean
  manual: boolean
  private: boolean
  visibility: string
  flagged: boolean
  gear_id: string | null
  start_latlng: [number, number] | null
  end_latlng: [number, number] | null
  average_speed: number
  max_speed: number
  average_cadence: number
  average_watts: number
  weighted_average_watts: number
  kilojoules: number
  device_watts: boolean
  has_heartrate: boolean
  average_heartrate: number
  max_heartrate: number
  heartrate_opt_out: boolean
  display_hide_heartrate_option: boolean
  elev_high: number
  elev_low: number
  upload_id_str: string
  pr_count: number
  total_photo_count: number
  has_kudoed: boolean
}

export interface StravaStats {
  biggest_ride_distance: number
  biggest_climb_elevation_gain: number
  recent_ride_totals: {
    count: number
    distance: number
    moving_time: number
    elapsed_time: number
    elevation_gain: number
    achievement_count: number
  }
  recent_run_totals: {
    count: number
    distance: number
    moving_time: number
    elapsed_time: number
    elevation_gain: number
    achievement_count: number
  }
  recent_swim_totals: {
    count: number
    distance: number
    moving_time: number
    elapsed_time: number
    elevation_gain: number
    achievement_count: number
  }
  ytd_ride_totals: {
    count: number
    distance: number
    moving_time: number
    elapsed_time: number
    elevation_gain: number
  }
  ytd_run_totals: {
    count: number
    distance: number
    moving_time: number
    elapsed_time: number
    elevation_gain: number
  }
  ytd_swim_totals: {
    count: number
    distance: number
    moving_time: number
    elapsed_time: number
    elevation_gain: number
  }
  all_ride_totals: {
    count: number
    distance: number
    moving_time: number
    elapsed_time: number
    elevation_gain: number
  }
  all_run_totals: {
    count: number
    distance: number
    moving_time: number
    elapsed_time: number
    elevation_gain: number
  }
  all_swim_totals: {
    count: number
    distance: number
    moving_time: number
    elapsed_time: number
    elevation_gain: number
  }
}

export class StravaOAuth {
  private config: StravaConfig

  constructor(config: StravaConfig) {
    this.config = config
  }

  /**
   * Generate the OAuth authorization URL for Strava
   */
  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: 'code',
      redirect_uri: this.config.redirectUri,
      approval_prompt: 'force',
      scope: this.config.scopes.join(','),
    })

    return `https://www.strava.com/oauth/authorize?${params.toString()}`
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<StravaTokenResponse> {
    const response = await fetch('/api/auth/strava/exchange', {
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
  async initiateOAuth(): Promise<StravaTokenResponse> {
    return new Promise((resolve, reject) => {
      const authUrl = this.getAuthUrl()
      const popup = window.open(
        authUrl,
        'strava-oauth',
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

        if (event.data.type === 'STRAVA_OAUTH_SUCCESS' && event.data.code) {
          clearInterval(checkClosed)
          popup.close()
          window.removeEventListener('message', handleMessage)

          try {
            const tokenResponse = await this.exchangeCodeForToken(event.data.code)
            resolve(tokenResponse)
          } catch (error) {
            reject(error)
          }
        } else if (event.data.type === 'STRAVA_OAUTH_ERROR') {
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
   * Get authenticated athlete's profile
   */
  async getAthlete(accessToken: string): Promise<StravaAthlete> {
    const response = await fetch('https://www.strava.com/api/v3/athlete', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch athlete profile')
    }

    return response.json()
  }

  /**
   * Get athlete's activities
   */
  async getActivities(
    accessToken: string,
    before?: number,
    after?: number,
    page: number = 1,
    perPage: number = 30
  ): Promise<StravaActivity[]> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    })

    if (before) params.append('before', before.toString())
    if (after) params.append('after', after.toString())

    const response = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch activities')
    }

    return response.json()
  }

  /**
   * Get detailed activity by ID
   */
  async getActivity(
    accessToken: string,
    activityId: number,
    includeAllEfforts: boolean = false
  ): Promise<StravaActivity> {
    const params = new URLSearchParams()
    if (includeAllEfforts) {
      params.append('include_all_efforts', 'true')
    }

    const response = await fetch(
      `https://www.strava.com/api/v3/activities/${activityId}?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch activity details')
    }

    return response.json()
  }

  /**
   * Get athlete's statistics
   */
  async getAthleteStats(
    accessToken: string,
    athleteId: number
  ): Promise<StravaStats> {
    const response = await fetch(
      `https://www.strava.com/api/v3/athletes/${athleteId}/stats`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch athlete stats')
    }

    return response.json()
  }

  /**
   * Get activity zones (heart rate, power)
   */
  async getActivityZones(
    accessToken: string,
    activityId: number
  ): Promise<any[]> {
    const response = await fetch(
      `https://www.strava.com/api/v3/activities/${activityId}/zones`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch activity zones')
    }

    return response.json()
  }

  /**
   * Get activity streams (detailed time series data)
   */
  async getActivityStreams(
    accessToken: string,
    activityId: number,
    keys: string[] = ['time', 'distance', 'latlng', 'altitude', 'velocity_smooth', 'heartrate', 'cadence', 'watts', 'temp', 'moving', 'grade_smooth'],
    keyByType: boolean = true
  ): Promise<any[]> {
    const params = new URLSearchParams({
      keys: keys.join(','),
      key_by_type: keyByType.toString(),
    })

    const response = await fetch(
      `https://www.strava.com/api/v3/activities/${activityId}/streams?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch activity streams')
    }

    return response.json()
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<StravaTokenResponse> {
    const response = await fetch('/api/auth/strava/refresh', {
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

  /**
   * Deauthorize the application
   */
  async deauthorize(accessToken: string): Promise<void> {
    const response = await fetch('https://www.strava.com/oauth/deauthorize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to deauthorize')
    }
  }
}