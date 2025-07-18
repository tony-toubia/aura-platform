// apps/web/lib/supabase/browser.ts
'use client'

import { createClient } from '@supabase/supabase-js'

export const browserSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
