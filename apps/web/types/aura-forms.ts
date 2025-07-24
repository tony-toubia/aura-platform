// apps/web/types/aura-forms.ts

import type { VesselTypeId, SenseId } from '@/lib/constants'
import type { BehaviorRule, Personality } from '@/types'

export type AuraFormStep = 'vessel' | 'plant' | 'senses' | 'details' | 'rules'
export type AuraEditStep = 'senses' | 'details' | 'rules'

export interface AuraFormData {
  id: string
  name: string
  vesselType: VesselTypeId | ""
  vesselCode: string
  plantType?: string
  personality: Personality
  senses: SenseId[]
  rules: BehaviorRule[]
  selectedStudyId?: string
  selectedIndividualId?: string
}

export interface ManualVesselOption {
  code: string
  type: VesselTypeId
}

export const MANUAL_VESSEL_OPTIONS: ManualVesselOption[] = [
  { code: "terra", type: "terra" },
  { code: "terra - sensor", type: "terra" },
  { code: "terra - pot", type: "terra" },
  { code: "companion", type: "companion" },
  { code: "companion - elephant", type: "companion" },
  { code: "companion - tortoise", type: "companion" },
  { code: "companion - lion", type: "companion" },
  { code: "companion - whale", type: "companion" },
  { code: "companion - giraffe", type: "companion" },
  { code: "companion - shark", type: "companion" },
  { code: "companion - gorilla", type: "companion" },
  { code: "licensed - yoda", type: "terra" },
  { code: "licensed - gru", type: "terra" },
  { code: "licensed - captain america", type: "terra" },
  { code: "licensed - blue", type: "terra" },
]