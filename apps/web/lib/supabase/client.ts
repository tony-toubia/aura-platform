// apps/web/lib/supabase/client.ts

import { createBrowserClient } from '@supabase/ssr'
import { env, validateEnvironment } from '@/lib/config/env'

export function createClient() {
  // Validate environment variables
  try {
    validateEnvironment()
  } catch (error) {
    console.error('Supabase client creation failed:', error)
    throw error
  }
  
  return createBrowserClient(
    env.SUPABASE.URL,
    env.SUPABASE.ANON_KEY
  )
}