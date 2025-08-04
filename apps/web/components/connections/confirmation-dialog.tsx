"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Loader2, Shield, Users, Zap, Heart } from "lucide-react"
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

interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm?: () => void
  type: 'oauth' | 'location'
  connection?: OAuthConnection
  locationCount?: number
}

// Provider configuration for consistent styling
const PROVIDER_CONFIG = {
  google: { name: "Google", icon: "🔍", color: "from-blue-500 to-blue-600" },
  fitbit: { name: "Fitbit", icon: "⌚", color: "from-green-500 to-green-600" },
  strava: { name: "Strava", icon: "🏃", color: "from-orange-500 to-orange-600" },
  microsoft: { name: "Microsoft", icon: "🪟", color: "from-blue-600 to-indigo-600" },
  "apple-health": { name: "Apple Health", icon: "🍎", color: "from-gray-700 to-gray-800" },
  "google-fit": { name: "Google Fit", icon: "💪", color: "from-green-500 to-blue-500" }
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  type,
  connection,
  locationCount = 0
}: ConfirmationDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleConfirm = async () => {
    if (!onConfirm) return
    
    setIsProcessing(true)
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      console.error('Error in confirmation action:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const isOAuth = type === 'oauth'
  const serviceName = isOAuth ? connection?.provider : 'Location Services'
  const affectedCount = isOAuth ? connection?.aura_count || 0 : locationCount
  const senseType = isOAuth ? connection?.sense_type : 'location'
  
  // Get provider config for OAuth connections
  const providerConfig = isOAuth && connection ? 
    PROVIDER_CONFIG[connection.provider as keyof typeof PROVIDER_CONFIG] || {
      name: connection.provider,
      icon: "🔗",
      color: "from-gray-500 to-gray-600"
    } : null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="text-center pb-4">
          {/* Service Icon & Title */}
          <div className="flex flex-col items-center gap-4 mb-4">
            <div className={cn(
              "w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg bg-gradient-to-r",
              isOAuth && providerConfig ? providerConfig.color : "from-green-500 to-emerald-500"
            )}>
              {isOAuth && providerConfig ? providerConfig.icon : "🌍"}
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold flex items-center justify-center gap-2 mb-2">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
                {isOAuth ? 'Disconnect Service' : 'Disable Location Services'}
              </DialogTitle>
              <DialogDescription className="text-lg">
                Are you sure you want to {isOAuth ? 'disconnect' : 'disable'} {' '}
                <span className="font-semibold text-gray-800">
                  {isOAuth && providerConfig ? providerConfig.name : serviceName}
                </span>?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Impact Summary */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-amber-800 mb-3 text-lg">Impact Summary</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-white/70 rounded-lg border border-amber-200">
                    <Users className="h-5 w-5 text-amber-600" />
                    <div className="flex-1">
                      <div className="font-medium text-amber-800">
                        {affectedCount} Aura{affectedCount !== 1 ? 's' : ''} affected
                      </div>
                      <div className="text-sm text-amber-700">
                        {affectedCount > 0 ? 'Currently using this service' : 'No active usage'}
                      </div>
                    </div>
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                      {affectedCount}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-white/70 rounded-lg border border-amber-200">
                    <Zap className="h-5 w-5 text-amber-600" />
                    <div className="flex-1">
                      <div className="font-medium text-amber-800">
                        Behavior rules will be disabled
                      </div>
                      <div className="text-sm text-amber-700">
                        Rules depending on <strong>{senseType}</strong> data will stop working
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recovery Options */}
          <div className="bg-gradient-to-r from-blue-50 to-sky-50 border-2 border-blue-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-sky-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-blue-800 mb-3 text-lg">Recovery Options</h3>
                <div className="text-sm text-blue-700 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Reconnect this service anytime to restore functionality</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Edit affected rules to remove the {senseType} dependency</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Disabled rules will remain inactive until reconnection</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Warning for OAuth Library Connections */}
          {isOAuth && connection?.is_library_connection && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-red-800 mb-3 text-lg">
                    Library Connection Removal
                  </h3>
                  <p className="text-red-700 mb-3">
                    This will remove {providerConfig?.name || serviceName} from your connection library and disconnect it from all associated Auras.
                  </p>
                  {connection.associated_auras && connection.associated_auras.length > 0 && (
                    <div className="mt-3">
                      <div className="font-medium text-red-800 mb-2">Affected Auras:</div>
                      <div className="flex flex-wrap gap-2">
                        {connection.associated_auras.map((aura) => (
                          <Badge
                            key={aura.id}
                            variant="destructive"
                            className="bg-red-100 text-red-800 hover:bg-red-100"
                          >
                            {aura.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-3 pt-6">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
            className="border-2 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg px-6"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isOAuth ? 'Disconnecting...' : 'Disabling...'}
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 mr-2" />
                {isOAuth ? (connection?.is_library_connection ? 'Remove from Library' : 'Disconnect Service') : 'Disable Location'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}