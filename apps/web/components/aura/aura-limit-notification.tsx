'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AuraLimitManager } from './aura-limit-manager'
import {
  AlertTriangle,
  Crown,
  Settings,
  X
} from 'lucide-react'

interface AuraLimitStatus {
  currentCount: number
  maxAllowed: number
  isOverLimit: boolean
  excessCount: number
  disabledAuras: string[]
}

interface AuraLimitNotificationProps {
  disabledAuraId?: string | null
  limitStatus?: AuraLimitStatus | null
}

export function AuraLimitNotification({ disabledAuraId, limitStatus }: AuraLimitNotificationProps) {
  const router = useRouter()
  const [dismissed, setDismissed] = useState(false)
  const [limitManagerOpen, setLimitManagerOpen] = useState(false)

  if (dismissed || !limitStatus?.isOverLimit) {
    return null
  }

  const handleDismiss = () => {
    setDismissed(true)
    // Clear URL parameters
    const url = new URL(window.location.href)
    url.searchParams.delete('limitExceeded')
    url.searchParams.delete('disabledAura')
    router.replace(url.pathname, { scroll: false })
  }

  const handleManageAuras = () => {
    setLimitManagerOpen(true)
  }

  const handleUpgrade = () => {
    router.push('/subscription')
  }

  return (
    <>
      <div className="mb-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <div className="flex items-start justify-between w-full">
            <div className="flex-1">
              <AlertDescription className="text-red-800">
                <div className="font-semibold mb-2">
                  {disabledAuraId 
                    ? "Aura Access Blocked - Subscription Limit Exceeded"
                    : "Subscription Limit Exceeded"
                  }
                </div>
                <div className="space-y-2">
                  {disabledAuraId && (
                    <p>
                      You tried to access an aura that has been disabled because you're over your subscription limit.
                    </p>
                  )}
                  <p>
                    You have <strong>{limitStatus.currentCount} active auras</strong> but your plan only allows <strong>{limitStatus.maxAllowed}</strong>. 
                    {limitStatus.excessCount > 0 && (
                      <span> We've automatically disabled <strong>{limitStatus.excessCount} auras</strong> to comply with your subscription limits.</span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Button
                      onClick={handleManageAuras}
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-100"
                    >
                      <Settings className="w-4 h-4 mr-1" />
                      Manage Auras
                    </Button>
                    <Button
                      onClick={handleUpgrade}
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Crown className="w-4 h-4 mr-1" />
                      Upgrade Plan
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </div>
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:bg-red-100 ml-2 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </Alert>
      </div>

      <AuraLimitManager
        open={limitManagerOpen}
        onOpenChange={setLimitManagerOpen}
        onAuraToggled={() => router.refresh()}
      />
    </>
  )
}