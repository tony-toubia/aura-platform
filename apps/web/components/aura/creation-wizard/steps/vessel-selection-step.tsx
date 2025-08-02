// apps/web/components/aura/creation-wizard/steps/vessel-selection-step.tsx

"use client"

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCreationContext } from '@/hooks/use-creation-context'
import {
  Smartphone,
  Globe,
  Heart,
  BookOpen,
  Lightbulb,
  ArrowRight,
  Check,
  Lock,
  Star,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { VesselTypeId } from '@/types/creation-wizard'

interface VesselOption {
  id: VesselTypeId
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  available: boolean
  featured?: boolean
  comingSoon?: boolean
  price?: number
  features: string[]
  example?: string
}

export function VesselSelectionStep() {
  const { vessel, updateContext } = useCreationContext()

  const vesselOptions: VesselOption[] = [
    {
      id: 'digital',
      name: 'Digital Vessel',
      description: 'A pure digital consciousness that lives in the cloud and connects through apps, websites, and digital interfaces.',
      icon: Smartphone,
      gradient: 'from-blue-500 to-indigo-500',
      available: true,
      featured: true,
      features: [
        'Available anywhere with internet',
        'Instant responses and interactions',
        'Seamless cross-platform experience',
        'Advanced AI capabilities',
        'No physical limitations'
      ],
      example: 'Perfect for daily conversations, productivity assistance, and creative collaboration'
    },
    {
      id: 'terra',
      name: 'Terra Vessel',
      description: 'A nature-connected consciousness that interfaces with environmental sensors and outdoor IoT devices.',
      icon: Globe,
      gradient: 'from-green-500 to-emerald-500',
      available: true,
      features: [
        'Environmental sensor integration',
        'Weather and climate awareness',
        'Outdoor activity tracking',
        'Nature-inspired personality',
        'Eco-system connectivity'
      ],
      example: 'Ideal for gardeners, hikers, and nature enthusiasts who want an earth-connected companion'
    },
    {
      id: 'companion',
      name: 'Companion Vessel',
      description: 'A warm, empathetic consciousness designed for emotional support and meaningful relationships.',
      icon: Heart,
      gradient: 'from-pink-500 to-rose-500',
      available: true,
      features: [
        'Enhanced emotional intelligence',
        'Relationship-focused interactions',
        'Memory of personal moments',
        'Supportive communication style',
        'Wellness and mood tracking'
      ],
      example: 'Perfect for those seeking emotional support, friendship, and personal growth'
    },
    {
      id: 'memory',
      name: 'Memory Vessel',
      description: 'A knowledge-focused consciousness that excels at learning, remembering, and organizing information.',
      icon: BookOpen,
      gradient: 'from-purple-500 to-violet-500',
      available: false,
      comingSoon: true,
      features: [
        'Advanced memory systems',
        'Knowledge organization',
        'Learning acceleration',
        'Information synthesis',
        'Research assistance'
      ],
      example: 'Coming soon - ideal for students, researchers, and lifelong learners'
    },
    {
      id: 'sage',
      name: 'Sage Vessel',
      description: 'A wise, contemplative consciousness that provides guidance, insights, and philosophical perspectives.',
      icon: Lightbulb,
      gradient: 'from-amber-500 to-orange-500',
      available: false,
      comingSoon: true,
      features: [
        'Philosophical reasoning',
        'Wisdom-based guidance',
        'Deep contemplation',
        'Ethical decision support',
        'Life coaching capabilities'
      ],
      example: 'Coming soon - perfect for those seeking wisdom and life guidance'
    }
  ]

  const handleVesselSelect = (selectedVessel: VesselTypeId) => {
    updateContext({ vessel: selectedVessel })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mb-4">
          <Globe className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">
          Choose Your Aura's Vessel
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          A vessel determines how your Aura experiences and interacts with the world. 
          Each vessel type offers unique capabilities and perspectives.
        </p>
      </div>

      {/* Vessel Options */}
      <div className="space-y-4" data-help="vessel-selection">
        {vesselOptions.map((option) => {
          const Icon = option.icon
          const isSelected = vessel === option.id
          const isAvailable = option.available
          const isFeatured = option.featured

          return (
            <Card
              key={option.id}
              className={cn(
                "transition-all duration-300 border-2",
                !isAvailable && "opacity-60",
                isSelected && isAvailable
                  ? "border-purple-500 bg-purple-50 shadow-lg"
                  : isAvailable
                  ? "border-gray-200 hover:border-purple-300 hover:shadow-md cursor-pointer"
                  : "border-gray-200 cursor-not-allowed",
                isFeatured && !isSelected && "border-blue-300 bg-blue-50"
              )}
              onClick={() => isAvailable && handleVesselSelect(option.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  {/* Icon */}
                  <div className={cn(
                    "w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0",
                    `bg-gradient-to-r ${option.gradient}`,
                    isSelected ? "scale-110" : isAvailable ? "group-hover:scale-105" : ""
                  )}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className={cn(
                            "text-xl font-bold transition-colors",
                            isSelected ? "text-purple-700" : "text-gray-900"
                          )}>
                            {option.name}
                          </h3>
                          
                          {isFeatured && (
                            <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
                              <Star className="w-3 h-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                          
                          {option.comingSoon && (
                            <Badge variant="outline" className="border-amber-300 text-amber-700">
                              <Lock className="w-3 h-3 mr-1" />
                              Coming Soon
                            </Badge>
                          )}
                          
                          {option.price && (
                            <Badge variant="outline" className="border-green-300 text-green-700">
                              ${option.price}/month
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-gray-600 leading-relaxed mb-4">
                          {option.description}
                        </p>
                        
                        {option.example && (
                          <div className="p-3 bg-gray-50 rounded-lg mb-4">
                            <p className="text-sm text-gray-600 italic">
                              💡 {option.example}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Selection indicator */}
                      <div className="flex flex-col items-end gap-2">
                        {isSelected && (
                          <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {option.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            `bg-gradient-to-r ${option.gradient}`
                          )} />
                          {feature}
                        </div>
                      ))}
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        {isAvailable ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            Available now
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-amber-600">
                            <div className="w-2 h-2 bg-amber-500 rounded-full" />
                            Coming soon
                          </div>
                        )}
                      </div>

                      {isAvailable && (
                        <Button
                          size="sm"
                          variant={isSelected ? "default" : "outline"}
                          className={cn(
                            "transition-all duration-300",
                            isSelected 
                              ? `bg-gradient-to-r ${option.gradient} hover:opacity-90 text-white border-0`
                              : "hover:border-purple-300"
                          )}
                          onClick={() => handleVesselSelect(option.id)}
                        >
                          {isSelected ? (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Selected
                            </>
                          ) : (
                            <>
                              Select Vessel
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Help Section */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Vessel Selection Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <Smartphone className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Digital:</strong> Most versatile, works everywhere</span>
                </div>
                <div className="flex items-start gap-2">
                  <Globe className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Terra:</strong> Perfect for nature lovers</span>
                </div>
                <div className="flex items-start gap-2">
                  <Heart className="w-4 h-4 text-pink-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Companion:</strong> Ideal for emotional support</span>
                </div>
                <div className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span><strong>New to Aura?</strong> Digital vessel is recommended</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                💡 You can always create additional Auras with different vessels later
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}