// apps/web/app/(dashboard)/auras/create-select-digital/page.tsx

"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SubscriptionGuard } from '@/components/subscription/subscription-guard'
import {
  Bot,
  Settings,
  Sparkles,
  ArrowRight,
  Clock,
  Zap,
  Heart,
  Brain,
  Wand2,
  Rocket,
  Star,
  Gift
} from 'lucide-react'
import { COMING_SOON_VESSELS } from '@/lib/constants'

export default function CreateSelectDigitalPage() {
  const router = useRouter()

  // Check for form data from AI mode switch
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const hasFormData = urlParams && (urlParams.get('name') || urlParams.get('personality') || urlParams.get('senses') || urlParams.get('rules'))

  const creationMethods = [
    {
      id: 'agent',
      title: 'AI-Guided Creation',
      subtitle: 'Recommended for beginners',
      description: 'Let our AI assistant guide you through creating the perfect digital Aura with natural conversation',
      icon: Bot,
      gradient: 'from-purple-500 to-blue-500',
      features: [
        'Natural conversation interface',
        'Personalized recommendations',
        'Automatic configuration',
        'Smart sense selection'
      ],
      time: '5-10 minutes',
      difficulty: 'Easy',
      action: () => router.push('/auras/create-with-agent'),
      badge: 'Popular'
    },
    {
      id: 'manual',
      title: 'Manual Configuration',
      subtitle: 'Full control over every detail',
      description: 'Configure every aspect of your digital Aura manually with advanced options and precise control',
      icon: Settings,
      gradient: 'from-emerald-500 to-teal-500',
      features: [
        'Complete customization',
        'Advanced personality matrix',
        'Detailed rule builder',
        'Expert configuration options'
      ],
      time: '10-20 minutes',
      difficulty: 'Advanced',
      action: () => {
        // Pass form data if switching from AI mode
        if (hasFormData && urlParams) {
          const queryString = urlParams.toString()
          router.push(`/auras/create?${queryString}`)
        } else {
          router.push('/auras/create')
        }
      },
      badge: 'Pro'
    }
  ]

  return (
    <SubscriptionGuard feature="maxAuras">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-6">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Create Your Digital Aura
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-4">
            Start your journey with a powerful digital AI companion. Physical vessels coming soon!
          </p>
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
            <Rocket className="w-4 h-4" />
            Launch Special: Digital Auras are completely free
          </div>
        </div>

        {/* Creation Methods */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {creationMethods.map((method) => (
            <Card key={method.id} className="relative overflow-hidden border-2 hover:border-gray-300 transition-all duration-300 hover:shadow-lg">
              {method.badge && (
                <div className="absolute top-4 right-4">
                  <Badge className={`bg-gradient-to-r ${method.gradient} text-white border-0`}>
                    {method.badge}
                  </Badge>
                </div>
              )}
              
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${method.gradient} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <method.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-1">{method.title}</CardTitle>
                    <p className="text-sm text-gray-500 font-medium">{method.subtitle}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <p className="text-gray-600 leading-relaxed">
                  {method.description}
                </p>

                {/* Features */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-gray-900">What you'll get:</h4>
                  <ul className="space-y-1">
                    {method.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <div className={`w-1.5 h-1.5 bg-gradient-to-r ${method.gradient} rounded-full`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {method.time}
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {method.difficulty}
                  </div>
                </div>

                {/* Action Button */}
                <Button 
                  onClick={method.action}
                  className={`w-full bg-gradient-to-r ${method.gradient} hover:opacity-90 transition-opacity`}
                  size="lg"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Coming Soon Section */}
        <Card className="bg-gradient-to-r from-orange-50 to-pink-50 border-orange-200 mb-8">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full mb-4">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Physical Vessels Coming Soon!</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We're working on beautiful physical vessels that will bring your Aura into the real world. 
                Start with digital now and upgrade later!
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {COMING_SOON_VESSELS.map((vessel) => (
                <div key={vessel.id} className="text-center p-4 bg-white/60 rounded-lg border border-orange-200/50">
                  <div className="text-3xl mb-2">{vessel.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-1">{vessel.name}</h3>
                  <p className="text-xs text-gray-600 mb-2">{vessel.description}</p>
                  {vessel.price && (
                    <div className="text-sm font-medium text-orange-600">
                      Starting at ${vessel.price}
                    </div>
                  )}
                  <Badge variant="secondary" className="mt-2 text-xs">
                    Coming Soon
                  </Badge>
                </div>
              ))}
            </div>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-500 mb-4">
                Want to be notified when physical vessels launch?
              </p>
              <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                <Star className="w-4 h-4 mr-2" />
                Join the Waitlist
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">💡 Why start with digital?</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">
                  Digital Auras are fully-featured AI companions that live in the cloud. They can connect to all your data, 
                  learn your preferences, and provide intelligent responses. When physical vessels launch, 
                  you'll be able to transfer your Aura seamlessly!
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Heart className="w-3 h-3" />
                  Your Aura's personality and memories will transfer to any future vessel
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </SubscriptionGuard>
  )
}