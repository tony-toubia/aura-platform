// pages/api/auth/microsoft/refresh.ts (Optional - for token refresh)
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { refresh_token } = req.body

  if (!refresh_token) {
    return res.status(400).json({ error: 'Missing refresh token' })
  }

  const clientId = process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'Microsoft OAuth not configured' })
  }

  try {
    const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token,
        grant_type: 'refresh_token',
        scope: 'https://graph.microsoft.com/calendars.read https://graph.microsoft.com/user.read offline_access',
      }),
    })

    const tokenData = await response.json()

    if (!response.ok) {
      console.error('Microsoft token refresh failed:', tokenData)
      return res.status(400).json({ error: tokenData.error_description || 'Token refresh failed' })
    }

    // In production, update the stored tokens in your database
    res.json(tokenData)
  } catch (error) {
    console.error('Microsoft token refresh error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}