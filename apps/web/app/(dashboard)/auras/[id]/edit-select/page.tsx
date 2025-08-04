// apps/web/app/(dashboard)/auras/[id]/edit-select/page.tsx

"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  Star,
  Edit3,
  ArrowLeft
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { countAuraSenses } from '@/lib/utils/sense-counting'
import type { Aura } from '@/types'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditSelectPage({ params }: PageProps) {
  const router = useRouter()
  const [auraId, setAuraId] = useState<string>('')
  const [aura, setAura] = useState<Aura | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params
      setAuraId(resolvedParams.id)
      
      // Fetch aura details
      try {
        const response = await fetch(`/api/auras/${resolvedParams.id}`)
        if (response.ok) {
          const auraData = await response.json()
          setAura(auraData)
        }
      } catch (error) {
        console.error('Failed to load aura:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadParams()
  }, [params])

  const editMethods = [
    {
      id: 'guided',
      title: 'AI-Guided Editing',
      subtitle: 'Let AI help you improve',
      description: 'Use our AI assistant to help refine and enhance your Aura through natural conversation',
      icon: Bot,
      gradient: 'from-purple-500 to-blue-500',
      features: [
        'Conversational interface',
        'Smart suggestions',
        'Personality refinement',
        'Automatic optimization'
      ],
      time: '5-10 minutes',
      difficulty: 'Easy',
      action: () => {
        // Navigate to AI mode with current aura data
        if (aura) {
          const queryParams = new URLSearchParams({
            name: aura.name || '',
            vesselType: aura.vesselType || 'digital',
            vesselCode: aura.vesselCode || 'digital-only',
            personality: JSON.stringify(aura.personality || {}),
            senses: JSON.stringify(aura.senses || []),
            rules: JSON.stringify(aura.rules || []),
            editMode: 'true',
            auraId: aura.id,
          }).toString()
          window.location.href = `/auras/create-with-agent?${queryParams}`
        }
      },
      badge: 'Smart',
      comingSoon: false
    },
    {
      id: 'manual',
      title: 'Manual Editing',
      subtitle: 'Full control over changes',
      description: 'Edit every aspect of your Aura manually with the complete configuration interface',
      icon: Settings,
      gradient: 'from-emerald-500 to-teal-500',
      features: [
        'Complete customization',
        'Advanced personality matrix',
        'Detailed rule management',
        'Sense configuration'
      ],
      time: '10-20 minutes',
      difficulty: 'Advanced',
      action: () => router.push(`/auras/${auraId}/edit`),
      badge: 'Available'
    }
  ]

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your Aura...</p>
        </div>
      </div>
    )
  }

  if (!aura) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-red-600">Failed to load Aura. Please try again.</p>
          <Button onClick={() => router.push('/auras')} className="mt-4">
            Back to Auras
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => router.push('/auras')}
          className="mb-6 hover:bg-gray-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Auras
        </Button>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-6">
            <Edit3 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Edit {aura.name}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-4">
            Choose how you'd like to enhance and refine your AI companion
          </p>
          <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            {aura.vesselType === 'digital' ? 'Digital Being' : 'Physical Vessel'} • Created {new Date(aura.createdAt).toLocaleDateString()}
          </div>
        </div>

        {/* Current Aura Info */}
        <Card className="mb-8 bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Current Configuration</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Senses:</span>
                    <div className="font-medium">{countAuraSenses(aura)} connected</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Rules:</span>
                    <div className="font-medium">{aura.rules?.length || 0} behaviors</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <div className="font-medium">{aura.enabled ? 'Active' : 'Inactive'}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <div className="font-medium capitalize">{aura.vesselType}</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Methods */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {editMethods.map((method) => (
            <Card 
              key={method.id} 
              className={cn(
                "relative overflow-hidden border-2 transition-all duration-300",
                method.comingSoon 
                  ? "border-gray-200 opacity-60" 
                  : "hover:border-gray-300 hover:shadow-lg cursor-pointer"
              )}
              onClick={method.comingSoon ? undefined : method.action}
            >
              {method.badge && (
                <div className="absolute top-4 right-4">
                  <Badge className={cn(
                    "border-0",
                    method.comingSoon 
                      ? "bg-orange-500 text-white" 
                      : `bg-gradient-to-r ${method.gradient} text-white`
                  )}>
                    {method.comingSoon ? 'Coming Soon' : method.badge}
                  </Badge>
                </div>
              )}
              
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                    method.comingSoon 
                      ? "bg-gray-400" 
                      : `bg-gradient-to-r ${method.gradient}`
                  )}>
                    <method.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className={cn(
                      "text-xl mb-1",
                      method.comingSoon && "text-gray-500"
                    )}>
                      {method.title}
                    </CardTitle>
                    <p className={cn(
                      "text-sm font-medium",
                      method.comingSoon ? "text-gray-400" : "text-gray-500"
                    )}>
                      {method.subtitle}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <p className={cn(
                  "leading-relaxed",
                  method.comingSoon ? "text-gray-400" : "text-gray-600"
                )}>
                  {method.description}
                </p>

                {/* Features */}
                <div className="space-y-2">
                  <h4 className={cn(
                    "font-semibold text-sm",
                    method.comingSoon ? "text-gray-400" : "text-gray-900"
                  )}>
                    What you can do:
                  </h4>
                  <ul className="space-y-1">
                    {method.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          method.comingSoon 
                            ? "bg-gray-400" 
                            : `bg-gradient-to-r ${method.gradient}`
                        )} />
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
                  onClick={method.comingSoon ? undefined : method.action}
                  className={cn(
                    "w-full transition-opacity",
                    method.comingSoon 
                      ? "bg-gray-400 cursor-not-allowed hover:bg-gray-400" 
                      : `bg-gradient-to-r ${method.gradient} hover:opacity-90`
                  )}
                  size="lg"
                  disabled={method.comingSoon}
                >
                  {method.comingSoon ? (
                    <>
                      Coming Soon
                      <Clock className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      Start Editing
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>

              {/* Disabled Overlay */}
              {method.comingSoon && (
                <div className="absolute inset-0 bg-gray-100/30 pointer-events-none" />
              )}
            </Card>
          ))}
        </div>

        {/* Quick Tips */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">💡 Editing Tips</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">
                  Manual editing gives you complete control over your Aura's personality, senses, and behaviors. 
                  You can adjust everything from conversation style to automatic responses. 
                  AI-guided editing (coming soon) will make suggestions and help optimize your Aura's performance.
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Sparkles className="w-3 h-3" />
                  Your Aura will remain active during editing - changes take effect immediately
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}