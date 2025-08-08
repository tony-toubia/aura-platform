// apps/web/app/(dashboard)/auras/page.tsx

import React from 'react'
import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server.server'
import { AuraServiceServer as AuraService } from '@/lib/services/aura-service.server'
import { AurasList } from '@/components/aura/auras-list'
import { AuraLimitNotification } from '@/components/aura/aura-limit-notification'
import { ContextualHelpProvider } from '@/components/help/contextual-help-provider'
import { AuraLimitService } from '@/lib/services/aura-limit-service'

// Disable caching for this page to ensure fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface AurasPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function AurasPage({ searchParams }: AurasPageProps) {
  const resolvedSearchParams = await searchParams
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const auras = await AuraService.getUserAuras()
  
  // Check if user was redirected due to limit exceeded
  const limitExceeded = resolvedSearchParams.limitExceeded === 'true'
  const disabledAuraId = typeof resolvedSearchParams.disabledAura === 'string' ? resolvedSearchParams.disabledAura : null
  
  // Get limit status for notifications
  let limitStatus = null
  try {
    limitStatus = await AuraLimitService.checkAuraLimitStatus(user.id)
  } catch (error) {
    console.error('Failed to check aura limit status:', error)
  }

  return (
    <ContextualHelpProvider>
      {limitExceeded && (
        <AuraLimitNotification
          disabledAuraId={disabledAuraId}
          limitStatus={limitStatus}
        />
      )}
      <AurasList initialAuras={auras} />
    </ContextualHelpProvider>
  )
}
