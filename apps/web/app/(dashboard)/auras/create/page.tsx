import { AuraCreatorDigital } from '@/components/aura/aura-creator-digital'
import { UpgradePrompt } from '@/components/subscription/upgrade-prompt'
import { createServerSupabase } from '@/lib/supabase/server.server'
import { SubscriptionService } from '@/lib/services/subscription-service'

export default async function CreateAuraPage() {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="container py-8">
        <div className="text-center text-gray-600">Redirecting…</div>
      </div>
    )
  }

  // Force refresh and get fresh subscription data
  SubscriptionService.clearUserCache(user.id)
  
  // Get the user's current subscription tier
  const subscription = await SubscriptionService.getUserSubscription(user.id, supabase, true)
  
  // Check if they can create more auras with fresh data
  const canCreate = await SubscriptionService.canCreateMoreAuras(user.id, supabase)
  
  // Also get current aura count for debugging
  const { count: auraCount } = await supabase
    .from('auras')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('enabled', true)
  
  console.log(`[CreateAuraPage] User ${user.id} - Tier: ${subscription.id}, Auras: ${auraCount}/${subscription.features.maxAuras}, Can create: ${canCreate}`)

  if (!canCreate) {
    // Determine the required tier based on current tier
    let requiredTier: 'personal' | 'family' | 'business' = 'personal'
    if (subscription.id === 'personal') {
      requiredTier = 'family'
    } else if (subscription.id === 'family') {
      requiredTier = 'business'
    }
    
    return (
      <div className="container py-8">
        <div className="max-w-md mx-auto">
          <UpgradePrompt
            feature="maxAuras"
            requiredTier={requiredTier}
            currentTier={subscription.id as any}
          />
          <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm text-gray-600">
            <p>Current plan: {subscription.name}</p>
            <p>Active auras: {auraCount} / {subscription.features.maxAuras === -1 ? 'Unlimited' : subscription.features.maxAuras}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <AuraCreatorDigital />
    </div>
  )
}