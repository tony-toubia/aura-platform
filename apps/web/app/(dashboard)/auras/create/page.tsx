import { AuraCreatorDigital } from '@/components/aura/aura-creator-digital'
import { SubscriptionGuard } from '@/components/subscription/subscription-guard'

export default function CreateAuraPage() {
  return (
    // Temporarily bypassed SubscriptionGuard - same issue as other pages
    <div>
      <div className="container py-8">
        <AuraCreatorDigital />
      </div>
    </div>
  )
}