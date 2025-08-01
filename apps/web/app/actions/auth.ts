// apps/web/actions/auth.ts
'use server'

import { createServerSupabase } from '@/lib/supabase/server.server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function signOut() {
  const supabase = await createServerSupabase()
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Sign out error:', error)
    throw new Error('Failed to sign out')
  }
  
  // Clear any cached data
  revalidatePath('/', 'layout')
  redirect('/login')
}
