// apps/web/lib/supabase/browser.ts
'use client'

import { createClient } from '@supabase/supabase-js'
import { env, validateEnvironment } from '@/lib/config/env'

// Validate environment variables
try {
  validateEnvironment()
} catch (error) {
  console.error('Browser Supabase client creation failed:', error)
  throw error
}

export const browserSupabase = createClient(
  env.SUPABASE.URL,
  env.SUPABASE.ANON_KEY
)
