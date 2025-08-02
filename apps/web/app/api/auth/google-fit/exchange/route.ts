// app/api/auth/google-fit/exchange/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, redirect_uri } = body

    if (!code || !redirect_uri) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Use existing Google credentials (same as Google Calendar)
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_FIT_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_FIT_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Google OAuth not configured. Please add NEXT_PUBLIC_GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your environment variables.' },
        { status: 500 }
      )
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      console.error('Google Fit token exchange failed:', tokenData)
      return NextResponse.json(
        { error: tokenData.error_description || 'Token exchange failed' },
        { status: 400 }
      )
    }

    // In production, you should:
    // 1. Get the user ID from the session/auth
    // 2. Store tokens encrypted in your database
    // 3. Set up token refresh logic
    
    // For now, just return the tokens to the client
    // WARNING: This is not secure for production use
    return NextResponse.json(tokenData)
  } catch (error) {
    console.error('Google Fit OAuth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}