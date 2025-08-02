// components/aura/location-connection-modal.tsx
"use client"

import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  MapPin,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Info,
  Zap,
  Clock,
  Eye,
  EyeOff,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { BrowserLocationService, type LocationConfig, type LocationData, type LocationPermissionStatus } from "@/lib/oauth/browser-location"

interface LocationConnectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConnectionComplete: (connectionData: any) => void
  onCancel: () => void
}

export function LocationConnectionModal({
  open,
  onOpenChange,
  onConnectionComplete,
  onCancel,
}: LocationConnectionModalProps) {
  const [locationService] = useState(() => new BrowserLocationService())
  const [permissionStatus, setPermissionStatus] = useState<LocationPermissionStatus | null>(null)
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Location configuration state
  const [config, setConfig] = useState<LocationConfig>({
    enableTracking: true,
    accuracy: 'balanced',
    updateFrequency: 'periodic',
    shareHistory: false,
  })

  // Check permission status when modal opens
  useEffect(() => {
    if (open) {
      checkPermissionStatus()
    }
  }, [open])

  const checkPermissionStatus = async () => {
    try {
      const status = await locationService.checkPermissionStatus()
      setPermissionStatus(status)
      setError(null)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to check location permissions')
    }
  }

  const handleConnect = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      // Request location access
      const locationData = await locationService.requestLocationAccess(config)
      setCurrentLocation(locationData)

      // Create enhanced connection data with device info
      const deviceInfo = getDeviceInfo()
      
      const connectionData = {
        providerId: 'device_location',
        providerName: 'Device Location',
        accountEmail: `${deviceInfo.browser} on ${deviceInfo.os} • ${BrowserLocationService.formatLocation(locationData)}`,
        locationData,
        locationConfig: config,
        deviceInfo,
        connectedAt: new Date(),
      }

      onConnectionComplete(connectionData)
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to access location')
      // Refresh permission status after error
      await checkPermissionStatus()
    } finally {
      setIsConnecting(false)
    }
  }

  const getPermissionStatusDisplay = () => {
    if (!permissionStatus) return null

    if (permissionStatus.granted) {
      return (
        <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-2 rounded-lg">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-sm font-medium">Location access granted</span>
        </div>
      )
    }

    if (permissionStatus.denied) {
      return (
        <div className="flex items-center gap-2 text-red-700 bg-red-50 px-3 py-2 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Location access denied</span>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-2 text-blue-700 bg-blue-50 px-3 py-2 rounded-lg">
        <Info className="w-4 h-4" />
        <span className="text-sm font-medium">Location permission required</span>
      </div>
    )
  }

  const getAccuracyDescription = (accuracy: string) => {
    switch (accuracy) {
      case 'high':
        return 'GPS + Network (most accurate, higher battery usage)'
      case 'balanced':
        return 'Network + GPS (good accuracy, balanced battery)'
      case 'low':
        return 'Network only (approximate location, low battery)'
      default:
        return ''
    }
  }

  const getUpdateFrequencyDescription = (frequency: string) => {
    switch (frequency) {
      case 'realtime':
        return 'Continuous updates (highest accuracy, more battery usage)'
      case 'periodic':
        return 'Regular updates (balanced accuracy and battery)'
      case 'manual':
        return 'Only when requested (lowest battery usage)'
      default:
        return ''
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
    
    return {
      browser: browserName,
      os: osName,
      platform,
      language,
      userAgent: userAgent.substring(0, 100) + '...', // Truncate for privacy
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 text-white">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-xl">Connect Your Location</DialogTitle>
                <DialogDescription className="text-base mt-1">
                  Allow your Aura to understand your movement patterns and provide location-aware responses
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

        {/* Permission Status */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Permission Status</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={checkPermissionStatus}
              className="text-xs"
            >
              Refresh
            </Button>
          </div>
          {getPermissionStatusDisplay()}
        </div>

        {/* Current Location Display */}
        {currentLocation && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800 mb-1">Location Detected</h4>
                <p className="text-sm text-green-700 mb-2">
                  {BrowserLocationService.formatLocation(currentLocation)}
                </p>
                <p className="text-xs text-green-600">
                  Accuracy: {BrowserLocationService.getAccuracyDescription(currentLocation.accuracy)} • 
                  Updated: {currentLocation.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800 mb-1">Connection Failed</h4>
                <p className="text-sm text-red-700">{error}</p>
                {permissionStatus?.denied && (
                  <p className="text-xs text-red-600 mt-2">
                    To enable location access, please check your browser settings and allow location permissions for this site.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Location Configuration */}
        <div className="space-y-6">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Privacy & Accuracy Settings
          </h3>

          {/* Enable Tracking */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <Label htmlFor="enable-tracking" className="font-medium">
                Enable Location Tracking
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                Allow your Aura to access your current location and movement patterns
              </p>
            </div>
            <Switch
              id="enable-tracking"
              checked={config.enableTracking}
              onCheckedChange={(checked) => 
                setConfig(prev => ({ ...prev, enableTracking: checked }))
              }
            />
          </div>

          {/* Accuracy Level */}
          <div className="space-y-2">
            <Label className="font-medium flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-500" />
              Location Accuracy
            </Label>
            <Select
              value={config.accuracy}
              onValueChange={(value: 'high' | 'balanced' | 'low') =>
                setConfig(prev => ({ ...prev, accuracy: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High Accuracy</SelectItem>
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="low">Low Power</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-600">
              {getAccuracyDescription(config.accuracy)}
            </p>
          </div>

          {/* Update Frequency */}
          <div className="space-y-2">
            <Label className="font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              Update Frequency
            </Label>
            <Select
              value={config.updateFrequency}
              onValueChange={(value: 'realtime' | 'periodic' | 'manual') =>
                setConfig(prev => ({ ...prev, updateFrequency: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="realtime">Real-time</SelectItem>
                <SelectItem value="periodic">Periodic</SelectItem>
                <SelectItem value="manual">Manual Only</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-600">
              {getUpdateFrequencyDescription(config.updateFrequency)}
            </p>
          </div>

          {/* Share History */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <Label htmlFor="share-history" className="font-medium flex items-center gap-2">
                {config.shareHistory ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                Share Location History
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                Allow your Aura to learn from your location patterns over time
              </p>
            </div>
            <Switch
              id="share-history"
              checked={config.shareHistory}
              onCheckedChange={(checked) => 
                setConfig(prev => ({ ...prev, shareHistory: checked }))
              }
            />
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-blue-800 mb-1">Your Location Privacy</p>
              <ul className="text-blue-700 space-y-1 text-xs">
                <li>• Location data is processed locally on your device</li>
                <li>• We only store the minimum data needed for your Aura's functionality</li>
                <li>• You can disconnect and delete your location data at any time</li>
                <li>• Location sharing can be paused or adjusted in your settings</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-6 border-t">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleConnect}
            disabled={isConnecting || !locationService.isSupported() || permissionStatus?.denied}
            className="min-w-[120px]"
          >
            {isConnecting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Connecting...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Connect Location</span>
              </div>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}