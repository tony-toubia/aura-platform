// components/aura/enhanced-oauth-connection-modal.tsx
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
  Trash2,
  Plus,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { GoogleCalendarOAuth } from "@/lib/oauth/google-calendar"
import { MicrosoftOutlookOAuth } from "@/lib/oauth/microsoft-outlook"
import { BrowserLocationService, type LocationConfig, type LocationData } from "@/lib/oauth/browser-location"
import { LocationConnectionModal } from "./location-connection-modal"
import { AppleHealthOAuth } from "@/lib/oauth/apple-health"
import { GoogleFitOAuth } from "@/lib/oauth/google-fit"
import { FitbitOAuth } from "@/lib/oauth/fitbit"
import { StravaOAuth } from "@/lib/oauth/strava"

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

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error' | 'disconnecting'

export interface ConnectedCalendar {
  id: string
  providerId: string
  providerName: string
  accountEmail?: string
  calendarName?: string
  connectedAt: Date
  lastSync?: Date
  deviceInfo?: {
    browser: string
    os: string
    platform: string
    language: string
    screenInfo: string
    userAgent: string
  }
}

interface EnhancedOAuthConnectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  senseType: PersonalSenseType
  onConnectionComplete: (provider: string, connectionData: any) => void
  onDisconnect: (connectionId: string) => void
  onCancel: () => void
  existingConnections?: ConnectedCalendar[]
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
      id: 'device_location',
      name: 'Device Location',
      icon: MapPin,
      description: 'Track location from this device using browser location services',
      color: 'from-green-500 to-blue-500',
      bgColor: 'bg-green-50',
      popular: true,
    },
  ],
}

const SENSE_CONFIG = {
  calendar: {
    title: 'Manage Calendar Connections',
    description: 'Connect multiple calendar services to give your Aura complete visibility into your schedule.',
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

export function EnhancedOAuthConnectionModal({
  open,
  onOpenChange,
  senseType,
  onConnectionComplete,
  onDisconnect,
  onCancel,
  existingConnections = [],
}: EnhancedOAuthConnectionModalProps) {
  const [connectionStatus, setConnectionStatus] = useState<Record<string, ConnectionStatus>>({})
  const [locationService] = useState(() => new BrowserLocationService())
  const [showLocationModal, setShowLocationModal] = useState(false)
  
  const senseConfig = SENSE_CONFIG[senseType]
  const providers = OAUTH_PROVIDERS[senseType] || []
  
  const handleConnect = async (providerId: string) => {
    setConnectionStatus(prev => ({ ...prev, [providerId]: 'connecting' }))
    
    try {
      if (providerId === 'google' && senseType === 'calendar') {
        // Real Google Calendar OAuth
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
        
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
        
        // Create connection data
        const connectionData = {
          providerId: 'google',
          providerName: 'Google Calendar',
          accountEmail: 'Google Account',
          tokens: tokenResponse,
          connectedAt: new Date(),
        }
        
        // Reset connection status to idle after successful connection
        setConnectionStatus(prev => ({ ...prev, [providerId]: 'idle' }))
        
        onConnectionComplete(providerId, connectionData)
        
      } else if (providerId === 'outlook' && senseType === 'calendar') {
        // Real Microsoft Outlook OAuth
        const clientId = process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID
        
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
        
        // Create connection data
        const connectionData = {
          providerId: 'outlook',
          providerName: 'Microsoft Outlook',
          accountEmail: 'Microsoft Account',
          tokens: tokenResponse,
          connectedAt: new Date(),
        }
        
        // Reset connection status to idle after successful connection
        setConnectionStatus(prev => ({ ...prev, [providerId]: 'idle' }))
        
        onConnectionComplete(providerId, connectionData)
        
      } else if (providerId === 'device_location' && senseType === 'location') {
        // Show dedicated location modal for device location
        setConnectionStatus(prev => ({ ...prev, [providerId]: 'idle' }))
        setShowLocationModal(true)
        return
        
      } else if (providerId === 'apple_health' && senseType === 'fitness') {
        // Apple Health OAuth integration
        const clientId = process.env.NEXT_PUBLIC_APPLE_HEALTH_CLIENT_ID
        
        if (!clientId) {
          throw new Error('Apple Health Client ID not configured. Please add NEXT_PUBLIC_APPLE_HEALTH_CLIENT_ID to your environment variables.')
        }

        const appleHealthOAuth = new AppleHealthOAuth({
          clientId,
          redirectUri: `${window.location.origin}/api/auth/apple-health/callback`,
          scopes: [
            'https://developer.apple.com/documentation/healthkit/hkquantitytypeidentifierstepcount',
            'https://developer.apple.com/documentation/healthkit/hkquantitytypeidentifierheartrate',
            'https://developer.apple.com/documentation/healthkit/hkquantitytypeidentifieractiveenergyburned'
          ]
        })

        // Initiate OAuth flow and get tokens
        const tokenResponse = await appleHealthOAuth.initiateOAuth()
        
        // Create connection data
        const connectionData = {
          providerId: 'apple_health',
          providerName: 'Apple Health',
          accountEmail: 'Apple Health Account',
          tokens: tokenResponse,
          connectedAt: new Date(),
        }
        
        // Reset connection status to idle after successful connection
        setConnectionStatus(prev => ({ ...prev, [providerId]: 'idle' }))
        
        onConnectionComplete(providerId, connectionData)
        
      } else if (providerId === 'google_fit' && senseType === 'fitness') {
        // Google Fit OAuth integration (reuses existing Google credentials)
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_FIT_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
        
        if (!clientId) {
          throw new Error('Google Client ID not configured. Please add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your environment variables.')
        }

        const googleFitOAuth = new GoogleFitOAuth({
          clientId,
          redirectUri: `${window.location.origin}/api/auth/google-fit/callback`,
          scopes: [
            'https://www.googleapis.com/auth/fitness.activity.read',
            'https://www.googleapis.com/auth/fitness.heart_rate.read',
            'https://www.googleapis.com/auth/fitness.location.read',
            'https://www.googleapis.com/auth/fitness.body.read'
          ]
        })

        // Initiate OAuth flow and get tokens
        const tokenResponse = await googleFitOAuth.initiateOAuth()
        
        // Create connection data
        const connectionData = {
          providerId: 'google_fit',
          providerName: 'Google Fit',
          accountEmail: 'Google Fit Account',
          tokens: tokenResponse,
          connectedAt: new Date(),
        }
        
        // Reset connection status to idle after successful connection
        setConnectionStatus(prev => ({ ...prev, [providerId]: 'idle' }))
        
        onConnectionComplete(providerId, connectionData)
        
      } else if (providerId === 'fitbit' && senseType === 'fitness') {
        // Fitbit OAuth integration
        const clientId = process.env.NEXT_PUBLIC_FITBIT_CLIENT_ID
        
        if (!clientId) {
          throw new Error('Fitbit Client ID not configured. Please add NEXT_PUBLIC_FITBIT_CLIENT_ID to your environment variables.')
        }

        const fitbitOAuth = new FitbitOAuth({
          clientId,
          redirectUri: `${window.location.origin}/api/auth/fitbit/callback`,
          scopes: [
            'activity',
            'heartrate',
            'location',
            'nutrition',
            'profile',
            'settings',
            'sleep',
            'social',
            'weight'
          ]
        })

        // Initiate OAuth flow and get tokens
        const tokenResponse = await fitbitOAuth.initiateOAuth()
        
        // Create connection data
        const connectionData = {
          providerId: 'fitbit',
          providerName: 'Fitbit',
          accountEmail: 'Fitbit Account',
          tokens: tokenResponse,
          connectedAt: new Date(),
        }
        
        // Reset connection status to idle after successful connection
        setConnectionStatus(prev => ({ ...prev, [providerId]: 'idle' }))
        
        onConnectionComplete(providerId, connectionData)
        
      } else if (providerId === 'strava' && senseType === 'fitness') {
        // Strava OAuth integration
        const clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID
        
        if (!clientId) {
          throw new Error('Strava Client ID not configured. Please add NEXT_PUBLIC_STRAVA_CLIENT_ID to your environment variables.')
        }

        const stravaOAuth = new StravaOAuth({
          clientId,
          redirectUri: `${window.location.origin}/api/auth/strava/callback`,
          scopes: [
            'read',
            'activity:read_all',
            'profile:read_all'
          ]
        })

        // Initiate OAuth flow and get tokens
        const tokenResponse = await stravaOAuth.initiateOAuth()
        
        // Create connection data
        const connectionData = {
          providerId: 'strava',
          providerName: 'Strava',
          accountEmail: 'Strava Account',
          tokens: tokenResponse,
          connectedAt: new Date(),
        }
        
        // Reset connection status to idle after successful connection
        setConnectionStatus(prev => ({ ...prev, [providerId]: 'idle' }))
        
        onConnectionComplete(providerId, connectionData)
        
      } else {
        // Simulate other providers
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        const connectionData = {
          providerId,
          providerName: providers.find(p => p.id === providerId)?.name || 'Unknown',
          accountEmail: 'user@example.com',
          connectedAt: new Date(),
        }
        
        // Reset connection status to idle after successful connection
        setConnectionStatus(prev => ({ ...prev, [providerId]: 'idle' }))
        
        onConnectionComplete(providerId, connectionData)
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

  const handleLocationConnection = (connectionData: any) => {
    setShowLocationModal(false)
    // Use device_location as the provider ID but include device info for identification
    const enhancedConnectionData = {
      ...connectionData,
      providerId: 'device_location',
      providerName: 'Device Location',
      deviceInfo: getDeviceInfo(),
    }
    onConnectionComplete('device_location', enhancedConnectionData)
  }

  // Device detection utility functions
  const detectDeviceType = (): string => {
    const userAgent = navigator.userAgent.toLowerCase()
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
    const isTablet = /ipad|android(?!.*mobile)|tablet/i.test(userAgent)
    
    if (isTablet) return 'tablet_browser'
    if (isMobile) return 'mobile_browser'
    return 'desktop_browser'
  }

  const getDeviceDisplayName = (deviceType: string): string => {
    switch (deviceType) {
      case 'desktop_browser': return 'Desktop Browser'
      case 'mobile_browser': return 'Mobile Browser'
      case 'tablet_browser': return 'Tablet Browser'
      default: return 'Browser Location'
    }
  }

  const getDeviceInfo = () => {
    const userAgent = navigator.userAgent
    const platform = navigator.platform
    const language = navigator.language
    
    // Extract browser info
    let browserName = 'Unknown Browser'
    if (userAgent.includes('Chrome')) browserName = 'Chrome'
    else if (userAgent.includes('Firefox')) browserName = 'Firefox'
    else if (userAgent.includes('Safari')) browserName = 'Safari'
    else if (userAgent.includes('Edge')) browserName = 'Edge'
    
    // Extract OS info
    let osName = 'Unknown OS'
    if (platform.includes('Win')) osName = 'Windows'
    else if (platform.includes('Mac')) osName = 'macOS'
    else if (platform.includes('Linux')) osName = 'Linux'
    else if (userAgent.includes('Android')) osName = 'Android'
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) osName = 'iOS'
    
    // Add screen info for device fingerprinting
    const screenInfo = `${screen.width}x${screen.height}`
    
    return {
      browser: browserName,
      os: osName,
      platform,
      language,
      screenInfo,
      userAgent: userAgent.substring(0, 100) + '...', // Truncate for privacy
    }
  }

  // Create a unique device fingerprint for duplicate detection
  const createDeviceFingerprint = () => {
    const deviceInfo = getDeviceInfo()
    // Create a fingerprint based on browser, OS, platform, and screen resolution
    const screenInfo = `${screen.width}x${screen.height}`
    const fingerprint = `${deviceInfo.browser}-${deviceInfo.os}-${deviceInfo.platform}-${screenInfo}`
    return fingerprint
  }

  // Check if current device is already configured
  const isCurrentDeviceConfigured = () => {
    const currentFingerprint = createDeviceFingerprint()
    return existingConnections.some(conn =>
      conn.providerId === 'device_location' &&
      conn.deviceInfo &&
      createConnectionFingerprint(conn.deviceInfo) === currentFingerprint
    )
  }

  // Create fingerprint from stored device info
  const createConnectionFingerprint = (deviceInfo: any) => {
    if (!deviceInfo) return ''
    // Try to recreate the same fingerprint format
    const screenInfo = deviceInfo.screenInfo || 'unknown'
    return `${deviceInfo.browser}-${deviceInfo.os}-${deviceInfo.platform}-${screenInfo}`
  }

  const handleLocationCancel = () => {
    setShowLocationModal(false)
  }

  const handleDisconnect = async (connectionId: string) => {
    setConnectionStatus(prev => ({ ...prev, [connectionId]: 'disconnecting' }))
    
    try {
      // Simulate disconnect process
      await new Promise(resolve => setTimeout(resolve, 1000))
      onDisconnect(connectionId)
      
      // Reset any provider connection status that might be stuck
      const disconnectedConnection = existingConnections.find(conn => conn.id === connectionId)
      if (disconnectedConnection) {
        setConnectionStatus(prev => ({ ...prev, [disconnectedConnection.providerId]: 'idle' }))
      }
      
      setConnectionStatus(prev => ({ ...prev, [connectionId]: 'idle' }))
    } catch (error) {
      console.error('Disconnect failed:', error)
      setConnectionStatus(prev => ({ ...prev, [connectionId]: 'error' }))
    }
  }

  const getStatusIcon = (providerId: string) => {
    const status = connectionStatus[providerId] || 'idle'
    switch (status) {
      case 'connecting':
        return <Loader2 className="w-4 h-4 animate-spin" />
      case 'connected':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case 'disconnecting':
        return <Loader2 className="w-4 h-4 animate-spin text-red-600" />
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
      case 'disconnecting':
        return 'Disconnecting...'
      case 'error':
        return 'Try Again'
      default:
        return 'Connect'
    }
  }

  const isProviderConnected = (providerId: string) => {
    return existingConnections.some(conn => conn.providerId === providerId)
  }

  const getProviderConnections = (providerId: string) => {
    return existingConnections.filter(conn => conn.providerId === providerId)
  }

  // Check if a provider should be prevented from duplicate connections
  const shouldPreventDuplicateConnection = (providerId: string): { prevent: boolean; reason: string } => {
    const existingConns = getProviderConnections(providerId)
    
    // For device location, prevent duplicates of the same device
    if (providerId === 'device_location') {
      const isCurrentDeviceAlreadyConfigured = isCurrentDeviceConfigured()
      if (isCurrentDeviceAlreadyConfigured) {
        return { prevent: true, reason: 'This device is already configured' }
      }
    }
    
    // For single-account providers (like personal health data), prevent duplicates
    const singleAccountProviders = ['apple_health', 'oura', 'whoop']
    if (singleAccountProviders.includes(providerId) && existingConns.length > 0) {
      return { prevent: true, reason: 'Only one account can be connected for this service' }
    }
    
    // For providers that typically have one main account but could have multiple
    const limitedAccountProviders = ['google', 'outlook', 'google_fit', 'fitbit', 'strava']
    if (limitedAccountProviders.includes(providerId) && existingConns.length >= 2) {
      return { prevent: true, reason: 'Maximum of 2 accounts allowed for this service' }
    }
    
    return { prevent: false, reason: '' }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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

        {/* Existing Connections */}
        {existingConnections.length > 0 && (
          <div className="space-y-4 mb-8">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              {senseType === 'location'
                ? `Connected Devices (${existingConnections.length})`
                : senseType === 'fitness'
                ? `Connected Fitness Services (${existingConnections.length})`
                : senseType === 'sleep'
                ? `Connected Sleep Trackers (${existingConnections.length})`
                : `Connected Calendars (${existingConnections.length})`
              }
            </h3>
            
            <div className="grid gap-3">
              {existingConnections.map((connection) => {
                const provider = providers.find(p => p.id === connection.providerId)
                const status = connectionStatus[connection.id] || 'idle'
                const isDisconnecting = status === 'disconnecting'
                
                return (
                  <div
                    key={connection.id}
                    className="border border-green-300 bg-green-50 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "p-3 rounded-lg bg-gradient-to-r text-white",
                          provider?.color || "from-gray-500 to-gray-600"
                        )}>
                          {provider?.icon ? <provider.icon className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-800">
                              {connection.providerName}
                            </h4>
                            {senseType === 'location' && (
                              <span className="text-lg">
                                {connection.providerId?.includes('mobile') ? '📱' :
                                 connection.providerId?.includes('tablet') ? '📱' :
                                 connection.providerId?.includes('desktop') ? '💻' : '📍'}
                              </span>
                            )}
                          </div>
                          {connection.accountEmail && (
                            <p className="text-sm text-gray-600 mb-1">
                              {connection.accountEmail}
                            </p>
                          )}
                          <p className="text-xs text-green-600">
                            Connected {connection.connectedAt.toLocaleDateString()}
                            {connection.lastSync && ` • Last sync: ${connection.lastSync.toLocaleDateString()}`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-gray-600 hover:text-gray-800"
                          onClick={() => alert(`Settings for ${connection.providerName} - Feature coming soon!`)}
                        >
                          <Settings className="w-4 h-4 mr-1" />
                          Settings
                        </Button>
                        <Button
                          onClick={() => handleDisconnect(connection.id)}
                          disabled={isDisconnecting}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-800 border-red-300 hover:border-red-400"
                        >
                          {isDisconnecting ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-1" />
                          ) : (
                            <Trash2 className="w-4 h-4 mr-1" />
                          )}
                          {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-blue-800 mb-1">Your Privacy is Protected</p>
              <p className="text-blue-700">
                We only access the minimum data needed to enhance your Aura's understanding. 
                You can disconnect any service at any time, and we never share your personal data.
              </p>
            </div>
          </div>
        </div>

        {/* Add New Connection */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            {senseType === 'location'
              ? 'Add Device Location'
              : senseType === 'fitness'
              ? 'Add New Fitness Connection'
              : senseType === 'sleep'
              ? 'Add New Sleep Tracker'
              : 'Add New Calendar Connection'
            }
          </h3>
          
          <div className="grid gap-3">
            {providers.map((provider) => {
              const status = connectionStatus[provider.id] || 'idle'
              const isConnecting = status === 'connecting'
              const isConnected = status === 'connected'
              const hasError = status === 'error'
              const hasExistingConnection = isProviderConnected(provider.id)
              const isCurrentDeviceAlreadyConfigured = provider.id === 'device_location' && isCurrentDeviceConfigured()
              const duplicateCheck = shouldPreventDuplicateConnection(provider.id)
              const shouldPreventConnection = duplicateCheck.prevent
              
              return (
                <div
                  key={provider.id}
                  className={cn(
                    "relative border rounded-xl p-4 transition-all",
                    provider.popular && !hasExistingConnection && "ring-2 ring-blue-200 border-blue-300",
                    isConnected && "border-green-300 bg-green-50",
                    hasError && "border-red-300 bg-red-50",
                    hasExistingConnection && "border-gray-300 bg-gray-50",
                    !isConnected && !hasError && !hasExistingConnection && provider.bgColor
                  )}
                >
                  {provider.popular && !hasExistingConnection && (
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
                        {(provider.id === 'google_fit' || provider.id === 'fitbit' || provider.id === 'strava') && senseType === 'fitness' && (
                          <p className="text-xs text-green-600 mt-1 font-medium">
                            ✓ Full integration available
                          </p>
                        )}
                        {provider.id === 'apple_health' && senseType === 'fitness' && (
                          <p className="text-xs text-blue-600 mt-1 font-medium">
                            ⚠ Requires iOS app for full functionality
                          </p>
                        )}
                        {provider.id === 'device_location' && senseType === 'location' && (
                          <p className="text-xs text-green-600 mt-1 font-medium">
                            ✓ Native browser location • No external accounts needed
                          </p>
                        )}
                        {provider.id === 'device_location' && isCurrentDeviceAlreadyConfigured && (
                          <p className="text-xs text-blue-600 mt-1 font-medium">
                            ✓ This device is already configured
                          </p>
                        )}
                        {hasExistingConnection && provider.id !== 'device_location' && !shouldPreventConnection && (
                          <p className="text-xs text-blue-600 mt-1 font-medium">
                            ✓ Already connected • You can add multiple accounts
                          </p>
                        )}
                        {shouldPreventConnection && (
                          <p className="text-xs text-orange-600 mt-1 font-medium">
                            ⚠ {duplicateCheck.reason}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => handleConnect(provider.id)}
                      disabled={isConnecting || shouldPreventConnection}
                      variant={hasExistingConnection || shouldPreventConnection ? "outline" : "default"}
                      className={cn(
                        "min-w-[120px]",
                        hasError && "border-red-300 text-red-700 bg-red-50",
                        (hasExistingConnection || shouldPreventConnection) && "border-blue-300 text-blue-700 bg-blue-50",
                        shouldPreventConnection && "opacity-60 cursor-not-allowed"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {getStatusIcon(provider.id)}
                        <span>
                          {shouldPreventConnection
                            ? 'Cannot Connect'
                            : hasExistingConnection && !isConnecting && !shouldPreventConnection
                            ? 'Add Another'
                            : isConnecting
                            ? 'Connecting...'
                            : hasError
                            ? 'Try Again'
                            : 'Connect'
                          }
                        </span>
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
            You can manage all connected services in your account settings
          </p>
          <Button variant="outline" onClick={onCancel}>
            Done
          </Button>
        </div>

        {/* Location Connection Modal */}
        <LocationConnectionModal
          open={showLocationModal}
          onOpenChange={setShowLocationModal}
          onConnectionComplete={handleLocationConnection}
          onCancel={handleLocationCancel}
        />
      </DialogContent>
    </Dialog>
  )
}