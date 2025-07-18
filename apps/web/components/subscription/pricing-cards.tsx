// apps/web/components/subscription/pricing-cards.tsx

"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, X, Zap, Heart, Users, Building } from 'lucide-react'
import { SUBSCRIPTION_TIERS } from '@/lib/services/subscription-service'
import { cn } from '@/lib/utils'

interface PricingCardsProps {
  currentTier?: string
  onSelectTier?: (tierId: string) => void
}

const tierIcons = {
  free: Zap,
  personal: Heart,
  family: Users,
  business: Building,
}

const tierColors = {
  free: 'border-gray-200',
  personal: 'border-purple-200',
  family: 'border-blue-200',
  business: 'border-amber-200',
}

const tierGradients = {
  free: 'from-gray-50 to-gray-100',
  personal: 'from-purple-50 to-purple-100',
  family: 'from-blue-50 to-blue-100',
  business: 'from-amber-50 to-amber-100',
}

// define a feature descriptor with a looser "format" signature
type FeatureDef = {
  key: keyof typeof SUBSCRIPTION_TIERS['free']['features']
  label: string
  format: (v: any) => any
}

export function PricingCards({
  currentTier = 'free',
  onSelectTier,
}: PricingCardsProps) {
  const router = useRouter()

  const features: FeatureDef[] = [
    {
      key: 'maxAuras',
      label: 'Active Auras',
      format: (v) => (v === -1 ? 'Unlimited' : v),
    },
    {
      key: 'maxRulesPerAura',
      label: 'Rules per Aura',
      format: (v) => (v === -1 ? 'Unlimited' : v),
    },
    {
      key: 'maxConversations',
      label: 'Conversations/month',
      format: (v) => (v === -1 ? 'Unlimited' : (v as number).toLocaleString()),
    },
    { key: 'hasAnalytics', label: 'Advanced Analytics', format: (v) => v },
    { key: 'hasVoiceResponses', label: 'Voice Responses', format: (v) => v },
    { key: 'hasApiAccess', label: 'API Access', format: (v) => v },
    { key: 'hasCustomAvatars', label: 'Custom Avatars', format: (v) => v },
    { key: 'hasDataExport', label: 'Data Export', format: (v) => v },
  ]

  const handleUpgrade = (tierId: string) => {
    if (onSelectTier) {
      onSelectTier(tierId)
    } else {
      router.push(`/subscription/upgrade?tier=${tierId}`)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {Object.entries(SUBSCRIPTION_TIERS).map(([tierId, tier]) => {
        const Icon = tierIcons[tierId as keyof typeof tierIcons]
        const isCurrentTier = currentTier === tierId
        const isPopular = tierId === 'personal'

        return (
          <Card
            key={tierId}
            className={cn(
              'relative overflow-hidden transition-all hover:shadow-lg',
              tierColors[tierId as keyof typeof tierColors],
              isPopular && 'md:scale-105 shadow-lg'
            )}
          >
            {isPopular && (
              <div className="absolute top-0 right-0">
                <Badge className="rounded-bl-lg rounded-tr-lg">
                  Most Popular
                </Badge>
              </div>
            )}

            <CardHeader
              className={cn(
                'bg-gradient-to-br',
                tierGradients[tierId as keyof typeof tierGradients]
              )}
            >
              <div className="flex items-center justify-between">
                <Icon className="w-8 h-8 text-gray-700" />
                {isCurrentTier && <Badge variant="secondary">Current Plan</Badge>}
              </div>
              <CardTitle className="text-2xl">{tier.name}</CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold text-gray-900">
                  ${tier.price}
                </span>
                {tier.price > 0 && <span className="text-gray-600">/month</span>}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              <ul className="space-y-3">
                {features.map(({ key, label, format }) => {
                  const rawValue = tier.features[key]
                  const formatted = format(rawValue)
                  const isBoolean = typeof formatted === 'boolean'

                  return (
                    <li
                      key={key}
                      className="flex items-center space-x-2 text-sm"
                    >
                      {isBoolean ? (
                        formatted ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <X className="w-4 h-4 text-gray-400" />
                        )
                      ) : (
                        <Check className="w-4 h-4 text-green-600" />
                      )}
                      <span
                        className={cn(
                          isBoolean && !formatted && 'text-gray-400'
                        )}
                      >
                        {label}:{' '}
                        {!isBoolean && <strong>{formatted}</strong>}
                      </span>
                    </li>
                  )
                })}
              </ul>

              {/* Sense Categories */}
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium mb-2">Available Senses:</p>
                <div className="flex flex-wrap gap-1">
                  {tier.features.availableSenses.includes('all') ? (
                    <Badge variant="secondary" className="text-xs">
                      All Senses
                    </Badge>
                  ) : (
                    <>
                      {tier.features.availableSenses.includes('weather') && (
                        <Badge variant="secondary" className="text-xs">
                          Weather
                        </Badge>
                      )}
                      {tier.features.availableSenses.includes(
                        'soil_moisture'
                      ) && (
                        <Badge variant="secondary" className="text-xs">
                          Sensors
                        </Badge>
                      )}
                      {tier.features.availableSenses.includes('wildlife') && (
                        <Badge variant="secondary" className="text-xs">
                          Premium
                        </Badge>
                      )}
                    </>
                  )}
                </div>
              </div>
            </CardContent>

            <CardFooter>
              {isCurrentTier ? (
                <Button className="w-full" disabled>
                  Current Plan
                </Button>
              ) : tier.price === 0 ? (
                <Button className="w-full" variant="outline" disabled>
                  Free Plan
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => handleUpgrade(tierId)}
                >
                  Upgrade to {tier.name}
                </Button>
              )}
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
