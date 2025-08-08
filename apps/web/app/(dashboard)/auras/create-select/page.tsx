// apps/web/app/(dashboard)/auras/create-select/page.tsx

"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Brain,
  Bot,
  Settings,
  Sparkles,
  Wand2,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react'
import { UpgradePrompt } from '@/components/subscription/upgrade-prompt'
import { useSubscription } from '@/lib/contexts/subscription-context'

export default function CreateSelectPage() {
  const router = useRouter()
  const { subscription, checkFeatureAccess } = useSubscription()
  const [canCreateAura, setCanCreateAura] = useState<boolean | null>(null)
  
  // Check if user can create more auras
  useEffect(() => {
    const checkAuraCreation = async () => {
      try {
        console.log('CreateSelectPage: Checking aura creation access', {
          subscription: subscription?.id,
          maxAuras: subscription?.features?.maxAuras
        })
        const canCreate = await checkFeatureAccess('maxAuras')
        console.log('CreateSelectPage: Can create aura result:', canCreate)
        setCanCreateAura(canCreate)
      } catch (error) {
        console.error('Error checking aura creation access:', error)
        setCanCreateAura(false)
      }
    }
    
    if (subscription) {
      checkAuraCreation()
    } else {
      console.log('CreateSelectPage: No subscription available yet')
    }
  }, [subscription, checkFeatureAccess])

  return (
    <div>
      <div className="container mx-auto px-2 py-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.push('/auras')}
            className="hover:bg-gray-100 mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Auras
          </Button>

          {/* Header */}
          <div className="text-center mb-12 px-4">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Brain className="w-4 h-4" />
              Aura Creation
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Create Your New Aura
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose your path to bring an AI companion to life
            </p>
          </div>

          {/* Creation Options */}
          {canCreateAura === null ? (
            // Loading state
            <div className="w-full">
              <div className="border-gray-200 bg-gray-50 border rounded-lg">
                <div className="p-8">
                  <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : canCreateAura ? (
            // Can create - show options
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* AI-Guided Option */}
              <Link href="/auras/create-with-agent" className="block">
                <Card className="h-full border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-white to-blue-50 hover:border-purple-400 hover:shadow-xl transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-8 h-full flex flex-col">
                    <div className="text-center flex-1 flex flex-col justify-center">
                      <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                        <Bot className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-4">
                        AI-Guided Creation
                      </h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        Let our AI assistant help you design the perfect companion through conversation.
                        Perfect for beginners or anyone who wants a guided experience.
                      </p>
                      <div className="inline-flex items-center gap-2 text-sm text-purple-600 font-medium mb-6">
                        <Sparkles className="w-4 h-4" />
                        <span>Recommended for beginners</span>
                      </div>
                    </div>
                    <div className="mt-auto">
                      <div className="inline-flex items-center gap-2 px-6 py-3 bg-purple-100 text-purple-700 rounded-lg font-medium text-base group-hover:bg-purple-200 transition-colors w-full justify-center">
                        Start with AI Assistant
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* Manual Option */}
              <Link href="/auras/create" className="block">
                <Card className="h-full border-2 border-green-200 bg-gradient-to-br from-green-50 via-white to-emerald-50 hover:border-green-400 hover:shadow-xl transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-8 h-full flex flex-col">
                    <div className="text-center flex-1 flex flex-col justify-center">
                      <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                        <Settings className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-4">
                        Custom Creation
                      </h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        Take full control and design every aspect of your Aura's personality,
                        senses, and behaviors with our advanced configuration tools.
                      </p>
                      <div className="inline-flex items-center gap-2 text-sm text-green-600 font-medium mb-6">
                        <Wand2 className="w-4 h-4" />
                        <span>For advanced users</span>
                      </div>
                    </div>
                    <div className="mt-auto">
                      <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 text-green-700 rounded-lg font-medium text-base group-hover:bg-green-200 transition-colors w-full justify-center">
                        Create Manually
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          ) : (
            // Cannot create - show upgrade prompt
            <div className="w-full">
              <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                  <div className="w-full max-w-md mx-auto">
                    <UpgradePrompt
                      feature="maxAuras"
                      requiredTier="personal"
                      currentTier={subscription?.id || 'free'}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="mt-12 text-center">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-2xl mx-auto">
              <h4 className="font-semibold text-blue-900 mb-2">
                💡 Not sure which to choose?
              </h4>
              <p className="text-blue-700 text-sm leading-relaxed">
                Start with <strong>AI-Guided Creation</strong> for a smooth, conversational experience.
                You can always fine-tune your Aura later using the manual editor, and both modes
                allow switching between AI and manual configuration at any time!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}