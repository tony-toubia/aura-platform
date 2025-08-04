// apps/web/components/subscription/upgrade-prompts.tsx


import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Zap, Lock } from 'lucide-react'
import Link from 'next/link'

interface UpgradePromptProps {
  feature: string
  requiredTier: string
  currentTier: string
}

// Map technical feature names to user-friendly messages
const FEATURE_MESSAGES: Record<string, string> = {
  maxAuras: 'Creating additional Auras',
  maxMessages: 'Sending more messages',
  advancedFeatures: 'Advanced features',
  premiumSupport: 'Premium support',
  // Add more mappings as needed
}

export function UpgradePrompt({ feature, requiredTier, currentTier }: UpgradePromptProps) {
  const friendlyFeatureName = FEATURE_MESSAGES[feature] || feature
  
  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="p-2 bg-amber-100 rounded-full">
            <Lock className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-amber-900">Upgrade Required</h3>
            <p className="text-sm text-amber-700 mt-1">
              {friendlyFeatureName} requires a {requiredTier} subscription or higher.
              You're currently on the {currentTier} plan.
            </p>
            <Link href="/subscription">
              <Button className="mt-4" size="sm">
                <Zap className="w-4 h-4 mr-2" />
                View Upgrade Options
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}