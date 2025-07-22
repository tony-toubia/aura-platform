// apps/web/actions/auth.ts
'use server'

import { createServerSupabase } from '@/lib/supabase/server.server'
import { redirect } from 'next/navigation'

export async function signOut() {
  const supabase = await createServerSupabase()
  await supabase.auth.signOut()
  redirect('/login')
}
