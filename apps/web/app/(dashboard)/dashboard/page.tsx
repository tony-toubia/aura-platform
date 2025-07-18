import { createServerSupabase } from '@/lib/supabase/server.server'
import { redirect } from 'next/navigation'
import { DashboardContent } from '@/components/aura/dashboard-content'

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

  return (
    <DashboardContent 
      stats={{
        auras: aurasCount || 0,
        conversations: conversationsCount || 0,
        subscription: subscription?.tier || 'free'
      }}
    />
  )
}