import { AssistantStudio } from '@/components/assistant/assistant-studio'
import { createServerSupabase } from '@/lib/supabase/server.server'
import { SubscriptionService } from '@/lib/services/subscription-service'

export default async function AssistantStudioPage() {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <AssistantStudio canCreate={canCreate} />
    </div>
  )
}