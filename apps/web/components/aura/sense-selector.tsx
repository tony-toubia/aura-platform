// apps/web/components/aura/sense-selector.tsx

"use client"

import React from "react"
import { AVAILABLE_SENSES } from "@/lib/constants"
import {
  Cloud,
  Droplets,
  Sun,
  Globe,
  Activity,
  Wind,
  Info,
  Lock,
  Sparkles,
  Zap,
  Eye,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"

// derive the element type from your constant
type AvailableSense = typeof AVAILABLE_SENSES[number]

interface SenseSelectorProps {
  /** only render these senses */
  availableSenses: readonly AvailableSense[]
  /** built-in senses that cannot be turned off */
  nonToggleableSenses?: string[]
  /** currently selected IDs */
  selectedSenses: string[]
  /** toggle callback */
  onToggle: (senseId: string) => void
}

// Helper function to normalize sense IDs for consistent matching
const normalizeSenseId = (senseId: string): string => {
  return senseId.replace(/([A-Z])/g, "_$1").toLowerCase()
}

// Enhanced icon lookup with more expressive icons
const senseIcons: Record<string, React.ComponentType<any>> = {
  weather: Cloud,
  soil_moisture: Droplets,
  light_level: Sun,
  news: Globe,
  wildlife: Activity,
  air_quality: Wind,
}

const tierConfig = {
  free: {
    color: "from-green-500 to-emerald-600",
    bgColor: "from-green-50 to-emerald-50",
    textColor: "text-green-700",
    borderColor: "border-green-200",
    icon: "✨",
    description: "Available to everyone"
  },
  vessel: {
    color: "from-blue-500 to-sky-600", 
    bgColor: "from-blue-50 to-sky-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    icon: "🔮",
    description: "Requires physical vessel"
  },
  premium: {
    color: "from-purple-500 to-violet-600",
    bgColor: "from-purple-50 to-violet-50", 
    textColor: "text-purple-700",
    borderColor: "border-purple-200",
    icon: "💎",
    description: "Premium subscription"
  }
}

export function SenseSelector({
  availableSenses,
  nonToggleableSenses = [],
  selectedSenses,
  onToggle,
}: SenseSelectorProps) {
  // Normalize the nonToggleableSenses for proper matching
  const normalizedNonToggleable = nonToggleableSenses.map(normalizeSenseId)
  
  const requiredSenses = availableSenses.filter(s => 
    normalizedNonToggleable.includes(normalizeSenseId(s.id))
  )
  const optionalSenses = availableSenses.filter(s => 
    !normalizedNonToggleable.includes(normalizeSenseId(s.id))
  )

  // Helper function to check if a sense is selected.
  // We’ll accept either:
  // a direct id match, or  a normalized‐to‐snake_case match.
  const isSenseSelected = (senseId: string): boolean => {
    const norm = normalizeSenseId(senseId)
    return selectedSenses.some((sel) => {
      // direct match?
      if (sel === senseId) return true
      // normalized match?
      if (normalizeSenseId(sel) === norm) return true
      return false
    })
  }

  return (
    <div className="space-y-8">
      {/* Header with enhanced styling */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
            <Eye className="w-4 h-4" />
            Sense Configuration
          </div>
        </div>
        
        <div className="flex justify-center gap-3">
          {Object.entries(tierConfig).map(([tier, config]) => (
            <div key={tier} className={cn(
              "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r",
              config.bgColor,
              config.textColor
            )}>
              <span>{config.icon}</span>
              <span className="capitalize">{tier}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Required Senses */}
      {requiredSenses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold">Essential Senses</h3>
            <span className="text-sm text-gray-500">(Always enabled)</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requiredSenses.map((sense) => {
              const Icon = senseIcons[sense.id] ?? Info
              const tierInfo = tierConfig[sense.tier as keyof typeof tierConfig]
              
              return (
                <div
                  key={sense.id}
                  className={cn(
                    "relative p-5 rounded-2xl border-2 bg-gradient-to-br transition-all",
                    tierInfo.bgColor,
                    tierInfo.borderColor,
                    "opacity-90"
                  )}
                >
                  <div className="absolute top-3 right-3">
                    <Lock className="w-4 h-4 text-gray-500" />
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "p-3 rounded-xl bg-gradient-to-r text-white shadow-md",
                      tierInfo.color
                    )}>
                      <Icon className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-800">{sense.name}</h4>
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{sense.category}</p>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-xs px-2 py-1 rounded-full bg-gradient-to-r",
                          tierInfo.bgColor,
                          tierInfo.textColor
                        )}>
                          {tierInfo.icon} {sense.tier}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Optional Senses */}
      {optionalSenses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold">Additional Senses</h3>
            <span className="text-sm text-gray-500">(Choose what feels right)</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {optionalSenses.map((sense) => {
              const Icon = senseIcons[sense.id] ?? Info
              const isSelected = isSenseSelected(sense.id)
              const tierInfo = tierConfig[sense.tier as keyof typeof tierConfig]
              
              return (
                <button
                  key={sense.id}
                  onClick={() => onToggle(sense.id)}
                  className={cn(
                    "group relative p-5 rounded-2xl border-2 transition-all duration-300 text-left hover:scale-105 hover:shadow-lg",
                    isSelected
                      ? cn("border-purple-400 bg-gradient-to-br from-purple-50 to-blue-50 shadow-md scale-105")
                      : cn("border-gray-200 hover:border-purple-300 bg-gradient-to-br", tierInfo.bgColor)
                  )}
                >
                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="absolute top-3 right-3">
                      <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "p-3 rounded-xl transition-all duration-300",
                      isSelected
                        ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                        : cn("bg-gradient-to-r text-white shadow-md group-hover:scale-110", tierInfo.color)
                    )}>
                      <Icon className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={cn(
                          "font-semibold transition-colors",
                          isSelected ? "text-purple-800" : "text-gray-800"
                        )}>
                          {sense.name}
                        </h4>
                        {isSelected && (
                          <Zap className="w-4 h-4 text-purple-600 animate-pulse" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{sense.category}</p>
                      
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          "text-xs px-2 py-1 rounded-full bg-gradient-to-r font-medium",
                          tierInfo.bgColor,
                          tierInfo.textColor
                        )}>
                          {tierInfo.icon} {sense.tier}
                        </span>
                        
                        <div className={cn(
                          "text-xs px-2 py-1 rounded-full transition-all",
                          isSelected 
                            ? "bg-purple-100 text-purple-700" 
                            : "bg-gray-100 text-gray-600 group-hover:bg-purple-50 group-hover:text-purple-600"
                        )}>
                          {isSelected ? "Connected" : "Click to add"}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Enhanced Status Summary */}
      <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-pink-50 border-2 border-purple-100 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
            <Eye className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex-1">
            <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Sense Configuration Summary
            </h4>
            
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-purple-800">Active Senses: </span>
                <span className="text-purple-700">{selectedSenses.length}</span>
              </div>
              <div>
                <span className="font-medium text-purple-800">Essential: </span>
                <span className="text-purple-700">{requiredSenses.length}</span>
              </div>
            </div>
            
            <p className="text-purple-700 mt-3 leading-relaxed">
              Each sense adds unique context to your Aura's understanding of the world. 
              Essential senses provide core awareness, while additional senses enrich their personality and responses.
            </p>
            
            {selectedSenses.length > requiredSenses.length && (
              <div className="mt-3 flex items-center gap-2 text-sm text-green-700">
                <CheckCircle2 className="w-4 h-4" />
                <span>Your Aura has enhanced awareness through {selectedSenses.length - requiredSenses.length} additional sense{selectedSenses.length - requiredSenses.length !== 1 ? 's' : ''}!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}