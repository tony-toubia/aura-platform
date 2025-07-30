// pages/api/auth/google/exchange.ts
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { code, redirect_uri } = req.body

  if (!code || !redirect_uri) {
    return res.status(400).json({ error: 'Missing required parameters' })
  }

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(500).json({ 
      error: 'Google OAuth credentials not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.' 
    })
  }

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri,
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Google token exchange error:', errorText)
      return res.status(400).json({ error: 'Failed to exchange code for token' })
    }

    const tokens = await tokenResponse.json()

    // TODO: Store tokens securely in your database
    // For now, we'll just return them to the client
    // In production, you should:
    // 1. Get the user ID from the session/auth
    // 2. Store tokens encrypted in your database
    // 3. Return only a success indicator to the client
    
    res.json({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
      scope: tokens.scope,
      token_type: tokens.token_type
    })
  } catch (error) {
    console.error('OAuth exchange error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}