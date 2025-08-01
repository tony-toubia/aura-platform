// apps/web/app/(dashboard)/dashboard/page.tsx

import { createServerSupabase } from '@/lib/supabase/server.server'
import { redirect } from 'next/navigation'
import React from 'react' // Import React for type definitions
import { DashboardContent } from '@/components/aura/dashboard-content'

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

  // Get user's auras count
  const { count: aurasCount } = await supabase
    .from('auras')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Get user's aura IDs for filtering conversations
  const { data: userAuras } = await supabase
    .from('auras')
    .select('id')
    .eq('user_id', user.id)
  
  const userAuraIds = userAuras?.map(aura => aura.id) || []

  // Get conversations count (filter by user's auras)
  const { count: conversationsCount, error: conversationsError } = await supabase
    .from('conversations')
    .select('id', { count: 'exact', head: true })
    .in('aura_id', userAuraIds)

  // Debug logging
  console.log('Dashboard stats:', { 
    aurasCount, 
    conversationsCount, 
    conversationsError,
    userId: user.id,
    userAuraIds: userAuraIds.length > 0 ? userAuraIds : 'No auras found'
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
    <TypedDashboardContent 
      stats={{
        auras: aurasCount || 0,
        conversations: conversationsCount || 0,
        subscription: subscription?.tier || 'free'
      }}
    />
  )
}
