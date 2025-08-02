// app/api/auth/strava/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { refresh_token } = body

    if (!refresh_token) {
      return NextResponse.json(
        { error: 'Missing refresh token' },
        { status: 400 }
      )
    }

    const clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID
    const clientSecret = process.env.STRAVA_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Strava OAuth not configured' },
        { status: 500 }
      )
    }

    const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token,
        grant_type: 'refresh_token',
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      console.error('Strava token refresh failed:', tokenData)
      return NextResponse.json(
        { error: tokenData.error_description || 'Token refresh failed' },
        { status: 400 }
      )
    }

    // In production, you should:
    // 1. Get the user ID from the session/auth
    // 2. Update the stored tokens in your database
    // 3. Return only necessary data to the client
    
    // For now, just return the new tokens to the client
    // WARNING: This is not secure for production use
    return NextResponse.json(tokenData)
  } catch (error) {
    console.error('Strava token refresh error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}