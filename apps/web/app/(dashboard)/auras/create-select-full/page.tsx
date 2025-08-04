// apps/web/app/(dashboard)/auras/create-select/page.tsx

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
  Wand2
} from 'lucide-react'

export default function CreateSelectPage() {
  const router = useRouter()

  const creationMethods = [
    {
      id: 'agent',
      title: 'AI-Guided Creation',
      subtitle: 'Recommended for beginners',
      description: 'Let our AI assistant guide you through creating the perfect Aura with natural conversation',
      icon: Bot,
      gradient: 'from-purple-500 to-blue-500',
      features: [
        'Natural conversation interface',
        'Personalized recommendations',
        'Automatic configuration',
        'Smart vessel selection'
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
      description: 'Configure every aspect of your Aura manually with advanced options and precise control',
      icon: Settings,
      gradient: 'from-emerald-500 to-teal-500',
      features: [
        'Complete customization',
        'Advanced personality matrix',
        'Detailed rule builder',
        'Expert vessel options'
      ],
      time: '10-20 minutes',
      difficulty: 'Advanced',
      action: () => router.push('/auras/create'),
      badge: 'Pro'
    }
  ]

  return (
    <SubscriptionGuard feature="maxAuras">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-6">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Create Your Aura
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose how you'd like to bring your AI companion to life. Both paths lead to the same powerful result!
          </p>
        </div>

        {/* Creation Methods */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
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

        {/* Quick Tips */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">💡 Not sure which to choose?</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">
                  Start with <strong>AI-Guided Creation</strong> for a smooth, conversational experience. 
                  You can always fine-tune your Aura later using the manual editor!
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Heart className="w-3 h-3" />
                  Both methods create equally powerful Auras
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