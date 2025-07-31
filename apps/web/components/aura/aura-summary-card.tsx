// components/aura/Aura-summary-card.tsx
import React from 'react'
import type { AuraFormData } from '@/types/aura-forms'
import { Badge } from '@/components/ui/badge'
import { CheckCircle } from 'lucide-react'

  export function AuraSummaryCard({ config }: { config: AuraFormData }) {
  return (
    <div className="p-4 rounded-lg border bg-white shadow-sm text-sm">
      <div className="flex items-center gap-2 mb-2 text-purple-700 font-semibold">
        <CheckCircle className="w-4 h-4" />
        Final Aura Configuration Summary
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <span className="text-gray-500">Name:</span>
          <div className="font-medium">{config.name}</div>
        </div>
        <div>
          <span className="text-gray-500">Vessel:</span>
          <div className="capitalize">{config.vesselType}</div>
        </div>
        <div>
          <span className="text-gray-500">Senses:</span>
          <div>{config.availableSenses.length} selected</div>
        </div>
        <div>
          <span className="text-gray-500">Rules:</span>
          <div>{config.rules.length}</div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge variant="outline">Tone: {config.personality.tone}</Badge>
        <Badge variant="outline">Vocabulary: {config.personality.vocabulary}</Badge>
        <Badge variant="outline">Persona: {config.personality.persona || '—'}</Badge>
      </div>
    </div>
  )
}
