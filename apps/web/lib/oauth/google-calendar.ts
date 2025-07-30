// lib/oauth/google-calendar.ts
"use client"

export interface GoogleCalendarConfig {
  clientId: string
  redirectUri: string
  scopes: string[]
}

export interface GoogleTokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  token_type: string
  scope: string
}

export interface GoogleCalendarEvent {
  id: string
  summary: string
  start: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  end: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  status: string
  attendees?: Array<{
    email: string
    responseStatus: string
  }>
}

export class GoogleCalendarOAuth {
  private config: GoogleCalendarConfig

  constructor(config: GoogleCalendarConfig) {
    this.config = config
  }

  /**
   * Generate the OAuth authorization URL
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

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<GoogleTokenResponse> {
    const response = await fetch('/api/auth/google/exchange', {
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
  async initiateOAuth(): Promise<GoogleTokenResponse> {
    return new Promise((resolve, reject) => {
      const authUrl = this.getAuthUrl()
      const popup = window.open(
        authUrl,
        'google-oauth',
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

        if (event.data.type === 'oauth-success' && event.data.code) {
          clearInterval(checkClosed)
          popup.close()
          window.removeEventListener('message', handleMessage)

          try {
            const tokenResponse = await this.exchangeCodeForToken(event.data.code)
            resolve(tokenResponse)
          } catch (error) {
            reject(error)
          }
        } else if (event.data.type === 'oauth-error') {
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
   * Fetch user's calendar events (requires valid access token)
   */
  async getCalendarEvents(
    accessToken: string,
    timeMin?: string,
    timeMax?: string,
    maxResults: number = 10
  ): Promise<GoogleCalendarEvent[]> {
    const params = new URLSearchParams({
      timeMin: timeMin || new Date().toISOString(),
      timeMax: timeMax || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      maxResults: maxResults.toString(),
      singleEvents: 'true',
      orderBy: 'startTime',
    })

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch calendar events')
    }

    const data = await response.json()
    return data.items || []
  }
}