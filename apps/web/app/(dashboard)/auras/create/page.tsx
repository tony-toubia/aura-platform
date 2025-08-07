import { AuraCreatorDigital } from '@/components/aura/aura-creator-digital'
import { SubscriptionGuard } from '@/components/subscription/subscription-guard'

export default function CreateAuraPage() {
  return (
    <SubscriptionGuard feature="maxAuras">
      <div className="container py-8">
        <AuraCreatorDigital />
      </div>
    </SubscriptionGuard>
  )
}