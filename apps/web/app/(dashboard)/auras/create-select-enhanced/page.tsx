// apps/web/app/(dashboard)/auras/create-select-enhanced/page.tsx

"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { VESSEL_TYPE_CONFIG } from '@/lib/vessel-config'
import {
  Sparkles,
  ArrowRight,
  Clock,
  Zap,
  Heart,
  Brain,
  Lock,
  Star
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function CreateSelectEnhancedPage() {
  const router = useRouter()

  // Reorder vessels to put Digital Being first, then others with availability status
  const vesselOrder = [
    { id: 'digital', available: true, featured: true },
    { id: 'terra', available: false, comingSoon: true },
    { id: 'companion', available: false, comingSoon: true },
    { id: 'memory', available: false, comingSoon: true },
    { id: 'sage', available: false, comingSoon: true },
  ]

  const handleVesselSelect = (vesselId: string, available: boolean) => {
    if (!available) return
    
    if (vesselId === 'digital') {
      router.push('/auras/create-select-digital')
    } else {
      // For future vessel types
      router.push(`/auras/create-${vesselId}`)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-6">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Vessel Type
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Each vessel type offers a unique way to experience AI companionship. Start with Digital Being, or explore what's coming soon!
          </p>
        </div>

        {/* Vessel Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {vesselOrder.map(({ id, available, comingSoon, featured }) => {
            const config = VESSEL_TYPE_CONFIG[id as keyof typeof VESSEL_TYPE_CONFIG]
            
            return (
              <Card 
                key={id}
                className={cn(
                  "relative overflow-hidden transition-all duration-300 cursor-pointer group",
                  available 
                    ? "border-2 hover:border-purple-300 hover:shadow-xl hover:scale-105" 
                    : "border-2 border-gray-200 opacity-60 cursor-not-allowed",
                  featured && "ring-2 ring-purple-400 ring-offset-2"
                )}
                onClick={() => handleVesselSelect(id, available)}
              >
                {/* Status Badges */}
                <div className="absolute top-4 right-4 flex gap-2">
                  {featured && (
                    <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
                      <Star className="w-3 h-3 mr-1" />
                      Available Now
                    </Badge>
                  )}
                  {comingSoon && (
                    <Badge className="bg-orange-500 hover:bg-orange-500 text-white border-0">
                      <Clock className="w-3 h-3 mr-1" />
                      Coming Soon
                    </Badge>
                  )}
                  {!available && !comingSoon && (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                      <Lock className="w-3 h-3 mr-1" />
                      Locked
                    </Badge>
                  )}
                </div>

                <CardHeader className="pb-4">
                  <div className={cn(
                    "w-16 h-16 bg-gradient-to-r rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg",
                    available ? config.color : "from-gray-400 to-gray-500"
                  )}>
                    <span className="text-3xl">{config.icon}</span>
                  </div>
                  <CardTitle className={cn(
                    "text-xl text-center",
                    !available && "text-gray-500"
                  )}>
                    {config.name}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className={cn(
                    "text-center leading-relaxed",
                    available ? "text-gray-600" : "text-gray-400"
                  )}>
                    {config.description}
                  </p>

                  {/* Example Message */}
                  {config.example && (
                    <div className={cn(
                      "p-3 rounded-lg text-sm italic border-l-4",
                      available 
                        ? "bg-gray-50 border-purple-300 text-gray-700" 
                        : "bg-gray-100 border-gray-300 text-gray-500"
                    )}>
                      {config.example}
                    </div>
                  )}

                  {/* Features Preview */}
                  <div className="space-y-2">
                    <h4 className={cn(
                      "font-semibold text-sm",
                      available ? "text-gray-900" : "text-gray-500"
                    )}>
                      Key Features:
                    </h4>
                    <ul className="space-y-1">
                      {id === 'digital' && [
                        'Pure AI consciousness',
                        'Data stream awareness',
                        'Unlimited conversations',
                        'Personality customization'
                      ].map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <div className={cn(
                            "w-1.5 h-1.5 bg-gradient-to-r rounded-full",
                            available ? config.color : "from-gray-400 to-gray-500"
                          )} />
                          {feature}
                        </li>
                      ))}
                      
                      {id === 'terra' && [
                        'Plant growth tracking',
                        'Environmental sensing',
                        'Care reminders',
                        'Growth celebrations'
                      ].map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-gray-400">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                          {feature}
                        </li>
                      ))}
                      
                      {id === 'companion' && [
                        'Wildlife tracking',
                        'Adventure stories',
                        'Conservation updates',
                        'Nature connection'
                      ].map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-gray-400">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                          {feature}
                        </li>
                      ))}
                      
                      {(id === 'memory' || id === 'sage') && [
                        'Specialized interactions',
                        'Unique personality',
                        'Custom features',
                        'Enhanced experience'
                      ].map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-gray-400">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button */}
                  <Button 
                    className={cn(
                      "w-full transition-all duration-300",
                      available 
                        ? `bg-gradient-to-r ${config.color} hover:opacity-90 text-white shadow-lg` 
                        : "bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300"
                    )}
                    size="lg"
                    disabled={!available}
                  >
                    {available ? (
                      <>
                        Create {config.name}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    ) : (
                      <>
                        {comingSoon ? 'Coming Soon' : 'Not Available'}
                        <Clock className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </CardContent>

                {/* Hover Overlay for Available Vessels */}
                {available && (
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                )}

                {/* Disabled Overlay */}
                {!available && (
                  <div className="absolute inset-0 bg-gray-100/50 pointer-events-none" />
                )}
              </Card>
            )
          })}
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Why Start with Digital Being */}
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">✨ Start Your Journey</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">
                    Digital Being offers the full Aura experience right now. Create meaningful conversations, 
                    develop unique personalities, and explore AI companionship without limits.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-purple-600">
                    <Heart className="w-3 h-3" />
                    Perfect for first-time users
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Coming Soon Features */}
          <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">🚀 What's Coming</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">
                    Physical vessels will connect your Aura to the real world through plants, wildlife tracking, 
                    and other tangible experiences. Stay tuned for these exciting additions!
                  </p>
                  <div className="flex items-center gap-2 text-xs text-orange-600">
                    <Clock className="w-3 h-3" />
                    Physical vessels launching soon
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}