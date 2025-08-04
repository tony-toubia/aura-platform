"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { Link2, MapPin, Unlink, AlertTriangle, Activity, Zap, Shield, Globe, Smartphone, Calendar, Users } from "lucide-react"
import { ConfirmationDialog } from "./confirmation-dialog"
import { cn } from "@/lib/utils"

interface OAuthConnection {
  id: string
  provider: string
  sense_type: string
  created_at: string
  aura_count?: number
  affected_rules?: number
  is_library_connection?: boolean
  associated_auras?: Array<{
    id: string
    name: string
  }>
}

interface LocationSense {
  id: string
  aura: {
    id: string
    name: string
  }
}

interface ConnectionsManagerProps {
  userId: string
}

// Provider configuration for better visual representation
const PROVIDER_CONFIG = {
  google: {
    name: "Google",
    icon: "🔍",
    color: "from-blue-500 to-blue-600",
    bgColor: "from-blue-50 to-blue-100",
    borderColor: "border-blue-200"
  },
  fitbit: {
    name: "Fitbit",
    icon: "⌚",
    color: "from-green-500 to-green-600",
    bgColor: "from-green-50 to-green-100",
    borderColor: "border-green-200"
  },
  strava: {
    name: "Strava",
    icon: "🏃",
    color: "from-orange-500 to-orange-600",
    bgColor: "from-orange-50 to-orange-100",
    borderColor: "border-orange-200"
  },
  microsoft: {
    name: "Microsoft",
    icon: "🪟",
    color: "from-blue-600 to-indigo-600",
    bgColor: "from-blue-50 to-indigo-100",
    borderColor: "border-blue-200"
  },
  "apple-health": {
    name: "Apple Health",
    icon: "🍎",
    color: "from-gray-700 to-gray-800",
    bgColor: "from-gray-50 to-gray-100",
    borderColor: "border-gray-200"
  },
  "google-fit": {
    name: "Google Fit",
    icon: "💪",
    color: "from-green-500 to-blue-500",
    bgColor: "from-green-50 to-blue-100",
    borderColor: "border-green-200"
  }
}

// Loading skeleton components
function ConnectionsLoadingSkeleton() {
  return (
    <div className="w-full">
      {/* Header Skeleton */}
      <div className="mb-10">
        <div className="text-center mb-8">
          <Skeleton className="h-8 w-48 mx-auto mb-4" />
          <Skeleton className="h-12 w-96 mx-auto mb-4" />
          <Skeleton className="h-6 w-80 mx-auto" />
        </div>
        
        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4">
              <Skeleton className="h-8 w-12 mx-auto mb-2" />
              <Skeleton className="h-4 w-24 mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Cards Skeleton */}
      <div className="space-y-6">
        {[1, 2].map((i) => (
          <Card key={i} className="border-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-6 w-32" />
              </div>
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2].map((j) => (
                  <div key={j} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Skeleton className="h-5 w-20" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                        <Skeleton className="h-4 w-48" />
                      </div>
                      <Skeleton className="h-9 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function ConnectionsManager({ userId }: ConnectionsManagerProps) {
  const [oauthConnections, setOauthConnections] = useState<OAuthConnection[]>([])
  const [locationSenses, setLocationSenses] = useState<LocationSense[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    type: 'oauth' | 'location'
    connection?: OAuthConnection
    onConfirm?: () => void
  }>({ isOpen: false, type: 'oauth' })

  useEffect(() => {
    fetchConnections()
  }, [userId])

  const fetchConnections = async () => {
    try {
      setLoading(true)
      
      // Fetch OAuth connections with aura count
      const oauthResponse = await fetch('/api/connections/oauth-info')
      const oauthData = await oauthResponse.json()
      
      // Fetch location senses
      const locationResponse = await fetch('/api/connections/location-info')
      const locationData = await locationResponse.json()
      
      setOauthConnections(oauthData)
      setLocationSenses(locationData)
    } catch (error) {
      console.error('Error fetching connections:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthDisconnect = async (connectionId: string) => {
    try {
      // First try to delete from library (safe delete - only if no associations)
      const libraryResponse = await fetch('/api/oauth-connections/library', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connection_id: connectionId })
      })
      
      if (libraryResponse.ok) {
        await fetchConnections() // Refresh data
        return
      }
      
      // If library delete failed, fall back to regular disconnect
      const response = await fetch('/api/oauth-connections/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId })
      })
      
      if (response.ok) {
        await fetchConnections() // Refresh data
      }
    } catch (error) {
      console.error('Error disconnecting OAuth:', error)
    }
  }

  const handleLocationDisable = async () => {
    try {
      const response = await fetch('/api/connections/location/disable', {
        method: 'POST'
      })
      
      if (response.ok) {
        await fetchConnections() // Refresh data
      }
    } catch (error) {
      console.error('Error disabling location:', error)
    }
  }

  const openOAuthConfirmation = (connection: OAuthConnection) => {
    setConfirmDialog({
      isOpen: true,
      type: 'oauth',
      connection,
      onConfirm: () => {
        handleOAuthDisconnect(connection.id)
        setConfirmDialog({ isOpen: false, type: 'oauth' })
      }
    })
  }

  const openLocationConfirmation = () => {
    setConfirmDialog({
      isOpen: true,
      type: 'location',
      onConfirm: () => {
        handleLocationDisable()
        setConfirmDialog({ isOpen: false, type: 'oauth' })
      }
    })
  }

  // Calculate stats
  const totalConnections = oauthConnections.length + (locationSenses.length > 0 ? 1 : 0)
  const totalAurasConnected = oauthConnections.reduce((acc, conn) => acc + (conn.aura_count || 0), 0) + locationSenses.length
  const libraryConnections = oauthConnections.filter(conn => conn.is_library_connection).length

  if (loading) {
    return <ConnectionsLoadingSkeleton />
  }

  // Empty state when no connections
  if (totalConnections === 0) {
    return (
      <div className="w-full">
        {/* Enhanced Header */}
        <div className="mb-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Shield className="w-4 h-4" />
              Connection Hub
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Connected Services
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Connect your digital life to create more intelligent and responsive Auras
            </p>
          </div>
        </div>

        <EmptyState
          icon={Link2}
          iconGradient="from-purple-500 to-blue-500"
          title="No Connected Services"
          description="Connect your favorite apps and services to give your Auras access to real-time data and create more intelligent, personalized experiences."
          primaryAction={{
            label: "Explore Aura Creation",
            onClick: () => window.location.href = '/auras/create-select',
            icon: Zap
          }}
        >
          {/* Service Preview */}
          <div className="mt-12 relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-2xl p-10 mx-4">
              <h3 className="text-2xl font-bold text-center mb-10 text-purple-800">
                Popular Connections
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-center max-w-4xl mx-auto">
                {[
                  { name: "Google Fit", icon: "💪", desc: "Health & fitness data" },
                  { name: "Fitbit", icon: "⌚", desc: "Activity tracking" },
                  { name: "Strava", icon: "🏃", desc: "Exercise & routes" },
                  { name: "Location", icon: "📍", desc: "Weather & local info" }
                ].map((service) => (
                  <div key={service.name} className="space-y-3">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg">
                      {service.icon}
                    </div>
                    <h3 className="font-semibold text-purple-700">{service.name}</h3>
                    <p className="text-sm text-gray-600">{service.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </EmptyState>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Enhanced Header */}
      <div className="mb-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Shield className="w-4 h-4" />
            Connection Hub
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Connected Services
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage your connected apps and data sources that power your Auras
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-700">{totalConnections}</div>
            <div className="text-sm text-purple-600">Total Services</div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-green-700">{totalAurasConnected}</div>
            <div className="text-sm text-green-600">Auras Connected</div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">{libraryConnections}</div>
            <div className="text-sm text-blue-600">Library Connections</div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* OAuth Connections */}
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50/30 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Link2 className="h-5 w-5 text-white" />
              </div>
              OAuth Connections
            </CardTitle>
            <CardDescription>
              Third-party services connected to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {oauthConnections.length > 0 ? (
              <div className="space-y-4">
                {oauthConnections.map((connection) => {
                  const config = PROVIDER_CONFIG[connection.provider as keyof typeof PROVIDER_CONFIG] || {
                    name: connection.provider,
                    icon: "🔗",
                    color: "from-gray-500 to-gray-600",
                    bgColor: "from-gray-50 to-gray-100",
                    borderColor: "border-gray-200"
                  }
                  
                  return (
                    <div key={connection.id} className={cn(
                      "group p-4 sm:p-6 border-2 rounded-2xl transition-all duration-300 hover:shadow-lg bg-gradient-to-r",
                      config.bgColor,
                      config.borderColor,
                      "hover:border-opacity-70"
                    )}>
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-3 mb-3">
                            <div className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shadow-md bg-gradient-to-r group-hover:scale-110 transition-transform flex-shrink-0",
                              config.color
                            )}>
                              {config.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                <div className="font-bold text-lg text-gray-800 truncate">{config.name}</div>
                                {connection.is_library_connection && (
                                  <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 self-start">
                                    📚 Library
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Activity className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{connection.sense_type}</span>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm">
                                  <span>Connected {new Date(connection.created_at).toLocaleDateString()}</span>
                                  {connection.aura_count && (
                                    <>
                                      <span className="text-gray-400">•</span>
                                      <div className="flex items-center gap-1">
                                        <Users className="w-3 h-3 flex-shrink-0" />
                                        <span>{connection.aura_count} Aura{connection.aura_count !== 1 ? 's' : ''}</span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {connection.is_library_connection && connection.associated_auras && connection.associated_auras.length > 0 && (
                            <div className="mt-3 pl-0 sm:pl-15">
                              <div className="text-xs text-gray-500 mb-2 font-medium">Associated Auras:</div>
                              <div className="flex flex-wrap gap-2">
                                {connection.associated_auras.map((aura) => (
                                  <Badge
                                    key={aura.id}
                                    variant="secondary"
                                    className="bg-white/70 text-gray-700 hover:bg-white/90 text-xs"
                                  >
                                    {aura.name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openOAuthConfirmation(connection)}
                          className="border-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors self-start flex-shrink-0 w-full sm:w-auto"
                        >
                          <Unlink className="h-4 w-4 mr-1 sm:mr-2" />
                          <span className="text-xs sm:text-sm">{connection.is_library_connection ? 'Remove' : 'Disconnect'}</span>
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Link2 className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-500 mb-4">No OAuth connections found</p>
                <Button variant="outline" asChild>
                  <a href="/auras/create-select">
                    <Zap className="w-4 h-4 mr-2" />
                    Connect Services via Aura Creation
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Location Services */}
        <Card className="border-2 border-green-200 bg-gradient-to-br from-white to-green-50/30 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              Location Services
            </CardTitle>
            <CardDescription>
              Browser-based location access for weather and local data
            </CardDescription>
          </CardHeader>
          <CardContent>
            {locationSenses.length > 0 ? (
              <div className="p-4 sm:p-6 border-2 border-green-200 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 hover:shadow-lg transition-all duration-300 group">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white text-xl shadow-md group-hover:scale-110 transition-transform flex-shrink-0">
                      🌍
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-lg text-gray-800">Browser Location</div>
                      <div className="text-sm text-gray-600 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <div className="flex items-center gap-1">
                          <Activity className="w-3 h-3 flex-shrink-0" />
                          <span>Used by {locationSenses.length} Aura{locationSenses.length !== 1 ? 's' : ''}</span>
                        </div>
                        <span className="hidden sm:inline text-gray-400">•</span>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 flex-shrink-0" />
                          <span>Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openLocationConfirmation}
                    className="border-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors self-start sm:self-center flex-shrink-0 w-full sm:w-auto"
                  >
                    <Unlink className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="text-xs sm:text-sm">Disable</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-500 mb-4">Location services not enabled</p>
                <Button variant="outline" asChild>
                  <a href="/auras/create-select">
                    <Globe className="w-4 h-4 mr-2" />
                    Enable via Aura Creation
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Footer CTA */}
      <div className="mt-16">
        <div className="bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 rounded-3xl p-8 text-white text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Connect More Services?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Create new Auras and connect more of your digital life for richer, more intelligent experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 shadow-lg px-8 h-12"
              >
                <a href="/auras/create-select">
                  <Zap className="w-5 h-5 mr-2" />
                  Create New Aura
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 px-8 h-12"
              >
                <a href="/auras">
                  <Activity className="w-5 h-5 mr-2" />
                  Manage Existing Auras
                </a>
              </Button>
            </div>
            <div className="mt-6 text-sm opacity-75">
              ✨ Connect your digital world to create magical AI experiences
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, type: 'oauth' })}
        onConfirm={confirmDialog.onConfirm}
        type={confirmDialog.type}
        connection={confirmDialog.connection}
        locationCount={locationSenses.length}
      />
    </div>
  )
}