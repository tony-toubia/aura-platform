"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Sparkles, Award, Leaf } from "lucide-react"
import { cn } from "@/lib/utils"

interface VesselProduct {
  id: string
  type: "terra" | "companion" | "digital" | "licensed"
  name: string
  price: string
  icon: string
  description: string
  features: string[]
  href: string
  isLicensed?: boolean
  licenseTag?: string
  personalityPreset?: {
    name: string
    description: string
  }
}

const products: VesselProduct[] = [
  // Terra - Original
  {
    id: "terra-pot",
    type: "terra",
    icon: "🌱",
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
    name: "Animal Figurine Plant Sensor",
    price: "$34.99",
    description:
      "Adorable animal figurine with hidden plant sensors—combine wildlife charm with Terra sensing capabilities.",
    features: ["Disguised sensors", "Weather-resistant", "Solar-powered option"],
    href: "/vessels/terra-animal-sensor",
  },
  
  // Companion: Original Plush & Figurine
  {
    id: "companion-plush",
    type: "companion",
    icon: "", // rendered dynamically
    name: "Plush Animal Companion",
    price: "$24.99",
    description:
      "Soft, huggable plush toy—select your favorite animal to bring your Companion Aura to life.",
    features: ["Ultra-soft fabric", "Bluetooth link", "LED 'smart' eyes"],
    href: "/vessels/companion-plush",
  },
  {
    id: "companion-figurine",
    type: "companion",
    icon: "", // rendered dynamically
    name: "Desktop Figurine",
    price: "$29.99",
    description:
      "Hand-painted resin figurine—choose an animal and display your Companion Aura on your desk.",
    features: ["Hand-painted detail", "LED-lit base", "USB-powered"],
    href: "/vessels/companion-figurine",
  },
  
  // Digital - Original
  {
    id: "digital-glass-orb",
    type: "digital",
    icon: "🔮",
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
    name: "Ceramic Cube Vessel",
    price: "$24.99",
    description:
      "Modern ceramic cube with customizable LED accents—perfect minimalist home for your Digital Aura.",
    features: ["Customizable LED", "Touch interface", "USB powered"],
    href: "/vessels/digital-ceramic-cube",
  },
  
  // Licensed Characters
  {
    id: "licensed-yoda-plant",
    type: "licensed",
    icon: "🌿",
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

const typeLabels = {
  terra: {
    title: "Terra Vessels",
    subtitle: "Plant companions with environmental sensors",
    border: "border-green-200",
    bg: "bg-green-50",
    text: "text-green-700",
    gradient: "from-green-500 to-emerald-600",
  },
  companion: {
    title: "Companion Vessels",
    subtitle: "Wildlife friends that come to life",
    border: "border-blue-200",
    bg: "bg-blue-50",
    text: "text-blue-700",
    gradient: "from-blue-500 to-sky-600",
  },
  digital: {
    title: "Digital Vessels",
    subtitle: "Pure consciousness in beautiful forms",
    border: "border-purple-200",
    bg: "bg-purple-50",
    text: "text-purple-700",
    gradient: "from-purple-500 to-violet-600",
  },
  licensed: {
    title: "Special Edition Vessels",
    subtitle: "Iconic characters with preset personalities",
    border: "border-yellow-200",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    gradient: "from-yellow-500 to-orange-600",
  },
}

const animalOptions = [
  { id: "elephant", label: "Elephant", icon: "🐘" },
  { id: "giraffe", label: "Giraffe", icon: "🦒" },
  { id: "tortoise", label: "Tortoise", icon: "🐢" },
  { id: "shark", label: "Shark", icon: "🦈" },
  { id: "lion", label: "Lion", icon: "🦁" },
  { id: "whale", label: "Whale", icon: "🐋" },
  { id: "gorilla", label: "Gorilla", icon: "🦍" },
  { id: "trex", label: "T-Rex", icon: "🦖" },
  { id: "triceratops", label: "Triceratops", icon: "🦕" },
]

const dinosaurOptions = animalOptions.filter(opt =>
  ["trex", "triceratops"].includes(opt.id)
)
const companionOptions = animalOptions.filter(opt =>
  !["trex", "triceratops"].includes(opt.id)
)

export default function VesselsPage() {
  const [selectedPlush, setSelectedPlush] = useState(animalOptions[0]?.id ?? "")
  const [selectedFigurine, setSelectedFigurine] = useState(animalOptions[0]?.id ?? "")
  const [selectedPlantSensor, setSelectedPlantSensor] = useState(animalOptions[7]?.id ?? "") // Default to T-Rex

  const getAnimal = (id: string) =>
    animalOptions.find((a) => a.id === id) ?? animalOptions[0]

  return (
    <div className="max-w-7xl mx-auto space-y-12 py-12 px-4 sm:px-6 lg:px-8">
      {/* Enhanced Header */}
      <header className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" />
          Magical Vessels for Your Auras
        </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Aura Vessel Collection
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Choose the perfect vessel to bring your Aura to life—from plant guardians to beloved characters
        </p>
      </header>

      {/* Sections */}
      {(["licensed", "terra", "companion", "digital"] as Array<keyof typeof typeLabels>).map((type) => {
        const section = typeLabels[type]
        if (!section) return null;

        const list = products.filter((p) => p.type === type)

        return (
          <section key={type} className="space-y-6">
            {/* Section Header */}
            <div className="text-center mb-8">
              <h2 className={cn(
                "text-3xl font-bold mb-2",
                section.text
              )}>
                {section.title}
              </h2>
              <p className="text-gray-600">{section.subtitle}</p>
              {type === "licensed" && (
                <div className="flex items-center justify-center gap-2 mt-3">
                  <Award className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-700">
                    Officially Licensed Characters
                  </span>
                </div>
              )}
            </div>
            
            {/* Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 min-w-0">
              {list.map((v) => {
                // Dynamic Animal Selector Cards
                if (["companion-plush", "companion-figurine", "terra-animal-sensor"].includes(v.id)) {
                  const isPlush = v.id === "companion-plush"
                  const isFigurine = v.id === "companion-figurine"
                  const isPlantSensor = v.id === "terra-animal-sensor"

                // <-- pick the right set *before* the JSX
                  const options = isPlantSensor
                    ? dinosaurOptions
                    : companionOptions
                  
                  const selected = isPlush 
                    ? getAnimal(selectedPlush)
                    : isFigurine 
                    ? getAnimal(selectedFigurine)
                    : getAnimal(selectedPlantSensor)
                    
                  const setter = isPlush 
                    ? setSelectedPlush 
                    : isFigurine 
                    ? setSelectedFigurine
                    : setSelectedPlantSensor
                  
                  if (!selected) return null;

                  const selectedId = isPlush 
                    ? selectedPlush 
                    : isFigurine 
                    ? selectedFigurine
                    : selectedPlantSensor

                  const href = `${v.href}?animal=${encodeURIComponent(selectedId)}`

                  return (
                    <Card
                      key={v.id}
                      className={cn(
                        "flex flex-col h-full transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] min-w-0 max-w-full",
                        section.border,
                        "border-2 group"
                      )}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between mb-3">
                          <div
                            className={cn(
                              "text-6xl transition-transform duration-300 group-hover:scale-110",
                              isPlantSensor && "relative inline-block"
                            )}
                          >
                            {selected.icon}
                            {isPlantSensor && (
                              <Leaf className="w-6 h-6 text-green-500 absolute -bottom-1 -right-1" />
                            )}
                          </div>
                          <span
                            className={cn(
                              "px-2 py-1 rounded-full text-xs font-medium",
                              section.bg,
                              section.text
                            )}
                          >
                            {v.type}
                          </span>
                        </div>

                        <CardTitle className="mt-2 text-xl line-clamp-2">
                          {isPlush
                            ? `${selected.label} Plush`
                            : isFigurine
                            ? `${selected.label} Figurine`
                            : `${selected.label} Plant Guardian`}
                        </CardTitle>

                        <CardDescription className="text-sm text-center line-clamp-3">
                          {v.description}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="flex-1 flex flex-col p-6 pt-0 min-w-0">
                        {/* Animal Selector */}
                        <div className="mb-4 min-w-0">
                          <div className="text-xs text-gray-500 mb-2 text-center font-medium">
                            Choose your {isPlantSensor ? "guardian" : "animal"}:
                          </div>
                          <div className="grid grid-cols-3 gap-1.5 max-w-full">
                            {options.map((opt) => (
                              <button
                                key={opt.id}
                                onClick={() => setter(opt.id)}
                                className={cn(
                                  "w-full aspect-square rounded-lg flex items-center justify-center text-lg transition-all duration-200",
                                  "border-2 hover:scale-105 active:scale-95 min-w-0 relative",
                                  opt.id === selected.id
                                    ? cn(
                                        "shadow-md ring-2",
                                        isPlantSensor
                                          ? "border-green-400 bg-green-50 ring-green-200"
                                          : "border-blue-400 bg-blue-50 ring-blue-200"
                                      )
                                    : cn(
                                        "border-gray-200 bg-white",
                                        isPlantSensor
                                          ? "hover:border-green-300 hover:bg-green-50"
                                          : "hover:border-blue-300 hover:bg-blue-50"
                                      )
                                )}
                                title={opt.label}
                              >
                                {opt.icon}
                                {isPlantSensor && opt.id === selected.id && (
                                  <Leaf className="w-3 h-3 text-green-500 absolute top-1 right-1" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Features */}
                        <ul className="space-y-1 mb-4 min-w-0">
                          {v.features.map((feat, i) => (
                            <li key={i} className="text-sm flex items-center min-w-0">
                              <span
                                className={cn(
                                  "w-1.5 h-1.5 rounded-full mr-2 flex-shrink-0",
                                  isPlantSensor ? "bg-green-500" : "bg-purple-500"
                                )}
                              />
                              <span className="truncate">{feat}</span>
                            </li>
                          ))}
                        </ul>

                        {/* Price and Button */}
                        <div className="mt-auto space-y-3 min-w-0">
                          <div className="flex items-baseline justify-between">
                            <span
                              className={cn(
                                "text-2xl font-bold",
                                isPlantSensor ? "text-green-700" : section.text
                              )}
                            >
                              {v.price}
                            </span>
                            <span className="text-xs text-gray-500">+ shipping</span>
                          </div>
                          <Link href={href} className="block">
                            <Button
                              size="lg"
                              className={cn(
                                "w-full bg-gradient-to-r text-white",
                                isPlantSensor
                                  ? "from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                                  : "from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                              )}
                            >
                              <ShoppingBag className="w-4 h-4 mr-2" />
                              <span className="truncate">
                                Buy {selected.label}{" "}
                                {isPlantSensor ? "Guardian" : isPlush ? "Plush" : "Figurine"}
                              </span>
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  )
                }

                // Licensed Character Cards
                if (v.isLicensed) {
                  return (
                    <Card
                      key={v.id}
                      className={cn(
                        "flex flex-col h-full transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] min-w-0 max-w-full",
                        "border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50",
                        "group relative overflow-hidden"
                      )}
                    >
                      {/* License Badge */}
                      <div className="absolute top-3 right-3 z-10">
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                          {v.licenseTag}
                        </Badge>
                      </div>
                      
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-center mb-3">
                          <div className="text-5xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                            {v.icon}
                          </div>
                        </div>
                        <CardTitle className="text-xl text-center line-clamp-2">{v.name}</CardTitle>
                        <CardDescription className="text-sm text-center line-clamp-3 mt-2">
                          {v.description}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="flex-1 flex flex-col min-w-0">
                        {/* Personality Preset */}
                        {v.personalityPreset && (
                          <div className="mb-4 p-3 bg-white/80 rounded-lg border border-yellow-200">
                            <div className="text-xs font-medium text-yellow-700 mb-1">
                              Preset Personality: {v.personalityPreset.name}
                            </div>
                            <div className="text-xs text-gray-600">
                              {v.personalityPreset.description}
                            </div>
                          </div>
                        )}
                        
                        {/* Features */}
                        <ul className="space-y-1 mb-4 min-w-0">
                          {v.features.map((feat, i) => (
                            <li key={i} className="text-sm flex items-center min-w-0">
                              <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-2 flex-shrink-0" />
                              <span className="truncate">{feat}</span>
                            </li>
                          ))}
                        </ul>
                        
                        {/* Price and Button */}
                        <div className="mt-auto space-y-3 min-w-0">
                          <div className="flex items-baseline justify-between">
                            <span className="text-2xl font-bold text-orange-700">
                              {v.price}
                            </span>
                            <span className="text-xs text-gray-500">
                              Limited Edition
                            </span>
                          </div>
                          <Link href={v.href} className="block">
                            <Button 
                              size="lg" 
                              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                            >
                              <Award className="w-4 h-4 mr-2" />
                              Get {v.name.split(' ')[0]}
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  )
                }

                // Default vessel card
                return (
                  <Card
                    key={v.id}
                    className={cn(
                      "flex flex-col h-full transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] min-w-0 max-w-full",
                      section.border,
                      "border-2 group"
                    )}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-4xl transition-transform duration-300 group-hover:scale-110">
                          {v.icon}
                        </div>
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            section.bg,
                            section.text
                          )}
                        >
                          {type}
                        </span>
                      </div>
                      <CardTitle className="text-lg line-clamp-2">{v.name}</CardTitle>
                      <CardDescription className="text-sm line-clamp-3">
                        {v.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="flex-1 flex flex-col min-w-0">
                      <ul className="space-y-1 mb-4 min-w-0">
                        {v.features.map((feat, i) => (
                          <li key={i} className="text-sm flex items-center min-w-0">
                            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2 flex-shrink-0" />
                            <span className="truncate">{feat}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <div className="mt-auto space-y-2 min-w-0">
                        <div className="flex items-baseline justify-between">
                          <span className={cn("text-2xl font-bold", section.text)}>
                            {v.price}
                          </span>
                          <span className="text-xs text-gray-500">
                            + shipping
                          </span>
                        </div>
                        <Link href={v.href} className="block">
                          <Button 
                            size="lg" 
                            className={cn(
                              "w-full bg-gradient-to-r text-white",
                              section.gradient
                            )}
                          >
                            <ShoppingBag className="w-4 h-4 mr-2" />
                            Buy Now
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>
        )
      })}

      {/* Enhanced How It Works */}
      <section className="mt-16">
        <Card className="p-8 bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center justify-center gap-3">
              <Sparkles className="w-6 h-6 text-purple-600" />
              How Vessel Magic Works
              <Sparkles className="w-6 h-6 text-purple-600" />
            </CardTitle>
            <CardDescription className="text-center max-w-3xl mx-auto">
              Each vessel type channels your Aura's personality in unique ways—choose the perfect match for your magical companion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-center mt-8">
              <div className="space-y-3">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-2xl shadow-lg">
                  🌱
                </div>
                <h3 className="font-semibold text-green-700">Terra Vessels</h3>
                <p className="text-sm text-gray-600">
                  Plant guardians with sensors that help nurture growth and share the garden's story
                </p>
              </div>
              <div className="space-y-3">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-sky-600 rounded-full flex items-center justify-center text-white text-2xl shadow-lg">
                  🦋
                </div>
                <h3 className="font-semibold text-blue-700">Companion Vessels</h3>
                <p className="text-sm text-gray-600">
                  Wildlife friends in plush or figurine form, ready for adventures and connections
                </p>
              </div>
              <div className="space-y-3">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-violet-600 rounded-full flex items-center justify-center text-white text-2xl shadow-lg">
                  🔮
                </div>
                <h3 className="font-semibold text-purple-700">Digital Vessels</h3>
                <p className="text-sm text-gray-600">
                  Pure consciousness in elegant forms—orbs, boxes, and cubes for digital beings
                </p>
              </div>
              <div className="space-y-3">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl shadow-lg">
                  ⭐
                </div>
                <h3 className="font-semibold text-orange-700">Special Edition</h3>
                <p className="text-sm text-gray-600">
                  Beloved characters with preset personalities that match their iconic traits
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}