import { SubscriptionService } from '@/lib/services/subscription-service'
import { redirect } from 'next/navigation'

export async function requireSubscription(
  userId: string,
  requiredTier: 'personal' | 'family' | 'business'
) {
  const subscription = await SubscriptionService.getUserSubscription(userId)
  const tierHierarchy = ['free', 'personal', 'family', 'business']
  
  const userTierIndex = tierHierarchy.indexOf(subscription.id)
  const requiredTierIndex = tierHierarchy.indexOf(requiredTier)
  
  if (userTierIndex < requiredTierIndex) {
    redirect(`/subscription/upgrade?required=${requiredTier}`)
  }
}

export async function checkFeatureLimit(
  userId: string,
  feature: 'auras' | 'rules' | 'messages',
  currentCount: number
): Promise<{ allowed: boolean; limit: number; upgradeRequired?: string }> {
  const subscription = await SubscriptionService.getUserSubscription(userId)
  
  switch (feature) {
    case 'auras':
      const maxAuras = subscription.features.maxAuras
      if (maxAuras === -1 || currentCount < maxAuras) {
        return { allowed: true, limit: maxAuras }
      }
      return {
        allowed: false,
        limit: maxAuras,
        upgradeRequired: subscription.id === 'free' ? 'personal' : 'family'
      }
    
    case 'messages':
      const maxMessages = subscription.features.maxMessages
      if (maxMessages === -1 || currentCount < maxMessages) {
        return { allowed: true, limit: maxMessages }
      }
      return {
        allowed: false,
        limit: maxMessages,
        upgradeRequired: subscription.id === 'free' ? 'personal' : subscription.id === 'personal' ? 'family' : 'business'
      }
    
    // Similar logic for other features
    default:
      return { allowed: true, limit: -1 }
  }
}