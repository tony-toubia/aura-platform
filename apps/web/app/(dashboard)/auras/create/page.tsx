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

  const canCreate = await SubscriptionService.checkFeatureAccess(
    user.id,
    'maxAuras',
    supabase
  )

  if (!canCreate) {
    return (
      <div className="container py-8">
        <div className="max-w-md mx-auto">
          <UpgradePrompt feature="maxAuras" requiredTier="personal" currentTier="free" />
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