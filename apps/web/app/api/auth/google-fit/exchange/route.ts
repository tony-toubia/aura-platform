// app/api/auth/google-fit/exchange/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, redirect_uri } = body

    console.log('Google Fit OAuth exchange request:', {
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

    // Use existing Google credentials (same as Google Calendar)
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_FIT_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_FIT_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET

    console.log('Environment variables check:', {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      clientIdSource: process.env.NEXT_PUBLIC_GOOGLE_FIT_CLIENT_ID ? 'GOOGLE_FIT' : 'GOOGLE_CALENDAR',
      clientSecretSource: process.env.GOOGLE_FIT_CLIENT_SECRET ? 'GOOGLE_FIT' : 'GOOGLE_CALENDAR'
    })

    if (!clientId || !clientSecret) {
      const errorMsg = `Google OAuth not configured. Missing: ${!clientId ? 'CLIENT_ID' : ''} ${!clientSecret ? 'CLIENT_SECRET' : ''}. Please add NEXT_PUBLIC_GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your environment variables.`
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

    console.log('Making token request to Google:', {
      url: 'https://oauth2.googleapis.com/token',
      clientId: clientId.substring(0, 10) + '...',
      redirectUri: redirect_uri,
      hasCode: !!code
    })

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenRequestBody,
    })

    const tokenData = await tokenResponse.json()

    console.log('Google token response:', {
      ok: tokenResponse.ok,
      status: tokenResponse.status,
      hasAccessToken: !!tokenData.access_token,
      hasRefreshToken: !!tokenData.refresh_token,
      error: tokenData.error,
      errorDescription: tokenData.error_description
    })

    if (!tokenResponse.ok) {
      console.error('Google Fit token exchange failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: tokenData.error,
        errorDescription: tokenData.error_description,
        tokenData
      })
      
      return NextResponse.json(
        {
          error: tokenData.error_description || tokenData.error || 'Token exchange failed',
          details: `HTTP ${tokenResponse.status}: ${tokenData.error || 'Unknown error'}`
        },
        { status: 400 }
      )
    }

    // Get user info from Google
    let userInfo = null
    try {
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      })
      
      if (userResponse.ok) {
        userInfo = await userResponse.json()
        console.log('Retrieved user info:', {
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.name
        })
      }
    } catch (userError) {
      console.warn('Failed to get user info:', userError)
    }

    // Return success response
    const response = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      token_type: tokenData.token_type,
      scope: tokenData.scope,
      user_info: userInfo
    }

    console.log('Successful Google Fit OAuth exchange:', {
      hasAccessToken: !!response.access_token,
      hasRefreshToken: !!response.refresh_token,
      expiresIn: response.expires_in,
      scope: response.scope,
      userEmail: userInfo?.email
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('Google Fit OAuth exchange error:', {
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