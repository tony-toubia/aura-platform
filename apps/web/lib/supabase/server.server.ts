// apps/web/lib/supabase/server.server.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'
import { env, validateEnvironment } from '@/lib/config/env'

/**
 * Server-only Supabase client.
 * ONLY import this from async Server Components or route handlers under /app/.
 */
export async function createServerSupabase() {
  // Validate environment variables
  try {
    validateEnvironment(true)
  } catch (error) {
    console.error('Server Supabase client creation failed:', error)
    throw error
  }

  const cookieStore = await cookies()

  return createServerClient<Database>(
    env.SUPABASE.URL,
    env.SUPABASE.ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // This can be ignored
          }
        },
      },
    }
  )
}
