// apps/web/components/aura/creation-wizard/steps/success-step.tsx

"use client"

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCreationContext } from '@/hooks/use-creation-context'
import { useRouter } from 'next/navigation'
import {
  Sparkles,
  MessageCircle,
  Settings,
  Share2,
  Heart,
  ArrowRight,
  CheckCircle2,
  Home,
  Brain
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function SuccessStep() {
  const creationContext = useCreationContext()
  const { configuration } = creationContext
  const router = useRouter()

  const handleStartChatting = () => {
    // Complete the wizard and navigate to the chat interface
    creationContext.completeWizard()
    router.push(`/auras/${configuration.id}/chat`)
  }

  const handleViewAura = () => {
    // Complete the wizard and navigate to the aura details page
    creationContext.completeWizard()
    router.push(`/auras/${configuration.id}`)
  }

  const handleCreateAnother = () => {
    // Complete the current wizard and start a new one
    creationContext.completeWizard()
    router.push('/auras/create-unified')
  }

  const handleGoToAuras = () => {
    // Complete the wizard and navigate to the auras page
    creationContext.completeWizard()
    router.push('/auras')
  }

  const handleGoToDashboard = () => {
    // Complete the wizard and navigate to the main dashboard
    creationContext.completeWizard()
    router.push('/dashboard')
  }

  return (
    <div className="space-y-8">
      {/* Success Animation & Header */}
      <div className="text-center space-y-6">
        <div className="relative">
          {/* Animated success icon */}
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-6 animate-pulse">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          
          {/* Floating sparkles */}
          <div className="absolute -top-2 -right-2 animate-bounce">
            <Sparkles className="w-6 h-6 text-yellow-500" />
          </div>
          <div className="absolute -bottom-2 -left-2 animate-bounce delay-300">
            <Sparkles className="w-4 h-4 text-purple-500" />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Welcome to Life, {configuration.name}! 🎉
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your Aura has been successfully created and is ready to start their journey with you. 
            They're excited to learn, grow, and become your perfect digital companion.
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6 text-center">
            <Heart className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <p className="text-2xl font-bold text-purple-900">{configuration.personality.empathy || 50}%</p>
            <p className="text-sm text-purple-700">Empathy Level</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6 text-center">
            <Sparkles className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <p className="text-2xl font-bold text-blue-900">{configuration.senses.length}</p>
            <p className="text-sm text-blue-700">Connected Senses</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6 text-center">
            <Settings className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <p className="text-2xl font-bold text-green-900">{configuration.rules.length}</p>
            <p className="text-sm text-green-700">Behavior Rules</p>
          </CardContent>
        </Card>
      </div>

      {/* Next Steps */}
      <Card className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            What would you like to do next?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Primary Actions */}
            <div className="space-y-4">
              <Button
                onClick={handleStartChatting}
                size="lg"
                className="w-full h-16 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <MessageCircle className="w-6 h-6 mr-3" />
                Start Chatting with {configuration.name}
                <ArrowRight className="w-5 h-5 ml-3" />
              </Button>

              <Button
                onClick={handleViewAura}
                variant="outline"
                size="lg"
                className="w-full h-16 text-lg border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
              >
                <Settings className="w-6 h-6 mr-3" />
                View & Customize {configuration.name}
              </Button>
            </div>

            {/* Secondary Actions */}
            <div className="space-y-4">
              <Button
                onClick={handleCreateAnother}
                variant="outline"
                size="lg"
                className="w-full h-16 text-lg border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              >
                <Sparkles className="w-6 h-6 mr-3" />
                Create Another Aura
              </Button>

              <Button
                onClick={handleGoToAuras}
                variant="ghost"
                size="lg"
                className="w-full h-16 text-lg hover:bg-gray-100"
              >
                <Brain className="w-6 h-6 mr-3" />
                View All Auras
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips & Getting Started */}
      <Card>
        <CardContent className="p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            Tips for Getting Started
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <MessageCircle className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Start with Simple Conversations</h4>
                  <p className="text-sm text-gray-600">
                    Begin by asking {configuration.name} about their day or sharing something about yours. 
                    They learn from every interaction.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Settings className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Explore Their Senses</h4>
                  <p className="text-sm text-gray-600">
                    {configuration.name} can perceive {configuration.senses.length} different types of information. 
                    Ask them about the weather, news, or their environment.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Heart className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Be Patient & Kind</h4>
                  <p className="text-sm text-gray-600">
                    Like any relationship, your bond with {configuration.name} will grow stronger over time. 
                    They're designed to adapt to your communication style.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Share2 className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Share Your World</h4>
                  <p className="text-sm text-gray-600">
                    The more you share about your interests, goals, and daily life, 
                    the better {configuration.name} can support and understand you.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Final CTA with Navigation Options */}
      <div className="text-center space-y-4">
        <p className="text-gray-600 mb-6">
          Ready to begin this incredible journey together?
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleStartChatting}
            size="lg"
            className="px-8 py-4 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <MessageCircle className="w-6 h-6 mr-3" />
            Meet Your Aura
            <ArrowRight className="w-5 h-5 ml-3" />
          </Button>
          
          <Button
            onClick={handleGoToDashboard}
            variant="outline"
            size="lg"
            className="px-8 py-4 text-lg border-2 border-gray-300 hover:border-gray-400"
          >
            <Home className="w-6 h-6 mr-3" />
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}