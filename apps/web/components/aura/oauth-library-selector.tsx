// apps/web/components/aura/oauth-library-selector.tsx

"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import * as RadixDialog from "@radix-ui/react-dialog"
import {
  Library,
  Plus,
  Check,
  Clock,
  Shield,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface LibraryConnection {
  id: string
  provider: string
  provider_user_id: string
  sense_type: string
  created_at: string
  expires_at?: string
  scope?: string
  device_info?: any
  aura_connections?: Array<{
    aura_id: string
    aura: {
      id: string
      name: string
    }
  }>
}

interface OAuthLibrarySelectorProps {
  /** The sense type to filter connections for */
  senseType: string
  /** Currently selected connection IDs for this aura */
  selectedConnectionIds?: string[]
  /** Callback when a connection is selected from the library */
  onConnectionSelect: (connection: LibraryConnection) => void
  /** Callback when a new connection should be created */
  onCreateNew: () => void
  /** Whether the selector is disabled */
  disabled?: boolean
  /** Custom trigger button */
  trigger?: React.ReactNode
}

export function OAuthLibrarySelector({
  senseType,
  selectedConnectionIds = [],
  onConnectionSelect,
  onCreateNew,
  disabled = false,
  trigger,
}: OAuthLibrarySelectorProps) {
  const [open, setOpen] = useState(false)
  const [connections, setConnections] = useState<LibraryConnection[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch library connections when modal opens
  useEffect(() => {
    if (open) {
      fetchLibraryConnections()
    }
  }, [open, senseType])

  const fetchLibraryConnections = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/oauth-connections/library?sense_type=${encodeURIComponent(senseType)}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch library connections: ${response.statusText}`)
      }
      
      const data = await response.json()
      setConnections(data)
    } catch (err) {
      console.error('Error fetching library connections:', err)
      setError(err instanceof Error ? err.message : 'Failed to load connections')
    } finally {
      setLoading(false)
    }
  }

  const handleConnectionSelect = (connection: LibraryConnection) => {
    onConnectionSelect(connection)
    setOpen(false)
  }

  const handleCreateNew = () => {
    onCreateNew()
    setOpen(false)
  }

  const getProviderDisplayName = (provider: string): string => {
    const providerNames: Record<string, string> = {
      'google': 'Google',
      'google-fit': 'Google Fit',
      'google_fit': 'Google Fit',
      'fitbit': 'Fitbit',
      'apple-health': 'Apple Health',
      'apple_health': 'Apple Health',
      'strava': 'Strava',
      'microsoft': 'Microsoft',
    }
    return providerNames[provider] || provider.charAt(0).toUpperCase() + provider.slice(1).replace(/_/g, ' ')
  }

  const getProviderIcon = (provider: string): string => {
    const providerIcons: Record<string, string> = {
      'google': '🌐',
      'google-fit': '💪',
      'google_fit': '💪',
      'fitbit': '⌚',
      'apple-health': '🍎',
      'apple_health': '🍎',
      'strava': '🏃',
      'microsoft': '📧',
    }
    return providerIcons[provider] || '🔗'
  }

  const isConnectionExpired = (connection: LibraryConnection): boolean => {
    if (!connection.expires_at) return false
    return new Date(connection.expires_at) < new Date()
  }

  const isConnectionSelected = (connection: LibraryConnection): boolean => {
    return selectedConnectionIds.includes(connection.id)
  }

  const availableConnections = connections.filter(conn => !isConnectionSelected(conn))

  const defaultTrigger = (
    <Button
      variant="outline"
      disabled={disabled}
      className="flex items-center gap-2"
    >
      <Library className="w-4 h-4" />
      Use from Library
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <RadixDialog.Trigger asChild>
        {trigger || defaultTrigger}
      </RadixDialog.Trigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Library className="w-5 h-5" />
            OAuth Connection Library
          </DialogTitle>
          <DialogDescription>
            Select an existing {senseType} connection from your library, or create a new one.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Create New Connection Button */}
          <Card className="border-2 border-dashed border-purple-200 hover:border-purple-400 transition-colors">
            <CardContent className="p-4">
              <Button
                onClick={handleCreateNew}
                className="w-full h-auto p-4 flex flex-col items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Plus className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-semibold">Create New Connection</div>
                  <div className="text-sm opacity-90">Connect a new {senseType} account</div>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Loading your library connections...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-5 h-5" />
                  <div>
                    <div className="font-semibold">Error loading connections</div>
                    <div className="text-sm">{error}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchLibraryConnections}
                    className="ml-auto"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Retry
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Library Connections */}
          {!loading && !error && (
            <>
              {availableConnections.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Library className="w-4 h-4" />
                    <span>Available connections in your library:</span>
                  </div>
                  
                  {availableConnections.map((connection) => {
                    const isExpired = isConnectionExpired(connection)
                    const providerName = getProviderDisplayName(connection.provider)
                    const providerIcon = getProviderIcon(connection.provider)
                    
                    return (
                      <Card
                        key={connection.id}
                        className={cn(
                          "cursor-pointer transition-all hover:shadow-md",
                          isExpired 
                            ? "border-orange-200 bg-orange-50" 
                            : "border-gray-200 hover:border-purple-300"
                        )}
                        onClick={() => !isExpired && handleConnectionSelect(connection)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">{providerIcon}</div>
                              <div>
                                <div className="font-semibold flex items-center gap-2">
                                  {providerName}
                                  {isExpired && (
                                    <Badge variant="outline" className="text-orange-600 border-orange-300">
                                      <Clock className="w-3 h-3 mr-1" />
                                      Expired
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {connection.provider_user_id}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Connected {new Date(connection.created_at).toLocaleDateString()}
                                  {connection.aura_connections && connection.aura_connections.length > 0 && (
                                    <span className="ml-2">
                                      • Used by {connection.aura_connections.length} aura{connection.aura_connections.length !== 1 ? 's' : ''}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <Shield className="w-3 h-3" />
                                Library
                              </Badge>
                              {!isExpired && (
                                <Button size="sm" variant="outline">
                                  <Check className="w-4 h-4 mr-1" />
                                  Select
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          {isExpired && (
                            <div className="mt-3 p-2 bg-orange-100 rounded text-sm text-orange-700">
                              This connection has expired. You'll need to re-authenticate when using it.
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <Card className="border-gray-200">
                  <CardContent className="p-6 text-center">
                    <Library className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <div className="text-gray-600">
                      <div className="font-semibold mb-1">No {senseType} connections in your library</div>
                      <div className="text-sm">Create your first connection to start building your library.</div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}