// app/api/auth/strava/exchange/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, redirect_uri } = body

    console.log('Strava OAuth exchange request:', {
      hasCode: !!code,
      redirectUri: redirect_uri,
      timestamp: new Date().toISOString()
    })

    if (!code || !redirect_uri) {
      console.error('Missing required parameters:', { code: !!code, redirect_uri: !!redirect_uri })
      return NextResponse.json(
        { error: 'Missing required parameters: code and redirect_uri are required' },
        { status: 400 }
      )
    }

    const clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID
    const clientSecret = process.env.STRAVA_CLIENT_SECRET

    console.log('Environment variables check:', {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      clientIdPrefix: clientId ? clientId.substring(0, 10) + '...' : 'missing'
    })

    if (!clientId || !clientSecret) {
      const errorMsg = `Strava OAuth not configured. Missing: ${!clientId ? 'CLIENT_ID' : ''} ${!clientSecret ? 'CLIENT_SECRET' : ''}. Please add NEXT_PUBLIC_STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET to your environment variables.`
      console.error(errorMsg)
      return NextResponse.json(
        { error: errorMsg },
        { status: 500 }
      )
    }

    const tokenRequestBody = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri,
    })

    console.log('Making token request to Strava:', {
      url: 'https://www.strava.com/oauth/token',
      clientId: clientId.substring(0, 10) + '...',
      redirectUri: redirect_uri,
      hasCode: !!code
    })

    const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenRequestBody,
    })

    const tokenData = await tokenResponse.json()

    console.log('Strava token response:', {
      ok: tokenResponse.ok,
      status: tokenResponse.status,
      hasAccessToken: !!tokenData.access_token,
      hasRefreshToken: !!tokenData.refresh_token,
      hasAthlete: !!tokenData.athlete,
      error: tokenData.error,
      errorDescription: tokenData.error_description
    })

    if (!tokenResponse.ok) {
      console.error('Strava token exchange failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: tokenData.error,
        errorDescription: tokenData.error_description,
        tokenData
      })
      
      return NextResponse.json(
        {
          error: tokenData.error_description || tokenData.error || 'Token exchange failed',
          details: `HTTP ${tokenResponse.status}: ${tokenData.error || 'Unknown error'}`,
          redirectUriUsed: redirect_uri
        },
        { status: 400 }
      )
    }

    // Extract athlete info if available
    let userInfo = null
    if (tokenData.athlete) {
      userInfo = {
        id: tokenData.athlete.id,
        name: `${tokenData.athlete.firstname} ${tokenData.athlete.lastname}`.trim(),
        email: null, // Strava doesn't provide email in token response
        avatar: tokenData.athlete.profile_medium || tokenData.athlete.profile,
        username: tokenData.athlete.username,
        city: tokenData.athlete.city,
        state: tokenData.athlete.state,
        country: tokenData.athlete.country
      }
      console.log('Retrieved athlete info:', {
        id: userInfo.id,
        name: userInfo.name,
        username: userInfo.username
      })
    }

    // Return success response
    const response = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      expires_at: tokenData.expires_at,
      token_type: tokenData.token_type,
      athlete: tokenData.athlete,
      user_info: userInfo
    }

    console.log('Successful Strava OAuth exchange:', {
      hasAccessToken: !!response.access_token,
      hasRefreshToken: !!response.refresh_token,
      expiresIn: response.expires_in,
      expiresAt: response.expires_at,
      athleteId: tokenData.athlete?.id,
      athleteName: userInfo?.name
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('Strava OAuth exchange error:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}