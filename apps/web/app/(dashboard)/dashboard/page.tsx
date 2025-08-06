// apps/web/app/(dashboard)/dashboard/page.tsx

import { createServerSupabase } from '@/lib/supabase/server.server'
import { redirect } from 'next/navigation'
import React from 'react' // Import React for type definitions
import { DashboardContent } from '@/components/aura/dashboard-content'
import { ContextualHelpProvider } from '@/components/help/contextual-help-provider'

// Force this page to revalidate on every request to show fresh subscription data
export const revalidate = 0

// Define the props interface here to ensure type safety within this file
interface DashboardStats {
  auras: number
  conversations: number
  subscription: string
}

interface DashboardContentProps {
  stats: DashboardStats
}

export default async function DashboardPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's active auras count (only enabled auras)
  const { count: aurasCount } = await supabase
    .from('auras')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('enabled', true)

  // Get user's active aura IDs for filtering conversations
  const { data: userAuras } = await supabase
    .from('auras')
    .select('id')
    .eq('user_id', user.id)
    .eq('enabled', true)
  
  const userAuraIds = userAuras?.map(aura => aura.id) || []

  // Get conversations count (filter by user's auras)
  const { count: conversationsCount, error: conversationsError } = await supabase
    .from('conversations')
    .select('id', { count: 'exact', head: true })
    .in('aura_id', userAuraIds)

  // Debug logging
  console.log('Dashboard stats:', { 
    activeAurasCount: aurasCount, 
    conversationsCount, 
    conversationsError,
    userId: user.id,
    activeAuraIds: userAuraIds.length > 0 ? userAuraIds : 'No active auras found'
  })

  // Get user's subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('tier')
    .eq('user_id', user.id)
    .single()

  // FIX: Cast the imported component to explicitly tell TypeScript it accepts the 'stats' prop.
  const TypedDashboardContent = DashboardContent as React.FC<DashboardContentProps>

  return (
    <ContextualHelpProvider>
      <TypedDashboardContent
        stats={{
          auras: aurasCount || 0,
          conversations: conversationsCount || 0,
          subscription: subscription?.tier || 'free'
        }}
      />
    </ContextualHelpProvider>
  )
}
