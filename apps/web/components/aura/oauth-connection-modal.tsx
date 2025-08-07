// components/aura/oauth-connection-modal.tsx
"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  Activity,
  Moon,
  MapPin,
  Shield,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { GoogleCalendarOAuth } from "@/lib/oauth/google-calendar"
import { MicrosoftOutlookOAuth } from "@/lib/oauth/microsoft-outlook"

export type PersonalSenseType = 'calendar' | 'fitness' | 'sleep' | 'location'

export type OAuthProvider = {
  id: string
  name: string
  icon: React.ComponentType<any>
  description: string
  color: string
  bgColor: string
  popular?: boolean
}

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error'

interface OAuthConnectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  senseType: PersonalSenseType
  onConnectionComplete: (provider: string) => void
  onCancel: () => void
}

// OAuth providers for different sense types
const OAUTH_PROVIDERS: Record<PersonalSenseType, OAuthProvider[]> = {
  calendar: [
    {
      id: 'google',
      name: 'Google Calendar',
      icon: Calendar,
      description: 'Connect your Google Calendar events and schedules',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      popular: true,
    },
    {
      id: 'outlook',
      name: 'Microsoft Outlook',
      icon: Calendar,
      description: 'Sync your Outlook calendar and appointments',
      color: 'from-blue-600 to-indigo-600',
      bgColor: 'bg-indigo-50',
      popular: true,
    },
    {
      id: 'apple',
      name: 'Apple Calendar',
      icon: Calendar,
      description: 'Import your iCloud calendar events',
      color: 'from-gray-700 to-gray-800',
      bgColor: 'bg-gray-50',
    },
    {
      id: 'calendly',
      name: 'Calendly',
      icon: Calendar,
      description: 'Connect your Calendly scheduled meetings',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
    },
  ],
  fitness: [
    {
      id: 'apple_health',
      name: 'Apple Health',
      icon: Activity,
      description: 'Sync your iPhone health and activity data',
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-50',
      popular: true,
    },
    {
      id: 'google_fit',
      name: 'Google Fit',
      icon: Activity,
      description: 'Connect your Google Fit activity tracking',
      color: 'from-green-500 to-blue-500',
      bgColor: 'bg-green-50',
      popular: true,
    },
    {
      id: 'fitbit',
      name: 'Fitbit',
      icon: Activity,
      description: 'Import your Fitbit health and fitness data',
      color: 'from-teal-500 to-cyan-500',
      bgColor: 'bg-teal-50',
    },
    {
      id: 'strava',
      name: 'Strava',
      icon: Activity,
      description: 'Connect your Strava workouts and activities',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
    },
  ],
  sleep: [
    {
      id: 'apple_health',
      name: 'Apple Health',
      icon: Moon,
      description: 'Import your iPhone sleep tracking data',
      color: 'from-purple-500 to-blue-500',
      bgColor: 'bg-purple-50',
      popular: true,
    },
    {
      id: 'google_fit',
      name: 'Google Fit',
      icon: Moon,
      description: 'Sync your Google Fit sleep data',
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'bg-indigo-50',
    },
    {
      id: 'oura',
      name: 'Oura Ring',
      icon: Moon,
      description: 'Connect your Oura sleep and recovery data',
      color: 'from-gray-800 to-black',
      bgColor: 'bg-gray-50',
      popular: true,
    },
    {
      id: 'whoop',
      name: 'WHOOP',
      icon: Moon,
      description: 'Import your WHOOP recovery and sleep metrics',
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50',
    },
  ],
  location: [
    {
      id: 'google_maps',
      name: 'Google Maps',
      icon: MapPin,
      description: 'Share your location timeline and places',
      color: 'from-green-500 to-blue-500',
      bgColor: 'bg-green-50',
      popular: true,
    },
    {
      id: 'apple_maps',
      name: 'Apple Maps',
      icon: MapPin,
      description: 'Connect your significant locations data',
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'bg-blue-50',
    },
  ],
}

const SENSE_CONFIG = {
  calendar: {
    title: 'Connect Your Calendar',
    description: 'Let your Aura understand your schedule, meetings, and availability to provide more contextual responses.',
    icon: Calendar,
    color: 'text-blue-600',
  },
  fitness: {
    title: 'Connect Your Fitness Data',
    description: 'Share your activity, workouts, and health metrics so your Aura can understand your wellness journey.',
    icon: Activity,
    color: 'text-green-600',
  },
  sleep: {
    title: 'Connect Your Sleep Data',
    description: 'Help your Aura understand your rest patterns and energy levels for better personalized interactions.',
    icon: Moon,
    color: 'text-purple-600',
  },
  location: {
    title: 'Connect Your Location',
    description: 'Allow your Aura to understand your movement patterns and favorite places for location-aware responses.',
    icon: MapPin,
    color: 'text-orange-600',
  },
}

export function OAuthConnectionModal({
  open,
  onOpenChange,
  senseType,
  onConnectionComplete,
  onCancel,
}: OAuthConnectionModalProps) {
  const [connectionStatus, setConnectionStatus] = useState<Record<string, ConnectionStatus>>({})
  
  const senseConfig = SENSE_CONFIG[senseType]
  const providers = OAUTH_PROVIDERS[senseType] || []
  
  const handleConnect = async (providerId: string) => {
    setConnectionStatus(prev => ({ ...prev, [providerId]: 'connecting' }))
    
    try {
      if (providerId === 'google' && senseType === 'calendar') {
        // Real Google Calendar OAuth
        const { ConfigService } = await import('@/lib/services/config-service')
        const clientId = await ConfigService.getGoogleClientId()
        
        if (!clientId) {
          throw new Error('Google Client ID not configured. Please add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your environment variables.')
        }

        const googleOAuth = new GoogleCalendarOAuth({
          clientId,
          redirectUri: `${window.location.origin}/api/auth/google/callback`,
          scopes: [
            'https://www.googleapis.com/auth/calendar.readonly',
            'https://www.googleapis.com/auth/calendar.events.readonly'
          ]
        })

        // Initiate OAuth flow and get tokens
        const tokenResponse = await googleOAuth.initiateOAuth()
        
        // Log success (remove sensitive data in production)
        console.log('Google Calendar connected successfully!', {
          access_token: tokenResponse.access_token?.substring(0, 10) + '...',
          expires_in: tokenResponse.expires_in,
          scope: tokenResponse.scope
        })
        
        setConnectionStatus(prev => ({ ...prev, [providerId]: 'connected' }))
        
        setTimeout(() => {
          onConnectionComplete(providerId)
          onOpenChange(false)
        }, 1000)
        
      } else if (providerId === 'outlook' && senseType === 'calendar') {
        // Real Microsoft Outlook OAuth
        const { ConfigService } = await import('@/lib/services/config-service')
        const clientId = await ConfigService.getMicrosoftClientId()
        
        if (!clientId) {
          throw new Error('Microsoft Client ID not configured. Please add NEXT_PUBLIC_MICROSOFT_CLIENT_ID to your environment variables.')
        }

        const microsoftOAuth = new MicrosoftOutlookOAuth({
          clientId,
          redirectUri: `${window.location.origin}/api/auth/microsoft/callback`,
          scopes: [
            'https://graph.microsoft.com/calendars.read',
            'https://graph.microsoft.com/user.read',
            'offline_access'
          ]
        })

        // Initiate OAuth flow and get tokens
        const tokenResponse = await microsoftOAuth.initiateOAuth()
        
        // Log success (remove sensitive data in production)
        console.log('Microsoft Outlook connected successfully!', {
          access_token: tokenResponse.access_token?.substring(0, 10) + '...',
          expires_in: tokenResponse.expires_in,
          scope: tokenResponse.scope
        })
        
        setConnectionStatus(prev => ({ ...prev, [providerId]: 'connected' }))
        
        setTimeout(() => {
          onConnectionComplete(providerId)
          onOpenChange(false)
        }, 1000)
        
      } else {
        // Simulate other providers
        await new Promise(resolve => setTimeout(resolve, 2000))
        setConnectionStatus(prev => ({ ...prev, [providerId]: 'connected' }))
        
        setTimeout(() => {
          onConnectionComplete(providerId)
          onOpenChange(false)
        }, 1000)
      }
      
    } catch (error) {
      console.error('OAuth connection failed:', error)
      setConnectionStatus(prev => ({ ...prev, [providerId]: 'error' }))
      
      // Show user-friendly error message
      if (error instanceof Error) {
        alert(`Connection failed: ${error.message}`)
      }
    }
  }

  const getStatusIcon = (providerId: string) => {
    const status = connectionStatus[providerId] || 'idle'
    switch (status) {
      case 'connecting':
        return <Loader2 className="w-4 h-4 animate-spin" />
      case 'connected':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <ExternalLink className="w-4 h-4" />
    }
  }

  const getButtonText = (providerId: string) => {
    const status = connectionStatus[providerId] || 'idle'
    switch (status) {
      case 'connecting':
        return 'Connecting...'
      case 'connected':
        return 'Connected!'
      case 'error':
        return 'Try Again'
      default:
        return 'Connect'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-3 rounded-xl bg-gradient-to-r text-white",
                senseConfig.color.replace('text-', 'from-').replace('-600', '-500') + ' to-' + senseConfig.color.replace('text-', '').replace('-600', '-600')
              )}>
                <senseConfig.icon className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-xl">{senseConfig.title}</DialogTitle>
                <DialogDescription className="text-base mt-1">
                  {senseConfig.description}
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Privacy Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-blue-800 mb-1">Your Privacy is Protected</p>
              <p className="text-blue-700">
                We only access the minimum data needed to enhance your Aura's understanding. 
                You can disconnect at any time, and we never share your personal data.
              </p>
            </div>
          </div>
        </div>

        {/* Provider Options */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800">Choose a provider to connect:</h3>
          
          <div className="grid gap-3">
            {providers.map((provider) => {
              const status = connectionStatus[provider.id] || 'idle'
              const isConnecting = status === 'connecting'
              const isConnected = status === 'connected'
              const hasError = status === 'error'
              
              return (
                <div
                  key={provider.id}
                  className={cn(
                    "relative border rounded-xl p-4 transition-all",
                    provider.popular && "ring-2 ring-blue-200 border-blue-300",
                    isConnected && "border-green-300 bg-green-50",
                    hasError && "border-red-300 bg-red-50",
                    !isConnected && !hasError && provider.bgColor
                  )}
                >
                  {provider.popular && (
                    <div className="absolute -top-2 left-4 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      Popular Choice
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-3 rounded-lg bg-gradient-to-r text-white",
                        provider.color
                      )}>
                        <provider.icon className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-1">
                          {provider.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {provider.description}
                        </p>
                        {(provider.id === 'google' || provider.id === 'outlook') && senseType === 'calendar' && (
                          <p className="text-xs text-green-600 mt-1 font-medium">
                            ✓ Full integration available
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => handleConnect(provider.id)}
                      disabled={isConnecting || isConnected}
                      variant={isConnected ? "outline" : "default"}
                      className={cn(
                        "min-w-[100px]",
                        isConnected && "border-green-300 text-green-700 bg-green-50",
                        hasError && "border-red-300 text-red-700 bg-red-50"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {getStatusIcon(provider.id)}
                        <span>{getButtonText(provider.id)}</span>
                      </div>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-6 border-t">
          <p className="text-sm text-gray-500">
            You can manage connected services in your account settings
          </p>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}