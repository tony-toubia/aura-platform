// pages/api/auth/microsoft/exchange.ts
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { code, redirect_uri } = req.body

  if (!code || !redirect_uri) {
    return res.status(400).json({ error: 'Missing required parameters' })
  }

  const clientId = process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'Microsoft OAuth not configured' })
  }

  try {
    const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
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
        scope: 'https://graph.microsoft.com/calendars.read https://graph.microsoft.com/user.read offline_access',
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      console.error('Microsoft token exchange failed:', tokenData)
      return res.status(400).json({ error: tokenData.error_description || 'Token exchange failed' })
    }

    // In production, you should:
    // 1. Get the user ID from the session/auth
    // 2. Store tokens encrypted in your database
    // 3. Set up token refresh logic
    
    // For now, just return the tokens to the client
    // WARNING: This is not secure for production use
    res.json(tokenData)
  } catch (error) {
    console.error('Microsoft OAuth error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}