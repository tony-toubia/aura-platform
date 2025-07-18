'use server'

import { createServerSupabase } from '@/lib/supabase/server.server'
import { redirect } from 'next/navigation'

export async function deleteAuraAction(formData: FormData) {
  const auraId = formData.get('auraId') as string
  const supabase = await createServerSupabase()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  await supabase
    .from('auras')
    .delete()
    .eq('id', auraId)
    .eq('user_id', user.id)

  // trigger a refresh of /auras
  redirect('/auras')
}
