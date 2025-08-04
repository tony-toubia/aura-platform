// components/aura/news-configuration-modal.tsx
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
  Newspaper,
  Globe,
  MapPin,
  Plus,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Trash2,
  Search,
  Info,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface NewsLocation {
  id: string
  type: 'global' | 'specific'
  name: string
  displayName: string
  country?: string
  lat?: number
  lon?: number
  addedAt: Date
}

interface NewsConfigurationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vesselName?: string
  onConfigurationComplete: (locations: NewsLocation[]) => void
  existingLocations?: NewsLocation[]
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

export function NewsConfigurationModal({
  open,
  onOpenChange,
  vesselName = "Your Aura",
  onConfigurationComplete,
  existingLocations = [],
}: NewsConfigurationModalProps) {
  const [locations, setLocations] = useState<NewsLocation[]>(existingLocations)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<LocationResult[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const debounceRef = useRef<number | undefined>(undefined)
  const suggestionsContainerRef = useRef<HTMLDivElement>(null)

  // Reset state when modal opens or existingLocations change
  useEffect(() => {
    if (open) {
      console.log('Modal opened with existing locations:', existingLocations)
      setLocations([...existingLocations]) // Create a new array to ensure state update
      setSearchQuery('')
      setSuggestions([])
      setShowSuggestions(false)
      setError(null)
    }
  }, [open, existingLocations])

  // Also update locations when existingLocations change while modal is open
  useEffect(() => {
    if (open) {
      console.log('Existing locations updated while modal open:', existingLocations)
      setLocations([...existingLocations])
    }
  }, [existingLocations, open])

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

  const addGlobalNews = () => {
    // Check if global news already exists
    const hasGlobal = locations.some(loc => loc.type === 'global')
    if (hasGlobal) {
      setError('Global news is already configured')
      return
    }

    const globalLocation: NewsLocation = {
      id: 'global',
      type: 'global',
      name: 'Global',
      displayName: 'Global News',
      addedAt: new Date(),
    }

    setLocations(prev => [...prev, globalLocation])
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

    const newLocation: NewsLocation = {
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
      setError('Please add at least one news source')
      return
    }
    onConfigurationComplete(locations)
    onOpenChange(false)
  }

  const getLocationIcon = (location: NewsLocation) => {
    return location.type === 'global' ? Globe : MapPin
  }

  const getLocationColor = (location: NewsLocation) => {
    return location.type === 'global' 
      ? 'bg-gradient-to-r from-blue-500 to-indigo-500' 
      : 'bg-gradient-to-r from-green-500 to-emerald-500'
  }

  const getBadgeColor = (location: NewsLocation) => {
    return location.type === 'global'
      ? 'bg-blue-100 text-blue-800 border-blue-200'
      : 'bg-green-100 text-green-800 border-green-200'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <Newspaper className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-xl">Configure News Sources</DialogTitle>
              <DialogDescription className="text-base mt-1">
                Add multiple news sources for {vesselName} to stay informed about
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Current News Sources */}
        {locations.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Configured News Sources ({locations.length})
            </h3>
            
            <div className="grid gap-3">
              {locations.map((location) => {
                const Icon = getLocationIcon(location)
                
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
                          <Icon className="w-5 h-5" />
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 mb-1">
                            {location.displayName}
                          </h4>
                          <div className="flex items-center gap-2">
                            <Badge className={cn("text-xs", getBadgeColor(location))}>
                              {location.type === 'global' ? 'Global Coverage' : 'Regional News'}
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

        {/* Add Global News */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            Add News Sources
          </h3>

          {/* Global News Option - Only show if not already added */}
          {!locations.some(loc => loc.type === 'global') && (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-blue-400 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Global News</h4>
                    <p className="text-sm text-gray-600">
                      Major world events, international headlines, and breaking news
                    </p>
                  </div>
                </div>
                <Button
                  onClick={addGlobalNews}
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Global
                </Button>
              </div>
            </div>
          )}

          {/* Specific Location Search */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-green-400 transition-colors">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">Regional News</h4>
                  <p className="text-sm text-gray-600">
                    Local news, regional events, and area-specific coverage
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
              <p className="font-medium text-blue-800 mb-1">News Source Tips</p>
              <ul className="text-blue-700 space-y-1 text-xs">
                <li>• Global news covers international headlines</li>
                <li>• Regional news sources provide local coverage for specific areas</li>
                <li>• You can add multiple regional sources but not duplicates</li>
                <li>• {vesselName} will aggregate news from all configured sources</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-6 border-t mt-8 mb-4">
          <p className="text-sm text-gray-500">
            {locations.length === 0
              ? 'Add at least one news source to continue'
              : `${locations.length} news source${locations.length !== 1 ? 's' : ''} configured`
            }
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="whitespace-nowrap">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={locations.length === 0}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 whitespace-nowrap"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}