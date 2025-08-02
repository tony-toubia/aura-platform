// lib/oauth/microsoft-outlook.ts
"use client"

export interface MicrosoftOutlookConfig {
  clientId: string
  redirectUri: string
  scopes: string[]
}

export interface MicrosoftTokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  token_type: string
  scope: string
}

export interface MicrosoftCalendarEvent {
  id: string
  subject: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  status: string
  attendees?: Array<{
    emailAddress: {
      address: string
      name: string
    }
    status: {
      response: string
      time: string
    }
  }>
  location?: {
    displayName: string
  }
  body?: {
    content: string
    contentType: string
  }
}

export class MicrosoftOutlookOAuth {
  private config: MicrosoftOutlookConfig

  constructor(config: MicrosoftOutlookConfig) {
    this.config = config
  }

  /**
   * Generate the OAuth authorization URL for Microsoft Graph
   */
  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: 'code',
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(' '),
      response_mode: 'query',
      prompt: 'consent', // Force consent screen to get refresh token
    })

    return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<MicrosoftTokenResponse> {
    const response = await fetch('/api/auth/microsoft/exchange', {
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
  async initiateOAuth(): Promise<MicrosoftTokenResponse> {
    return new Promise((resolve, reject) => {
      const authUrl = this.getAuthUrl()
      const popup = window.open(
        authUrl,
        'microsoft-oauth',
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
   * Fetch user's calendar events from Microsoft Graph API
   */
  async getCalendarEvents(
    accessToken: string,
    startTime?: string,
    endTime?: string,
    maxResults: number = 10
  ): Promise<MicrosoftCalendarEvent[]> {
    const params = new URLSearchParams({
      $select: 'id,subject,start,end,status,attendees,location,body',
      $orderby: 'start/dateTime',
      $top: maxResults.toString(),
    })

    if (startTime) {
      params.append('$filter', `start/dateTime ge '${startTime}'`)
    }
    if (endTime) {
      const filterValue = startTime 
        ? `start/dateTime ge '${startTime}' and end/dateTime le '${endTime}'`
        : `end/dateTime le '${endTime}'`
      params.set('$filter', filterValue)
    }

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/events?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch calendar events')
    }

    const data = await response.json()
    return data.value || []
  }

  /**
   * Get user's profile information
   */
  async getUserProfile(accessToken: string) {
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
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
}