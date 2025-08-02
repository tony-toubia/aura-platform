// apps/web/components/aura/creation-wizard/steps/review-step.tsx

"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCreationContext } from '@/hooks/use-creation-context'
import {
  CheckCircle,
  Edit,
  Sparkles,
  Heart,
  Brain,
  Zap,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function ReviewStep() {
  const creationContext = useCreationContext()
  const { configuration, method, vessel } = creationContext

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">
          Review Your Aura
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Take a final look at {configuration.name || 'your Aura'} before bringing them to life. 
          You can always make changes later.
        </p>
      </div>

      {/* Configuration Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-6 text-center">
            <Brain className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-purple-900 mb-2">Identity</h3>
            <p className="text-lg font-medium text-gray-900">{configuration.name || 'Unnamed Aura'}</p>
            <p className="text-sm text-gray-600 capitalize">{vessel || 'digital'} vessel</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <Heart className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-blue-900 mb-2">Personality</h3>
            <p className="text-sm text-gray-600 mb-2">
              {configuration.personality.tone} • {configuration.personality.vocabulary}
            </p>
            <div className="flex justify-center gap-1">
              {configuration.personality.quirks.slice(0, 2).map((quirk, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {quirk}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6 text-center">
            <Zap className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-green-900 mb-2">Capabilities</h3>
            <p className="text-lg font-medium text-gray-900">{configuration.senses.length}</p>
            <p className="text-sm text-gray-600">connected senses</p>
            <p className="text-lg font-medium text-gray-900 mt-2">{configuration.rules.length}</p>
            <p className="text-sm text-gray-600">behavior rules</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Configuration */}
      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Basic Information
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {method === 'ai' ? 'AI-Guided' : 'Manual'} Setup
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Name</label>
                <p className="text-gray-900">{configuration.name || 'Not set'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Vessel Type</label>
                <p className="text-gray-900 capitalize">{vessel || 'digital'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Communication Style</label>
                <p className="text-gray-900 capitalize">{configuration.personality.tone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Vocabulary Level</label>
                <p className="text-gray-900 capitalize">{configuration.personality.vocabulary}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personality Traits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-600" />
              Personality Traits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(configuration.personality).map(([trait, value]) => {
                if (typeof value === 'number') {
                  return (
                    <div key={trait} className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-sm font-medium text-gray-700 capitalize">
                          {trait}
                        </label>
                        <span className="text-sm text-gray-600">{value}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  )
                }
                return null
              })}
            </div>
          </CardContent>
        </Card>

        {/* Connected Senses */}
        {configuration.senses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-600" />
                Connected Senses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {configuration.senses.map((sense, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {sense.replace('_', ' ').replace('.', ': ')}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Behavior Rules */}
        {configuration.rules.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-green-600" />
                Behavior Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {configuration.rules.map((rule, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{rule.name}</h4>
                      <Badge 
                        variant={rule.enabled ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {rule.enabled ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      When {rule.trigger.sensor} {rule.trigger.operator} {rule.trigger.value}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Final Check */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Ready to Bring Your Aura to Life?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            {configuration.name} is configured and ready to start their journey with you. 
            They'll learn and grow as you interact together.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Personality configured</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Senses connected</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Ready to chat</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}