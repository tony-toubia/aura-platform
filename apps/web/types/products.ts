// apps/web/types/products.ts

export type VesselProductType = "terra" | "companion" | "digital" | "licensed"

export interface PersonalityPreset {
  name: string
  description: string
}

export interface VesselProduct {
  id: string
  type: VesselProductType
  name: string
  price: string
  icon: string
  image?: string // Added image field
  description: string
  features: string[]
  href: string
  isLicensed?: boolean
  licenseTag?: string
  personalityPreset?: PersonalityPreset
  // For products with animal/variant selection
  hasVariants?: boolean
  variantType?: 'animal' | 'color' | 'size'
}

export interface AnimalOption {
  id: string
  label: string
  icon: string
  category?: 'companion' | 'dinosaur'
}

export interface VesselTypeConfig {
  title: string
  subtitle: string
  border: string
  bg: string
  text: string
  gradient: string
  icon?: string
}