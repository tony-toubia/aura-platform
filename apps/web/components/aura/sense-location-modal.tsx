"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Globe,
  Home,
  Loader2,
  CheckCircle,
  Info,
  Cloud,
  Wind,
  Newspaper,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SenseLocationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  senseType: 'weather' | 'air_quality' | 'news' | 'global_news'
  vesselName?: string
  onLocationSet: (config: LocationConfig) => void
}

export interface LocationConfig {
  type: 'specific' | 'user' | 'global'
  location?: {
    name: string
    lat: number
    lon: number
    country: string
  }
}

type LocationResult = LocationConfig['location']

async function fetchLocationSuggestions(query: string): Promise<LocationResult[]> {
  // Prefer fetching public config via ConfigService to avoid relying on process.env client-side
  const { ConfigService } = await import('@/lib/services/config-service')
  const apiKey = await ConfigService.getOpenweatherApiKey()
  if (!apiKey) {
    console.error("OpenWeather API key is not configured.")
    return []
  }
  const trimmed = query.trim()
  if (!trimmed) return []

  // Helper: direct geocoding by city/state/country
  const callDirect = async (q: string, limit = 8): Promise<LocationResult[]> => {
    const res = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=${limit}&appid=${apiKey}`
    )
    if (!res.ok) return []
    const data = await res.json()
    return data.map((loc: any) => ({
      name: `${loc.name}${loc.state ? `, ${loc.state}` : ''}`,
      lat: loc.lat,
      lon: loc.lon,
      country: loc.country,
    }))
  }

  // Helper: zip code lookup (defaults to US if country not specified)
  const callZip = async (zip: string, country = 'US'): Promise<LocationResult[]> => {
    const res = await fetch(
      `https://api.openweathermap.org/geo/1.0/zip?zip=${encodeURIComponent(`${zip},${country}`)}&appid=${apiKey}`
    )
    if (!res.ok) return []
    const data = await res.json()
    return [{ name: data.name, lat: data.lat, lon: data.lon, country: data.country }]
  }

  try {
    // 1) Zip code patterns: "12345" or "12345,US"
    const zipMatch = trimmed.match(/^(\d{5})(?:[\s,]+([A-Za-z]{2,3}))?$/)
    if (zipMatch) {
      const zip = zipMatch[1]!
      const cc = zipMatch[2]
      const country = cc ? cc.toUpperCase() : 'US'
      const byZip = await callZip(zip, country)
      if (byZip.length) return byZip
    }

    // 2) "City, ST" or "City ST" → assume US state code if 2 letters
    const cityStateMatch = trimmed.match(/^(.+?)[,\s]+([A-Za-z]{2})$/)
    if (cityStateMatch) {
      const city = cityStateMatch[1].trim()
      const state = cityStateMatch[2].toUpperCase()
      const q = `${city},${state},US`
      const byCityState = await callDirect(q)
      if (byCityState.length) return byCityState
    }

    // 3) Try as-is
    let results = await callDirect(trimmed)
    if (results.length) return results

    // 4) Fallback: append country if not provided (default US)
    if (!trimmed.includes(',')) {
      results = await callDirect(`${trimmed},US`)
      if (results.length) return results
    }
  } catch (e) {
    console.error('Suggestion lookup failed', e)
  }
  return []
}

export function SenseLocationModal({
  open,
  onOpenChange,
  senseType,
  vesselName = "Your Aura",
  onLocationSet,
}: SenseLocationModalProps) {
  const [locationType, setLocationType] = useState<'specific' | 'user' | 'global'>('specific')
  const [locationQuery, setLocationQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<LocationResult[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchResult, setSearchResult] = useState<LocationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const debounceRef = useRef<number | undefined>(undefined)
  const suggestionsContainerRef = useRef<HTMLDivElement>(null);


  const senseInfo = {
    weather: {
      icon: Cloud,
      title: "Weather Location",
      description: "Where should your Aura check the weather?",
    },
    air_quality: {
      icon: Wind,
      title: "Air Quality Location",
      description: "Which area's air quality should your Aura monitor?",
    },
    news: {
      icon: Newspaper,
      title: "News Preference",
      description: "What news should your Aura stay informed about?",
    },
    global_news: {
      icon: Newspaper,
      title: "Global News Preference",
      description: "Configure global news settings for your Aura",
    },
  }[senseType]

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setLocationQuery('')
      setSuggestions([])
      setShowSuggestions(false)
      setSearchResult(null)
      setError(null)
    }
  }, [open])
  
  // Effect to handle clicks outside the suggestions dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsContainerRef.current && !suggestionsContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [suggestionsContainerRef]);


  // Debounced search effect
  useEffect(() => {
    if (locationType !== 'specific') return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (locationQuery.trim().length < 2) {
      setSuggestions([])
      return
    }
    debounceRef.current = window.setTimeout(async () => {
      setIsLoading(true)
      const results = await fetchLocationSuggestions(locationQuery.trim())
      setSuggestions(results)
      setError(results.length === 0 ? 'No matches found.' : null)
      setIsLoading(false)
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [locationQuery, locationType])

  const handleSelect = (loc: LocationResult) => {
    setSearchResult(loc)
    setLocationQuery(loc!.name)
    setSuggestions([])
    setShowSuggestions(false) // Close suggestions on select
    setError(null)
  }

  const handleConfirm = () => {
    if (locationType === 'specific' && !searchResult) return
    onLocationSet({ type: locationType, location: searchResult || undefined })
    onOpenChange(false)
  }

  const canConfirm = locationType !== 'specific' || Boolean(searchResult)
  const Icon = senseInfo.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle>{senseInfo.title}</DialogTitle>
              <DialogDescription>{senseInfo.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <RadioGroup value={locationType} onValueChange={(v) => setLocationType(v as any)}>
            {/* Specific */}
            <label className={cn(
              "flex flex-col gap-3 p-4 rounded-lg border-2 cursor-pointer",
              locationType === 'specific'
                ? "border-purple-400 bg-purple-50"
                : "border-gray-200 hover:border-purple-200"
            )}>
              <div className="flex items-start gap-3">
                <RadioGroupItem value="specific" className="mt-1" />
                <div>
                  <h4 className="font-medium flex items-center gap-2"><MapPin className="w-4 h-4" /> Specific Location</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {senseType === 'news'
                      ? `${vesselName} will follow news from this area`
                      : `${vesselName} will monitor conditions at this location`}
                  </p>
                </div>
              </div>
              {locationType === 'specific' && (
                <div className="relative" ref={suggestionsContainerRef}>
                  <Input
                    placeholder="Type a location..."
                    value={locationQuery}
                    onChange={(e) => { 
                      setLocationQuery(e.target.value); 
                      setSearchResult(null);
                      setShowSuggestions(true); // Show suggestions when typing
                    }}
                    onFocus={() => setShowSuggestions(true)} // Show on focus as well
                    className="w-full"
                  />
                  {isLoading && <Loader2 className="absolute right-3 top-3 w-5 h-5 animate-spin text-gray-500" />}
                  {showSuggestions && suggestions.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border rounded-md max-h-40 overflow-auto mt-1">
                      {suggestions.map((loc, idx) => (
                        <li
                          key={idx}
                          className="p-2 hover:bg-purple-100 cursor-pointer"
                          onClick={() => handleSelect(loc)}
                        >
                          {loc!.name}, {loc!.country}
                        </li>
                      ))}
                    </ul>
                  )}
                  {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
                  {searchResult && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">{searchResult.name}, {searchResult.country}</span>
                    </div>
                  )}
                </div>
              )}
            </label>

            {/* User */}
            <label className={cn(
              "flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer",
              locationType === 'user'
                ? "border-purple-400 bg-purple-50"
                : "border-gray-200 hover:border-purple-200"
            )}>
              <RadioGroupItem value="user" className="mt-1" />
              <div>
                <h4 className="font-medium flex items-center gap-2"><Home className="w-4 h-4" /> My Location</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {senseType === 'news'
                    ? `${vesselName} will follow news from wherever you are`
                    : `${vesselName} will track conditions at your current location`}
                </p>
                <div className="mt-2 p-2 bg-blue-50 rounded flex items-start gap-2">
                  <Info className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-700">This will use your device's location when available</p>
                </div>
              </div>
            </label>

            {/* Global */}
            {senseType === 'news' && (
              <label className={cn(
                "flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer",
                locationType === 'global'
                  ? "border-purple-400 bg-purple-50"
                  : "border-gray-200 hover:border-purple-200"
              )}>
                <RadioGroupItem value="global" className="mt-1" />
                <div>
                  <h4 className="font-medium flex items-center gap-2"><Globe className="w-4 h-4" /> Global News</h4>
                  <p className="text-sm text-gray-600 mt-1">{vesselName} will stay informed about major world events</p>
                </div>
              </label>
            )}
          </RadioGroup>
        </div>

        <DialogFooter className="mt-8 mb-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="whitespace-nowrap">Cancel</Button>
          <Button onClick={handleConfirm} disabled={!canConfirm} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 whitespace-nowrap">Confirm Location</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
