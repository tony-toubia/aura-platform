"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Crown, 
  Zap, 
  Users, 
  MessageCircle, 
  Settings,
  ExternalLink,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SubscriptionTier } from '@/lib/services/subscription-service'

interface SubscriptionStatusProps {
  subscription: SubscriptionTier
  usage: {
    auras: number
    conversations: number
    rules?: number
  }
  onUpgrade?: () => void
  onManage?: () => void
}

export function SubscriptionStatus({ 
  subscription, 
  usage, 
  onUpgrade, 
  onManage 
}: SubscriptionStatusProps) {
  const getTierColor = (tierId: string) => {
    switch (tierId) {
      case 'free': return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'personal': return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'family': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'business': return 'bg-green-100 text-green-800 border-green-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getTierIcon = (tierId: string) => {
    switch (tierId) {
      case 'free': return Zap
      case 'personal': return Sparkles
      case 'family': return Users
      case 'business': return Crown
      default: return Zap
    }
  }

  const getUsagePercentage = (current: number, max: number) => {
    if (max === -1) return 0 // Unlimited
    return Math.min((current / max) * 100, 100)
  }

  const getUsageColor = (current: number, max: number) => {
    if (max === -1) return 'bg-green-500' // Unlimited
    const percentage = (current / max) * 100
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const Icon = getTierIcon(subscription.id)

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">{subscription.name} Plan</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={cn("text-xs", getTierColor(subscription.id))}>
                  {subscription.id === 'free' ? 'Free' : `$${subscription.price}/mo`}
                </Badge>
                {subscription.id !== 'free' && (
                  <Badge variant="outline" className="text-xs">
                    Active
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {subscription.id !== 'business' && onUpgrade && (
              <Button variant="outline" size="sm" onClick={onUpgrade}>
                <Crown className="w-4 h-4 mr-1" />
                Upgrade
              </Button>
            )}
            {subscription.id !== 'free' && onManage && (
              <Button variant="outline" size="sm" onClick={onManage}>
                <Settings className="w-4 h-4 mr-1" />
                Manage
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Usage Stats */}
        <div className="space-y-3">
          {/* Auras */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Auras</span>
              <span className="text-muted-foreground">
                {usage.auras} / {subscription.features.maxAuras === -1 ? '∞' : subscription.features.maxAuras}
              </span>
            </div>
            {subscription.features.maxAuras !== -1 && (
              <Progress 
                value={getUsagePercentage(usage.auras, subscription.features.maxAuras)}
                className="h-2"
              />
            )}
          </div>

          {/* Conversations */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Conversations (this month)</span>
              <span className="text-muted-foreground">
                {usage.conversations} / {subscription.features.maxConversations === -1 ? '∞' : subscription.features.maxConversations}
              </span>
            </div>
            {subscription.features.maxConversations !== -1 && (
              <Progress 
                value={getUsagePercentage(usage.conversations, subscription.features.maxConversations)}
                className="h-2"
              />
            )}
          </div>
        </div>

        {/* Feature List */}
        <div className="pt-2 border-t">
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              <span>{subscription.features.hasVoiceResponses ? 'Voice responses' : 'Text only'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Settings className="w-3 h-3" />
              <span>{subscription.features.hasAnalytics ? 'Analytics' : 'Basic stats'}</span>
            </div>
            <div className="flex items-center gap-1">
              <ExternalLink className="w-3 h-3" />
              <span>{subscription.features.hasApiAccess ? 'API access' : 'No API'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Crown className="w-3 h-3" />
              <span>{subscription.features.supportLevel} support</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}