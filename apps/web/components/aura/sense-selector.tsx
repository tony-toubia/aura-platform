// apps/web/app/(dashboard)/auras/create/sense-selector.tsx
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
} from "lucide-react"
import { cn } from "@/lib/utils"

// derive the element type from your constant
type AvailableSense = typeof AVAILABLE_SENSES[number]

interface SenseSelectorProps {
  /** only render these senses */
  availableSenses: AvailableSense[]
  /** built-in senses that cannot be turned off */
  nonToggleableSenses?: string[]
  /** currently selected IDs */
  selectedSenses: string[]
  /** toggle callback */
  onToggle: (senseId: string) => void
}

// icon lookup
const senseIcons: Record<string, React.ComponentType<any>> = {
  weather: Cloud,
  soil_moisture: Droplets,
  light_level: Sun,
  news: Globe,
  wildlife: Activity,
  air_quality: Wind,
}

const tierColors: Record<string, string> = {
  free: "bg-green-100 text-green-700",
  vessel: "bg-blue-100 text-blue-700",
  premium: "bg-purple-100 text-purple-700",
}

export function SenseSelector({
  availableSenses,
  nonToggleableSenses = [],
  selectedSenses,
  onToggle,
}: SenseSelectorProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          Connect data sources to enrich your Aura&apos;s awareness
        </p>
        <div className="flex items-center space-x-2 text-xs">
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
            Free
          </span>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
            Vessel
          </span>
          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
            Premium
          </span>
        </div>
      </div>

      {/* Grid of allowed senses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableSenses.map((sense) => {
          const Icon = senseIcons[sense.id] ?? Info
          const isSelected = selectedSenses.includes(sense.id)
          const isLocked = nonToggleableSenses.includes(sense.id)

          return (
            <button
              key={sense.id}
              onClick={() => {
                if (!isLocked) onToggle(sense.id)
              }}
              disabled={isLocked}
              className={cn(
                "relative p-4 rounded-xl border-2 transition-all text-left",
                isSelected
                  ? "border-purple-700 bg-purple-50 shadow-md"
                  : "border-gray-200 hover:border-purple-500 hover:shadow-sm",
                isLocked && "opacity-70 cursor-not-allowed"
              )}
            >
              {isLocked && (
                <div className="absolute top-2 right-2 text-gray-500">
                  <Lock className="w-4 h-4" />
                </div>
              )}

              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div
                    className={cn(
                      "p-2 rounded-lg",
                      isSelected
                        ? "bg-purple-100 text-purple-700"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium">{sense.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {sense.category}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <span
                    className={cn(
                      "text-xs px-2 py-1 rounded",
                      tierColors[sense.tier]
                    )}
                  >
                    {sense.tier}
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Footer note */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 mb-1">
              Selected Senses: {selectedSenses.length}
            </p>
            <p className="text-blue-700">
              Each sense adds unique context to your Aura&apos;s responses.
              Premium senses require a Pro subscription.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
