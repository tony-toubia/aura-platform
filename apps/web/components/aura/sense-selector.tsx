// apps/web/components/aura/sense-selector.tsx

"use client"

import React from "react"
import { AVAILABLE_SENSES, type SenseId, type VesselTypeId } from "@/lib/constants"
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
  WifiCog,
} from "lucide-react"
import { cn } from "@/lib/utils"

// derive the element type from your constant
export type AvailableSense = typeof AVAILABLE_SENSES[number]

interface SenseSelectorProps {
  /** only render these senses */
  availableSenses: readonly AvailableSense[]
  /** built-in senses that cannot be turned off */
  nonToggleableSenses?: SenseId[]
  /** currently selected IDs */
  selectedSenses: SenseId[]
  /** toggle callback */
  onToggle: (senseId: SenseId) => void
  /** The type of vessel the aura is associated with */
  vesselType: VesselTypeId
}

// Normalize IDs for matching
const normalizeSenseId = (senseId: string): string =>
  senseId.includes("_")
    ? senseId.toLowerCase()
    : senseId.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()

// Icon lookup
const senseIcons: Record<string, React.ComponentType<any>> = {
  weather: Cloud,
  soil_moisture: Droplets,
  light_level: Sun,
  news: Globe,
  wildlife: Activity,
  air_quality: Wind,
  location: Globe,
  fitness: Activity,
  sleep: Droplets,
  calendar: Info,
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
    color: "from-orange-500 to-red-600",
    bgColor: "from-orange-50 to-red-50",
    textColor: "text-orange-700",
    borderColor: "border-orange-200",
    icon: "💎",
    description: "Premium subscription"
  }
}

// IDs for connected/synced senses
const CONNECTED_SENSE_IDS: readonly SenseId[] = [
  'location',
  'fitness',
  'sleep',
  'calendar',
]

export function SenseSelector({
  availableSenses,
  nonToggleableSenses = [],
  selectedSenses,
  onToggle,
  vesselType,
}: SenseSelectorProps) {
  const normalizedRequired = nonToggleableSenses.map(normalizeSenseId)
  const requiredSenses = availableSenses.filter(s =>
    normalizedRequired.includes(normalizeSenseId(s.id))
  )
  const optionalSenses = availableSenses.filter(s =>
    !normalizedRequired.includes(normalizeSenseId(s.id)) &&
    !CONNECTED_SENSE_IDS.includes(s.id as SenseId)
  )
  const connectedSenses = availableSenses.filter(s =>
    CONNECTED_SENSE_IDS.includes(s.id as SenseId)
  )

  const isSelected = (id: string) =>
    selectedSenses.includes(normalizeSenseId(id) as SenseId)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
            <Eye className="w-4 h-4" /> Sense Configuration
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

      {/* Essential Senses */}
      {requiredSenses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold">Essential Senses</h3>
            <span className="text-sm text-gray-500">(Always enabled)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requiredSenses.map(sense => {
              const Icon = senseIcons[sense.id] ?? Info
              const tierInfo = tierConfig[sense.tier as keyof typeof tierConfig]
              return (
                <div key={sense.id} className={cn(
                  "relative p-5 rounded-2xl border-2 bg-gradient-to-br",
                  tierInfo.bgColor,
                  tierInfo.borderColor,
                  "opacity-90"
                )}>
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
              )
            })}
          </div>
        </div>
      )}

      {/* Additional Senses */}
      {optionalSenses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold">Additional Senses</h3>
            <span className="text-sm text-gray-500">(Choose what feels right)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {optionalSenses.map(sense => {
              const Icon = senseIcons[sense.id] ?? Info
              const active = isSelected(sense.id)
              const tierInfo = tierConfig[sense.tier as keyof typeof tierConfig]
              return (
                <button
                  key={sense.id}
                  onClick={() => onToggle(sense.id as SenseId)}
                  className={cn(
                    "group relative p-5 rounded-2xl border-2 transition-all hover:scale-105 hover:shadow-lg",
                    active
                      ? "border-purple-400 bg-gradient-to-br from-purple-50 to-blue-50 shadow-md"
                      : cn("border-gray-200 hover:border-purple-300 bg-white", tierInfo.bgColor)
                  )}
                >
                  {active && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle2 className="w-5 h-5 text-purple-600" />
                    </div>
                  )}
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "p-3 rounded-xl transition-all",
                      active
                        ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                        : cn("bg-gradient-to-r text-white shadow-md group-hover:scale-110", tierInfo.color)
                    )}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={cn(
                          "font-semibold transition-colors",
                          active ? "text-purple-800" : "text-gray-800"
                        )}>{sense.name}</h4>
                        {active && (
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
                          active 
                            ? "bg-purple-100 text-purple-700" 
                            : "bg-gray-100 text-gray-600 group-hover:bg-purple-50 group-hover:text-purple-600"
                        )}>
                          {active ? "Connected" : "Click to add"}
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

      {/* Connected Senses */}
      {connectedSenses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <WifiCog className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold">Connected Senses</h3>
            <span className="text-sm text-gray-500">(Sync your data)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {connectedSenses.map(sense => {
              const Icon = senseIcons[sense.id] ?? Info
              const active = isSelected(sense.id)
              const tierInfo = tierConfig[sense.tier as keyof typeof tierConfig]
              return (
                <button
                  key={sense.id}
                  onClick={() => onToggle(sense.id as SenseId)}
                  className={cn(
                    "group relative p-5 rounded-2xl border-2 transition-all hover:scale-105 hover:shadow-lg",
                    active
                      ? "border-purple-400 bg-gradient-to-br from-purple-50 to-blue-50 shadow-md"
                      : cn("border-gray-200 hover:border-purple-300 bg-white", tierInfo.bgColor)
                  )}
                >
                  {active && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle2 className="w-5 h-5 text-purple-600" />
                    </div>
                  )}
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "p-3 rounded-xl transition-all duration-300",
                      active
                        ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                        : cn("bg-gradient-to-r text-white shadow-md group-hover:scale-110", tierInfo.color)
                    )}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={cn(
                          "font-semibold transition-colors",
                          active ? "text-purple-800" : "text-gray-800"
                        )}>{sense.name}</h4>
                        {active && (
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
                          active 
                            ? "bg-purple-100 text-purple-700" 
                            : "bg-gray-100 text-gray-600 group-hover:bg-purple-50 group-hover:text-purple-600"
                        )}>
                          {active ? "Connected" : "Click to sync"}
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

      {/* Status Summary */}
      <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-pink-50 border-2 border-purple-100 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
            <Eye className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Sense Configuration Summary
            </h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-purple-800">Active Senses:</span>
                <span className="text-purple-700">{selectedSenses.length}</span>
              </div>
              <div>
                <span className="font-medium text-purple-800">Essential:</span>
                <span className="text-purple-700">{requiredSenses.length}</span>
              </div>
            </div>
            <p className="text-purple-700 mt-3 leading-relaxed">
              Each sense adds unique context to your Aura's understanding of the world. Essential senses provide core awareness, while additional senses enrich their personality and responses.
            </p>
            {selectedSenses.length > requiredSenses.length && (
              <div className="mt-3 flex items-center gap-2 text-sm text-green-700">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  Your Aura has enhanced awareness through {selectedSenses.length - requiredSenses.length} additional sense{selectedSenses.length - requiredSenses.length !== 1 ? 's' : ''}!
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
