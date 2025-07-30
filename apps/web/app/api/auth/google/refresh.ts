// pages/api/auth/google/refresh.ts (Optional - for token refresh)
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { refresh_token } = req.body

  if (!refresh_token) {
    return res.status(400).json({ error: 'Missing refresh token' })
  }

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(500).json({ error: 'Google OAuth credentials not configured' })
  }

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token,
        grant_type: 'refresh_token',
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Google token refresh error:', errorText)
      return res.status(400).json({ error: 'Failed to refresh token' })
    }

    const tokens = await response.json()
    res.json(tokens)
  } catch (error) {
    console.error('Token refresh error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}