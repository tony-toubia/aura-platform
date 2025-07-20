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
import { Check, X, Zap, Heart, Users, Building, Star } from 'lucide-react'
import { SUBSCRIPTION_TIERS } from '@/lib/services/subscription-service'
import { cn } from '@/lib/utils'

interface PricingCardsProps {
  currentTier?: string
  onSelectTier?: (tierId: string) => void
}

const tierConfig = {
  free: {
    icon: Zap,
    description: 'For getting started with the magic of Auras.',
    borderColor: 'border-gray-300',
    gradient: 'from-gray-50 to-white',
    buttonClass: 'bg-gray-800 hover:bg-gray-900',
    textColor: 'text-gray-800'
  },
  personal: {
    icon: Heart,
    description: 'For creators who want to unlock more features and potential.',
    borderColor: 'border-purple-400',
    gradient: 'from-purple-50 to-white',
    buttonClass: 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700',
    textColor: 'text-purple-700'
  },
  family: {
    icon: Users,
    description: 'Share the magic with your entire family and friends.',
    borderColor: 'border-blue-400',
    gradient: 'from-blue-50 to-white',
    buttonClass: 'bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700',
    textColor: 'text-blue-700'
  },
  business: {
    icon: Building,
    description: 'Enterprise-grade capabilities for your organization.',
    borderColor: 'border-amber-400',
    gradient: 'from-amber-50 to-white',
    buttonClass: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700',
    textColor: 'text-amber-700'
  },
}

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
    // FIX: Replaced the fixed-column grid with a responsive, auto-fitting grid.
    <div className="grid gap-8 justify-center grid-cols-[repeat(auto-fit,minmax(280px,1fr))]">
      {Object.entries(SUBSCRIPTION_TIERS).map(([tierId, tier]) => {
        const config = tierConfig[tierId as keyof typeof tierConfig]
        const Icon = config.icon
        const isCurrentTier = currentTier === tierId
        const isPopular = tierId === 'personal'

        return (
          <Card
            key={tierId}
            className={cn(
              'flex flex-col h-full', 
              'relative overflow-hidden transition-shadow duration-300 ease-in-out',
              'bg-white hover:shadow-2xl',
              isCurrentTier ? config.borderColor : 'border-gray-200',
              isCurrentTier ? 'border-2 shadow-xl' : 'border shadow-md',
              isPopular && !isCurrentTier && 'border-purple-300'
            )}
          >
            {isPopular && (
              <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 text-xs font-bold rounded-bl-lg shadow-md z-10">
                <Star className="w-3 h-3 inline-block mr-1" />
                Most Popular
              </div>
            )}

            <CardHeader
              className={cn(
                'p-6 bg-gradient-to-br text-center',
                config.gradient
              )}
            >
              <div className="w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-4 bg-white shadow-inner">
                <Icon className={cn("w-8 h-8", config.textColor)} />
              </div>
              <div className="min-h-[110px]">
                <CardTitle className="text-xl font-bold">{tier.name}</CardTitle>
                <p className="text-3xl font-extrabold text-gray-900 mt-2">
                  ${tier.price}
                  {tier.price > 0 && <span className="text-base font-medium text-gray-500">/mo</span>}
                </p>
                <CardDescription className="text-sm text-gray-600 mt-2 px-2">
                  {config.description}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="flex-1 p-6 space-y-4">
              <p className="text-sm font-semibold text-gray-700">Features include:</p>
              <ul className="space-y-3">
                {features.map(({ key, label, format }) => {
                  const rawValue = tier.features[key]
                  const formatted = format(rawValue)
                  const isBoolean = typeof formatted === 'boolean'

                  return (
                    <li
                      key={key}
                      className="flex items-start space-x-3 text-sm"
                    >
                      <div className="flex-shrink-0 pt-0.5">
                        {isBoolean ? (
                          formatted ? (
                            <Check className="w-5 h-5 text-green-500" />
                          ) : (
                            <X className="w-5 h-5 text-gray-400" />
                          )
                        ) : (
                          <Check className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                      <span
                        className={cn(
                          'flex-1 text-left',
                          isBoolean && !formatted && 'text-gray-400 line-through'
                        )}
                      >
                        {label}
                        {!isBoolean && <strong className={cn("ml-1 font-bold", config.textColor)}>{formatted}</strong>}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </CardContent>

            <CardFooter className="p-6 mt-auto bg-gray-50/50">
              {isCurrentTier ? (
                <Button className="w-full" disabled variant="outline">
                  <Check className="w-4 h-4 mr-2" />
                  Current Plan
                </Button>
              ) : (
                <Button
                  className={cn("w-full text-white shadow-lg transition-transform hover:scale-105", config.buttonClass)}
                  onClick={() => handleUpgrade(tierId)}
                >
                  {tier.price > 0 ? `Upgrade to ${tier.name}` : 'Get Started'}
                </Button>
              )}
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
