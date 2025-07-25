// apps/web/lib/vessel-products.ts

import type { VesselProduct, VesselProductType, AnimalOption, VesselTypeConfig } from '@/types/products'

// Re-export types for convenience
export type { VesselProduct, VesselProductType, AnimalOption, VesselTypeConfig } from '@/types/products'

export const VESSEL_PRODUCTS: VesselProduct[] = [
  // Terra - Original
  {
    id: "terra-pot",
    type: "terra",
    icon: "🌱",
    image: "/images/vessels/terra-pot.png",
    name: "Ceramic Plant Pot",
    price: "$39.99",
    description:
      "Elegant ceramic pot with built-in soil moisture, light & temperature sensors—perfect for your Terra Spirit Aura.",
    features: ["Soil moisture sensor", "Light sensor", "Temperature probe"],
    href: "/vessels/terra-pot",
  },
  {
    id: "terra-prong-sensor",
    type: "terra",
    icon: "🔌",
    image: "/images/vessels/terra-sensor.png",
    name: "Pronged Plant Sensor",
    price: "$19.99",
    description:
      "Standalone pronged device that plugs into soil and transmits sensor data over WiFi—portable Terra sensing on the go.",
    features: ["WiFi connectivity", "Two-pronged probe", "Battery-powered"],
    href: "/vessels/terra-prong-sensor",
  },
  
  // Terra - Animal Figurine Plant Sensors (Non-licensed)
  {
    id: "terra-animal-sensor",
    type: "terra",
    icon: "", // rendered dynamically
    image: "/images/vessels/terra-sensor.png",
    name: "Animal Figurine Plant Sensor",
    price: "$34.99",
    description:
      "Adorable animal figurine with hidden plant sensors—combine wildlife charm with Terra sensing capabilities.",
    features: ["Disguised sensors", "Weather-resistant", "Solar-powered option"],
    href: "/vessels/terra-animal-sensor",
    hasVariants: true,
    variantType: 'animal',
  },
  
  // Companion: Original Plush & Figurine
  {
    id: "companion-plush",
    type: "companion",
    icon: "", // rendered dynamically
    image: "/images/vessels/companion-plush-elephant.png",
    name: "Plush Animal Companion",
    price: "$24.99",
    description:
      "Soft, huggable plush toy—select your favorite animal to bring your Companion Aura to life.",
    features: ["Ultra-soft fabric", "Bluetooth link", "LED 'smart' eyes"],
    href: "/vessels/companion-plush",
    hasVariants: true,
    variantType: 'animal',
  },
  {
    id: "companion-figurine",
    type: "companion",
    icon: "", // rendered dynamically
    image: "/images/vessels/companion-figurine-lion.png",
    name: "Desktop Figurine",
    price: "$29.99",
    description:
      "Hand-painted resin figurine—choose an animal and display your Companion Aura on your desk.",
    features: ["Hand-painted detail", "LED-lit base", "USB-powered"],
    href: "/vessels/companion-figurine",
    hasVariants: true,
    variantType: 'animal',
  },
  {
    id: "companion-bracelet",
    type: "companion",
    icon: "",
    image: "/images/vessels/companion-bracelet-whale.png",
    name: "Companion Bracelet",
    price: "$19.99",
    description:
      "Wearable bracelet companion—choose an animal to carry your spirit with you.",
    features: ["Adjustable band", "Bluetooth link", "Notification LED"],
    href: "/vessels/companion-bracelet",
    hasVariants: true,
    variantType: 'animal',
  },
  
  // Digital - Original
  {
    id: "digital-glass-orb",
    type: "digital",
    icon: "🔮",
    image: "/images/vessels/digital-glass-orb.png",
    name: "Glass Orb Vessel",
    price: "$29.99",
    description:
      "A sleek glass orb with LED glow & touch controls—ideal showcase for your Digital Being Aura.",
    features: ["LED indicators", "Touch sensors", "Wireless charging"],
    href: "/vessels/digital-glass-orb",
  },
  {
    id: "digital-wooden-box",
    type: "digital",
    icon: "🪵",
    image: "/images/vessels/digital-wooden-box.png",
    name: "Handcrafted Wooden Box",
    price: "$34.99",
    description:
      "Rustic wooden box embedding hidden sensors—gives your Digital Being a warm, tactile home.",
    features: ["Smooth finish", "Hidden sensors", "USB-C power"],
    href: "/vessels/digital-wooden-box",
  },
  {
    id: "digital-ceramic-cube",
    type: "digital",
    icon: "🧊",
    image: "/images/vessels/digital-ceramic-cube.png",
    name: "Ceramic Cube Vessel",
    price: "$24.99",
    description:
      "Modern ceramic cube with customizable LED accents—perfect minimalist home for your Digital Aura.",
    features: ["Customizable LED", "Touch interface", "USB powered"],
    href: "/vessels/digital-ceramic-cube",
  },
  {
    id: "digital-bracelet",
    type: "digital",
    icon: "📿",
    image: "/images/vessels/companion-bracelet-whale.png",
    name: "Digital Bracelet Vessel",
    price: "$19.99",
    description:
      "Stylish wearable bracelet housing your Digital Being Aura—stay connected on the go.",
    features: ["OLED display", "Bluetooth sync", "Adjustable band"],
    href: "/vessels/digital-bracelet",
  },
  
  // Licensed Characters
  {
    id: "licensed-yoda-plant",
    type: "licensed",
    icon: "🌿",
    image: "/images/vessels/licensed-yoda.png",
    name: "Yoda Plant Guardian",
    price: "$49.99",
    description:
      "Wise you must be, to grow plants successfully. Master Yoda watches over your garden with built-in sensors.",
    features: ["Force-sensitive sensors", "Wisdom quotes", "Lightsaber LED"],
    href: "/vessels/licensed-yoda-plant",
    isLicensed: true,
    licenseTag: "Star Wars™",
    personalityPreset: {
      name: "Jedi Master",
      description: "Patient, wise, and speaks in riddles"
    }
  },
  {
    id: "licensed-gru-figurine",
    type: "licensed",
    icon: "🦹",
    image: "/images/vessels/licensed-gru.png",
    name: "Gru Villainous Vessel",
    price: "$44.99",
    description:
      "Former supervillain turned loving father—Gru brings mischievous charm to your desktop companion.",
    features: ["Minion sound effects", "Freeze ray LED", "Accent voice module"],
    href: "/vessels/licensed-gru-figurine",
    isLicensed: true,
    licenseTag: "Illumination™",
    personalityPreset: {
      name: "Reformed Villain",
      description: "Gruff exterior with a heart of gold"
    }
  },
  {
    id: "licensed-captain-america",
    type: "licensed",
    icon: "🛡️",
    image: "/images/vessels/licensed-captain-america.png",
    name: "Captain America Shield Sensor",
    price: "$54.99",
    description:
      "The First Avenger protects your plants! Shield-shaped vessel with vibranium-inspired sensor technology.",
    features: ["Shield activation lights", "Hero phrases", "USB arc reactor"],
    href: "/vessels/licensed-captain-america",
    isLicensed: true,
    licenseTag: "Marvel™",
    personalityPreset: {
      name: "Super Soldier",
      description: "Noble, inspiring, and always does the right thing"
    }
  },
  {
    id: "licensed-blue-raptor",
    type: "licensed",
    icon: "🦖",
    image: "/images/vessels/licensed-blue.png",
    name: "Blue Raptor Companion",
    price: "$59.99",
    description:
      "Clever girl! Blue from Jurassic World brings prehistoric intelligence to your Aura experience.",
    features: ["Motion sensors", "Raptor calls", "Claw-tap interface"],
    href: "/vessels/licensed-blue-raptor",
    isLicensed: true,
    licenseTag: "Jurassic World™",
    personalityPreset: {
      name: "Velociraptor",
      description: "Intelligent, loyal, with a wild streak"
    }
  },
]

export const ANIMAL_OPTIONS: AnimalOption[] = [
  { id: "elephant", label: "Elephant", icon: "🐘", category: "companion" },
  { id: "giraffe", label: "Giraffe", icon: "🦒", category: "companion" },
  { id: "tortoise", label: "Tortoise", icon: "🐢", category: "companion" },
  { id: "shark", label: "Shark", icon: "🦈", category: "companion" },
  { id: "lion", label: "Lion", icon: "🦁", category: "companion" },
  { id: "whale", label: "Whale", icon: "🐋", category: "companion" },
  { id: "gorilla", label: "Gorilla", icon: "🦍", category: "companion" },
  { id: "trex", label: "T-Rex", icon: "🦖", category: "dinosaur" },
  { id: "triceratops", label: "Triceratops", icon: "🦕", category: "dinosaur" },
]

export const VESSEL_TYPE_LABELS: Record<string, VesselTypeConfig> = {
  terra: {
    title: "Terra Vessels",
    subtitle: "Plant companions with environmental sensors",
    border: "border-green-200",
    bg: "bg-green-50",
    text: "text-green-700",
    gradient: "from-green-500 to-emerald-600",
    icon: "🌱",
  },
  companion: {
    title: "Companion Vessels",
    subtitle: "Wildlife friends that come to life",
    border: "border-blue-200",
    bg: "bg-blue-50",
    text: "text-blue-700",
    gradient: "from-blue-500 to-sky-600",
    icon: "🦋",
  },
  digital: {
    title: "Digital Vessels",
    subtitle: "Pure consciousness in beautiful forms",
    border: "border-purple-200",
    bg: "bg-purple-50",
    text: "text-purple-700",
    gradient: "from-purple-500 to-violet-600",
    icon: "✨",
  },
  licensed: {
    title: "Special Edition Vessels",
    subtitle: "Iconic characters with preset personalities",
    border: "border-yellow-200",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    gradient: "from-yellow-500 to-orange-600",
    icon: "⭐",
  },
}

// Helper functions
export const getProductById = (id: string): VesselProduct | undefined => {
  return VESSEL_PRODUCTS.find(product => product.id === id)
}

export const getProductsByType = (type: VesselProductType): VesselProduct[] => {
  return VESSEL_PRODUCTS.filter(product => product.type === type)
}

export const getAnimalOptions = (category?: 'companion' | 'dinosaur'): AnimalOption[] => {
  if (!category) return ANIMAL_OPTIONS
  return ANIMAL_OPTIONS.filter(option => option.category === category)
}

export const getAnimalById = (id: string): AnimalOption | undefined => {
  return ANIMAL_OPTIONS.find(animal => animal.id === id)
}