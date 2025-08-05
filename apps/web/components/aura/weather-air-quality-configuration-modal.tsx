// components/aura/weather-air-quality-configuration-modal.tsx
"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Cloud,
  Wind,
  MapPin,
  Home,
  Plus,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Trash2,
  Search,
  Info,
  Smartphone,
  Globe,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface WeatherAirQualityLocation {
  id: string
  type: 'specific' | 'device'
  name: string
  displayName: string
  country?: string
  lat?: number
  lon?: number
  addedAt: Date
}

interface WeatherAirQualityConfigurationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  senseType: 'weather' | 'air_quality'
  vesselName?: string
  onConfigurationComplete: (locations: WeatherAirQualityLocation[]) => void
  existingLocations?: WeatherAirQualityLocation[]
  existingLocationConnections?: any[] // OAuth connections for location sense
}

type LocationResult = {
  name: string
  lat: number
  lon: number
  country: string
}

async function fetchLocationSuggestions(query: string): Promise<LocationResult[]> {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
  if (!apiKey) {
    console.error("OpenWeather API key is not configured.")
    return []
  }
  try {
    const res = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=8&appid=${apiKey}`
    )
    if (!res.ok) return []
    const data = await res.json()
    return data.map((loc: any) => ({
      name: `${loc.name}${loc.state ? `, ${loc.state}` : ''}`,
      lat: loc.lat,
      lon: loc.lon,
      country: loc.country,
    }))
  } catch (e) {
    console.error('Location lookup failed', e)
    return []
  }
}

export function WeatherAirQualityConfigurationModal({
  open,
  onOpenChange,
  senseType,
  vesselName = "Your Aura",
  onConfigurationComplete,
  existingLocations = [],
  existingLocationConnections = [],
}: WeatherAirQualityConfigurationModalProps) {
  const [locations, setLocations] = useState<WeatherAirQualityLocation[]>(existingLocations)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<LocationResult[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const debounceRef = useRef<number | undefined>(undefined)
  const suggestionsContainerRef = useRef<HTMLDivElement>(null)

  const senseInfo = {
    weather: {
      icon: Cloud,
      title: "Weather Locations",
      description: "Configure multiple locations for weather monitoring",
      color: "from-blue-500 to-sky-500",
      bgColor: "bg-blue-100 text-blue-800 border-blue-200",
    },
    air_quality: {
      icon: Wind,
      title: "Air Quality Locations", 
      description: "Configure multiple locations for air quality monitoring",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-100 text-green-800 border-green-200",
    },
  }[senseType]

  // Reset state when modal opens or existingLocations change
  useEffect(() => {
    if (open) {
      console.log('Modal opened with existing locations:', existingLocations)
      setLocations([...existingLocations])
      setSearchQuery('')
      setSuggestions([])
      setShowSuggestions(false)
      setError(null)
    }
  }, [open, existingLocations])

  // Handle clicks outside suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsContainerRef.current && !suggestionsContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Debounced search effect
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (searchQuery.trim().length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    
    debounceRef.current = window.setTimeout(async () => {
      setIsLoading(true)
      setError(null)
      const results = await fetchLocationSuggestions(searchQuery.trim())
      setSuggestions(results)
      setShowSuggestions(true)
      if (results.length === 0) {
        setError('No locations found. Try a different search term.')
      }
      setIsLoading(false)
    }, 300)
    
    return () => clearTimeout(debounceRef.current)
  }, [searchQuery])

  const addDeviceLocation = () => {
    // Check if device location already exists
    const hasDevice = locations.some(loc => loc.type === 'device')
    if (hasDevice) {
      setError('Device location is already configured')
      return
    }

    // Check if user has location connections from Additional senses
    if (!hasLocationConnections) {
      setError('Please enable location sharing in Additional Senses > Your Location first, then return here to use device location.')
      return
    }

    const deviceLocation: WeatherAirQualityLocation = {
      id: 'device-location',
      type: 'device',
      name: 'Device Location',
      displayName: 'My Device Location',
      addedAt: new Date(),
    }

    setLocations(prev => [...prev, deviceLocation])
    setError(null)
  }

  const addSpecificLocation = (locationResult: LocationResult) => {
    // Check if this location already exists
    const locationKey = `${locationResult.name}, ${locationResult.country}`.toLowerCase()
    const exists = locations.some(loc => 
      loc.type === 'specific' && 
      `${loc.name}, ${loc.country}`.toLowerCase() === locationKey
    )

    if (exists) {
      setError(`${locationResult.name}, ${locationResult.country} is already configured`)
      return
    }

    const newLocation: WeatherAirQualityLocation = {
      id: `${locationResult.lat}-${locationResult.lon}-${Date.now()}`,
      type: 'specific',
      name: locationResult.name,
      displayName: `${locationResult.name}, ${locationResult.country}`,
      country: locationResult.country,
      lat: locationResult.lat,
      lon: locationResult.lon,
      addedAt: new Date(),
    }

    setLocations(prev => [...prev, newLocation])
    setSearchQuery('')
    setSuggestions([])
    setShowSuggestions(false)
    setError(null)
  }

  const removeLocation = (locationId: string) => {
    setLocations(prev => prev.filter(loc => loc.id !== locationId))
    setError(null)
  }

  const handleSave = () => {
    if (locations.length === 0) {
      setError(`Please add at least one location for ${senseType === 'weather' ? 'weather' : 'air quality'} monitoring`)
      return
    }
    onConfigurationComplete(locations)
    onOpenChange(false)
  }

  const getLocationIcon = (location: WeatherAirQualityLocation) => {
    return location.type === 'device' ? Globe : MapPin
  }

  const getLocationColor = (location: WeatherAirQualityLocation) => {
    return location.type === 'device'
      ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
      : `bg-gradient-to-r ${senseInfo.color}`
  }

  const getBadgeColor = (location: WeatherAirQualityLocation) => {
    return location.type === 'device'
      ? 'bg-blue-100 text-blue-800 border-blue-200'
      : senseInfo.bgColor
  }

  const hasLocationConnections = existingLocationConnections && existingLocationConnections.length > 0

  // Helper function to get device display info from location connections
  const getDeviceLocationDisplay = () => {
    if (!hasLocationConnections || existingLocationConnections.length === 0) {
      return 'Device Location'
    }

    // Get the first location connection to display device info
    const device = existingLocationConnections[0]
    
    // Helper function to get device display info (similar to sense-selector logic)
    const getDeviceDisplayInfo = () => {
      // First, try to get structured device info (preferred method)
      if (device.deviceInfo?.browser && device.deviceInfo?.os) {
        return {
          browser: device.deviceInfo.browser,
          os: device.deviceInfo.os,
          displayName: `${device.deviceInfo.browser} ${device.deviceInfo.os}`
        }
      }
      
      // Second, try to parse from accountEmail if it contains device info
      if (device.accountEmail && device.accountEmail.includes(' on ')) {
        const parts = device.accountEmail.split(' on ')
        if (parts.length === 2 && parts[0] && parts[1]) {
          const browser = parts[0].trim()
          const os = parts[1].split(' •')[0]?.trim() || parts[1].trim() // Remove location part if present
          return {
            browser,
            os,
            displayName: `${browser} ${os}`
          }
        }
      }
      
      // Third, try to parse from name field if it contains device info
      if (device.name && device.name.includes(' on ')) {
        const parts = device.name.split(' on ')
        if (parts.length === 2 && parts[0] && parts[1]) {
          const browser = parts[0].trim()
          const os = parts[1].split(' •')[0]?.trim() || parts[1].trim() // Remove location part if present
          return {
            browser,
            os,
            displayName: `${browser} ${os}`
          }
        }
      }
      
      // Fallback to parsing from other fields for backward compatibility
      const deviceInfo = device.name || device.providerId || device.accountEmail || 'unknown'
      const lowerDeviceInfo = deviceInfo.toLowerCase()
      
      const getBrowser = () => {
        if (lowerDeviceInfo.includes('chrome')) return 'Chrome'
        if (lowerDeviceInfo.includes('firefox')) return 'Firefox'
        if (lowerDeviceInfo.includes('safari')) return 'Safari'
        if (lowerDeviceInfo.includes('edge')) return 'Edge'
        return 'Browser'
      }
      
      const getDeviceType = () => {
        if (lowerDeviceInfo.includes('mobile') || lowerDeviceInfo.includes('android') || lowerDeviceInfo.includes('iphone')) return 'Mobile'
        if (lowerDeviceInfo.includes('tablet') || lowerDeviceInfo.includes('ipad')) return 'Tablet'
        if (lowerDeviceInfo.includes('windows')) return 'Windows'
        if (lowerDeviceInfo.includes('mac') || lowerDeviceInfo.includes('macos')) return 'Mac'
        if (lowerDeviceInfo.includes('linux')) return 'Linux'
        return 'Device'
      }
      
      const browser = getBrowser()
      const os = getDeviceType()
      
      let displayName
      if (browser !== 'Browser' && os !== 'Device') {
        displayName = `${browser} ${os}`
      } else if (browser !== 'Browser') {
        displayName = browser
      } else {
        displayName = deviceInfo.length > 20 ? `${deviceInfo.substring(0, 20)}...` : deviceInfo
      }
      
      return { browser, os, displayName }
    }
    
    const deviceDisplayInfo = getDeviceDisplayInfo()
    return deviceDisplayInfo.displayName
  }

  const Icon = senseInfo.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <div className="flex items-center gap-3">
            <div className={cn("p-3 rounded-xl text-white bg-gradient-to-r", senseInfo.color)}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-xl">{senseInfo.title}</DialogTitle>
              <DialogDescription className="text-base mt-1">
                {senseInfo.description} for {vesselName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Current Locations */}
        {locations.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Configured Locations ({locations.length})
            </h3>
            
            <div className="grid gap-3">
              {locations.map((location) => {
                const LocationIcon = getLocationIcon(location)
                
                return (
                  <div
                    key={location.id}
                    className="border border-gray-200 bg-gray-50 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "p-3 rounded-lg text-white",
                          getLocationColor(location)
                        )}>
                          <LocationIcon className="w-5 h-5" />
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 mb-1">
                            {location.displayName}
                          </h4>
                          <div className="flex items-center gap-2">
                            <Badge className={cn("text-xs", getBadgeColor(location))}>
                              {location.type === 'device' ? getDeviceLocationDisplay() : 'Specific Location'}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              Added {location.addedAt instanceof Date ? location.addedAt.toLocaleDateString() : new Date(location.addedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => removeLocation(location.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-800 border-red-300 hover:border-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Add Locations */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            Add Locations
          </h3>

          {/* Device Location Option */}
          {!locations.some(loc => loc.type === 'device') && (
            <div className={cn(
              "border-2 border-dashed rounded-xl p-4 transition-colors",
              hasLocationConnections
                ? "border-gray-300 hover:border-purple-400"
                : "border-orange-300 bg-orange-50"
            )}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "p-3 rounded-lg text-white flex-shrink-0",
                    hasLocationConnections
                      ? "bg-gradient-to-r from-purple-500 to-indigo-500"
                      : "bg-gradient-to-r from-orange-500 to-red-500"
                  )}>
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800">My Device Location</h4>
                    <p className="text-sm text-gray-600 break-words">
                      Use your device's current location for {senseType === 'weather' ? 'weather' : 'air quality'} monitoring
                    </p>
                    {hasLocationConnections ? (
                      <div className="mt-2 flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-green-700 font-medium break-words">
                          Location sharing enabled in Additional Senses
                        </span>
                      </div>
                    ) : (
                      <div className="mt-2 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-orange-700 font-medium break-words">
                          Enable location sharing in Additional Senses → Your Location first
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  onClick={addDeviceLocation}
                  variant="outline"
                  size="sm"
                  disabled={!hasLocationConnections}
                  className={cn(
                    "w-full sm:w-auto flex-shrink-0",
                    !hasLocationConnections && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  <span className="sm:hidden">{hasLocationConnections ? "Add Device Location" : "Location Required"}</span>
                  <span className="hidden sm:inline">{hasLocationConnections ? "Add Device" : "Location Required"}</span>
                </Button>
              </div>
            </div>
          )}

          {/* Specific Location Search */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-blue-400 transition-colors">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className={cn("p-3 rounded-lg text-white bg-gradient-to-r", senseInfo.color)}>
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">Specific Locations</h4>
                  <p className="text-sm text-gray-600">
                    Add specific cities or regions for {senseType === 'weather' ? 'weather' : 'air quality'} monitoring
                  </p>
                </div>
              </div>

              <div className="relative" ref={suggestionsContainerRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search for a city or region..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    className="pl-10"
                  />
                  {isLoading && (
                    <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-gray-500" />
                  )}
                </div>

                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto mt-1">
                    {suggestions.map((suggestion, idx) => {
                      const locationKey = `${suggestion.name}, ${suggestion.country}`.toLowerCase()
                      const alreadyExists = locations.some(loc => 
                        loc.type === 'specific' && 
                        `${loc.name}, ${loc.country}`.toLowerCase() === locationKey
                      )

                      return (
                        <div
                          key={idx}
                          className={cn(
                            "p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0",
                            alreadyExists && "opacity-50 cursor-not-allowed"
                          )}
                          onClick={() => !alreadyExists && addSpecificLocation(suggestion)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-800">
                                {suggestion.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {suggestion.country}
                              </p>
                            </div>
                            {alreadyExists && (
                              <Badge className="bg-gray-100 text-gray-600 text-xs">
                                Already added
                              </Badge>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Info Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-blue-800 mb-1">Location Tips</p>
              <ul className="text-blue-700 space-y-1 text-xs">
                <li>• Device location uses your current position when available</li>
                <li>• Specific locations provide {senseType === 'weather' ? 'weather' : 'air quality'} data for fixed areas</li>
                <li>• You can add multiple locations but not duplicates</li>
                <li>• {vesselName} will monitor all configured locations</li>
                {hasLocationConnections && (
                  <li>• Your location sharing from Additional Senses can be used for device location</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t mt-8 mb-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <p className="text-sm text-gray-500 text-center sm:text-left">
              {locations.length === 0
                ? `Add at least one location for ${senseType === 'weather' ? 'weather' : 'air quality'} monitoring`
                : `${locations.length} location${locations.length !== 1 ? 's' : ''} configured`
              }
            </p>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none">
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={locations.length === 0}
                className={cn("bg-gradient-to-r text-white flex-1 sm:flex-none", senseInfo.color)}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}