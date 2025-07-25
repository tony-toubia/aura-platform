// apps/web/lib/constants.ts

// ————————————————
// 1) Vessel types
// ————————————————
export type VesselTypeId =
  | "digital"
  | "terra"
  | "companion"
  | "memory"
  | "sage"

export interface VesselType {
  id: VesselTypeId
  name: string
  icon: string        // emoji or string-based icon
  description: string
  price?: number
  disabled: boolean    // now present on every item
}

export const VESSEL_TYPES: VesselType[] = [
  {
    id: "digital",
    name: "Digital",
    icon: "🤖",
    description: "Free digital vessel, no hardware required",
    disabled: false,
  },
  {
    id: "terra",
    name: "Terra",
    icon: "🌱",
    description: "Plant Companion",
    price: 79,
    disabled: false,
  },
  {
    id: "companion",
    name: "Companion",
    icon: "🐘",
    description: "Wildlife Connection",
    price: 149,
    disabled: false,
  },
  {
    id: "memory",
    name: "Memory",
    icon: "💎",
    description: "Digital Keepsake",
    price: 99,
    disabled: true,
  },
  {
    id: "sage",
    name: "Sage",
    icon: "📚",
    description: "Knowledge Artifact",
    price: 129,
    disabled: true,
  },
]

// ————————————————
// 2) Personality traits
// ————————————————
export const PERSONALITY_TRAITS = [
  { id: "warmth",      name: "Warmth",      low: "Analytical", high: "Warm"       },
  { id: "playfulness", name: "Playfulness", low: "Serious",    high: "Playful"    },
  { id: "verbosity",   name: "Verbosity",   low: "Concise",    high: "Verbose"    },
  { id: "empathy",     name: "Empathy",     low: "Objective",  high: "Empathetic" },
  { id: "creativity",  name: "Creativity",  low: "Factual",    high: "Creative"   },
] as const

// ————————————————
// 3) All possible senses
// ————————————————
export const AVAILABLE_SENSES = [
  // Environmental senses
  { id: "weather",       name: "Weather",          category: "Environmental", tier: "Free"    },
  { id: "news",          name: "News Feed",        category: "Knowledge",     tier: "Free"    },
  { id: "air_quality",   name: "Air Quality",      category: "Environmental", tier: "Free"    },
  { id: "soil_moisture", name: "Soil Moisture",    category: "Sensors",       tier: "Vessel"  },
  { id: "light_level",   name: "Light Level",      category: "Sensors",       tier: "Vessel"  },
  { id: "wildlife",      name: "Wildlife Tracking",category: "Nature",        tier: "Premium" },
  
  // Personal senses (about the user)
  { id: "sleep",         name: "Your Sleep",       category: "Personal Health",      tier: "Premium" },
  { id: "fitness",       name: "Your Fitness",     category: "Personal Health",      tier: "Premium" },
  { id: "calendar",      name: "Your Calendar",    category: "Personal Activity",    tier: "Premium" },
  { id: "location",      name: "Your Location",    category: "Personal Activity",    tier: "Premium" },
] as const

export type SenseId = typeof AVAILABLE_SENSES[number]["id"]

// —————————————————————————————————————————————————————————
// 4) Per-vessel sense configuration (built-in vs optional)
// —————————————————————————————————————————————————————————
export interface VesselSenseConfig {
  /** Always-on, cannot be toggled off */
  defaultSenses: SenseId[]
  /** User may add or remove these */
  optionalSenses: SenseId[]
}

export const VESSEL_SENSE_CONFIG: Record<
  VesselTypeId,
  VesselSenseConfig
> = {
  digital: {
    defaultSenses: [],
    optionalSenses: ["weather", "news", "air_quality", "sleep", "fitness", "calendar", "location"],
  },
  terra: {
    defaultSenses: ["soil_moisture", "light_level"],
    optionalSenses: ["weather", "news", "air_quality", "sleep", "fitness", "calendar", "location"],
  },
  companion: {
    defaultSenses: ["wildlife"],
    optionalSenses: ["weather", "news", "air_quality", "sleep", "fitness", "calendar", "location"],
  },
  memory: {
    defaultSenses: [],      
    optionalSenses: ["sleep", "fitness", "calendar", "location"], // Memory vessels could access personal data
  },
  sage: {
    defaultSenses: [],      
    optionalSenses: ["news", "calendar", "sleep", "fitness", "location"], // Sage vessels focus on knowledge and personal insights
  },
}