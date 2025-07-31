// lib/oauth/token-storage.ts
import { createClient } from '@/lib/supabase/client'

export interface OAuthConnection {
  id: string
  userId: string
  provider: string
  providerUserId?: string
  senseType: string
  accessToken: string
  refreshToken?: string
  expiresAt?: Date
  scope?: string
  createdAt: Date
  updatedAt: Date
}

export async function storeOAuthConnection(
  userId: string,
  provider: string,
  senseType: string,
  tokens: {
    access_token: string
    refresh_token?: string
    expires_in?: number
    scope?: string
  }
): Promise<OAuthConnection> {
  const supabase = createClient()
  
  const expiresAt = tokens.expires_in 
    ? new Date(Date.now() + tokens.expires_in * 1000)
    : undefined

  const { data, error } = await supabase
    .from('oauth_connections')
    .upsert({
      user_id: userId,
      provider,
      sense_type: senseType,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: expiresAt,
      scope: tokens.scope,
      updated_at: new Date(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getOAuthConnection(
  userId: string,
  provider: string,
  senseType: string
): Promise<OAuthConnection | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('oauth_connections')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', provider)
    .eq('sense_type', senseType)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data || null
}

export async function refreshGoogleToken(
  refreshToken: string
): Promise<{ access_token: string; expires_in: number }> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to refresh token')
  }

  return response.json()
}

// Get current authenticated user info (client-side)
export async function getCurrentUserId(): Promise<string | null> {
  const supabase = createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) return null
  return user.id
}