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

  // Get conversations count
  const { count: conversationsCount } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })

  // Get user's subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('tier')
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
