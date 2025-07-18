// apps/web/lib/supabase/server.server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

/**
 * Server‐only Supabase client.
 * ONLY import this from async Server Components or route handlers under /app/.
 */
export async function createServerSupabase() {
  // cookies() here returns a Promise, so await it
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // your cookie‐read/write adapter
      cookies: {
        get(name: string) {
          const c = cookieStore.get(name)
          return c ? c.value : null
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.delete({ name, ...options })
        },
      },

      // IMPORTANT: turn off any auto‐refresh or URL‐based session detection
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  )
}
