// apps/web/app/(dashboard)/dashboard/page.tsx

import { createServerSupabase } from '@/lib/supabase/server.server'
import { redirect } from 'next/navigation'
import React from 'react' // Import React for type definitions
import { DashboardContent } from '@/components/dashboard/dashboard-content'
import { AuraServiceServer as AuraService } from '@/lib/services/aura-service.server'
import { ContextualHelpProvider } from '@/components/help/contextual-help-provider'


// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Import the types from the shared types file
import type { DashboardStats } from '@/types/dashboard'

interface DashboardContentProps {
  stats: DashboardStats
}

export default async function DashboardPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const allAuras = await AuraService.getUserAuras()
  const totalAurasCount = allAuras.length
  const enabledAurasCount = allAuras.filter(a => a.enabled).length
  const disabledAurasCount = allAuras.filter(a => !a.enabled).length

  // Get enabled aura IDs for filtering conversations
  const userAuraIds = allAuras.filter(a => a.enabled).map(a => a.id)

  // Get conversations count (filter by user's auras)
  const { count: conversationsCount, error: conversationsError } = await supabase
    .from('conversations')
    .select('id', { count: 'exact', head: true })
    .in('aura_id', userAuraIds)

  // Debug logging
  console.log('Dashboard stats:', { 
    enabledAurasCount,
    totalAurasCount,
    disabledAurasCount,
    auras: allAuras.map(a => ({ id: a.id, name: a.name, enabled: a.enabled })),
    conversationsCount, 
    conversationsError,
    userId: user.id,
    activeAuraIds: userAuraIds.length > 0 ? userAuraIds : 'No active auras found'
  })

  // Get user's subscription with limits
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('tier, max_auras')
    .eq('user_id', user.id)
    .single()

  // Determine the max auras based on tier
  const tierLimits = {
    free: 1,
    personal: 3,
    family: 10,
    business: -1 // unlimited
  }
  
  const maxAuras = subscription?.max_auras || tierLimits[subscription?.tier as keyof typeof tierLimits] || 1
  const hasAvailableSlots = maxAuras === -1 || totalAurasCount < maxAuras

  // FIX: Cast the imported component to explicitly tell TypeScript it accepts the 'stats' prop.
  const TypedDashboardContent = DashboardContent as React.FC<DashboardContentProps>

  return (
    <ContextualHelpProvider>
      <TypedDashboardContent
        stats={{
          auras: enabledAurasCount,
          totalAuras: totalAurasCount,
          conversations: conversationsCount || 0,
          subscription: subscription?.tier || 'free',
          maxAuras,
          hasAvailableSlots
        }}
      />
    </ContextualHelpProvider>
  )
}
