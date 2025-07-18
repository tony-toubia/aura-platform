// apps/web/app/(dashboard)/auras/page.tsx


import React from 'react'
import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server.server'
import { AuraServiceServer as AuraService } from '@/lib/services/aura-service.server'
import { AurasList } from '@/components/aura/auras-list'

export default async function AurasPage() {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const auras = await AuraService.getUserAuras()
  return <AurasList initialAuras={auras} />
}
