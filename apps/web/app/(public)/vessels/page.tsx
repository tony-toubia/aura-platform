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
import { ShoppingBag } from "lucide-react"
import { cn } from "@/lib/utils"

interface VesselProduct {
  id: string
  type: "terra" | "companion" | "digital"
  name: string
  price: string
  icon: string
  description: string
  features: string[]
  href: string
}

const products: VesselProduct[] = [
  // Terra
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
  // Companion: Plush
  {
    id: "companion-plush",
    type: "companion",
    icon: "", // rendered dynamically
    name: "Plush Animal Companion",
    price: "$24.99",
    description:
      "Soft, huggable plush toy—select your favorite animal to bring your Companion Aura to life.",
    features: ["Ultra-soft fabric", "Bluetooth link", "LED “smart” eyes"],
    href: "/vessels/companion-plush",
  },
  // Companion: Desk Figurine
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
  // Digital
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
]

const typeLabels = {
  terra: {
    title: "Terra Vessels",
    border: "border-green-200",
    bg: "bg-green-50",
    text: "text-green-700",
  },
  companion: {
    title: "Companion Vessels",
    border: "border-blue-200",
    bg: "bg-blue-50",
    text: "text-blue-700",
  },
  digital: {
    title: "Digital Vessels",
    border: "border-purple-200",
    bg: "bg-purple-50",
    text: "text-purple-700",
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
]

export default function VesselsPage() {
  const [selectedPlush, setSelectedPlush] = useState(animalOptions[0]?.id ?? "")
  const [selectedFigurine, setSelectedFigurine] = useState(
    animalOptions[0]?.id ?? ""
  )

  const getAnimal = (id: string) =>
    animalOptions.find((a) => a.id === id) ?? animalOptions[0]

  return (
    <div className="max-w-7xl mx-auto space-y-12 py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="text-center space-y-2 mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Aura Vessel Shop
        </h1>
        <p className="text-gray-600">
          Choose the perfect vessel to bring your Aura to life—plant,
          wildlife, or digital.
        </p>
      </header>

      {/* Sections */}
      {(["terra", "companion", "digital"] as Array<
        keyof typeof typeLabels
      >).map((type) => {
        const section = typeLabels[type]
        if (!section) return null;

        const list = products.filter((p) => p.type === type)

        return (
          <section key={type} className="space-y-6">
            <h2 className={`text-2xl font-semibold ${section.text}`}>
              {section.title}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((v) => {
                // Dynamic Plush + Figurine cards
                if (
                  v.id === "companion-plush" ||
                  v.id === "companion-figurine"
                ) {
                  const isPlush = v.id === "companion-plush"
                  const selected = isPlush
                    ? getAnimal(selectedPlush)
                    : getAnimal(selectedFigurine)
                  const setter = isPlush ? setSelectedPlush : setSelectedFigurine
                  
                  if (!selected) return null;

                  const href = `${v.href}?animal=${encodeURIComponent(
                    isPlush ? selectedPlush : selectedFigurine
                  )}`

                  return (
                    <Card
                      key={v.id}
                      className={cn(
                        "flex flex-col h-full transition-shadow hover:shadow-xl",
                        section.border,
                        "border-2"
                      )}
                    >
                      <CardHeader className="pb-4">
                        <div className="text-center mb-4">
                          <div className="text-6xl">{selected.icon}</div>
                          <CardTitle className="mt-2 text-xl">
                            {isPlush
                              ? `${selected.label} Plush Companion`
                              : `${selected.label} Figurine`}
                          </CardTitle>
                        </div>
                        <CardDescription className="text-sm text-center">
                          {v.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col p-6 pt-0">
                        {/* FIX: Moved animal selector into CardContent and made it scrollable */}
                        <div className="w-full overflow-x-auto py-4 mb-4 border-y">
                          <div className="flex space-x-4 px-2">
                            {animalOptions.map((opt) => (
                              <button
                                key={opt.id}
                                onClick={() => setter(opt.id)}
                                className={cn(
                                  "flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-2xl transition",
                                  opt.id === selected.id
                                    ? "ring-4 ring-blue-300"
                                    : "ring-1 ring-gray-200 hover:ring-blue-200"
                                )}
                              >
                                {opt.icon}
                              </button>
                            ))}
                          </div>
                        </div>
                        <ul className="space-y-1 mb-4">
                          {v.features.map((feat, i) => (
                            <li key={i} className="text-sm flex items-center">
                              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2" />
                              {feat}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-auto space-y-2">
                          <div className="flex items-baseline justify-between">
                            <span className="text-2xl font-bold text-purple-700">
                              {v.price}
                            </span>
                            <span className="text-xs text-gray-500">
                              + shipping
                            </span>
                          </div>
                          <Link href={href} className="block">
                            <Button size="lg" className="w-full">
                              <ShoppingBag className="w-4 h-4 mr-2" />
                              Buy Now
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
                      "flex flex-col h-full transition-shadow hover:shadow-xl",
                      section.border,
                      "border-2"
                    )}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-4xl">{v.icon}</div>
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
                      <CardTitle className="text-lg">{v.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {v.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <ul className="space-y-1 mb-4">
                        {v.features.map((feat, i) => (
                          <li key={i} className="text-sm flex items-center">
                            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2" />
                            {feat}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-auto space-y-2">
                        <div className="flex items-baseline justify-between">
                          <span className="text-2xl font-bold text-purple-700">
                            {v.price}
                          </span>
                          <span className="text-xs text-gray-500">
                            + shipping
                          </span>
                        </div>
                        <Link href={v.href} className="block">
                          <Button size="lg" className="w-full">
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

      {/* How It Works */}
      <section className="mt-12">
        <Card className="p-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-purple-600" />
              How It Works
            </CardTitle>
            <CardDescription>
              Each vessel type is tailored to your Aura’s world—garden,
              wildlife, or digital.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl mb-2">🌱</div>
                <h3 className="font-semibold mb-1">Terra Vessels</h3>
                <p className="text-sm text-gray-600">
                  Perfect for plant Auras—built-in sensors help you nurture
                  growth.
                </p>
              </div>
              <div>
                <div className="text-3xl mb-2">🦋</div>
                <h3 className="font-semibold mb-1">Companion Vessels</h3>
                <p className="text-sm text-gray-600">
                  Plush toys and figurines bring your wildlife Aura to life.
                </p>
              </div>
              <div>
                <div className="text-3xl mb-2">🔮</div>
                <h3 className="font-semibold mb-1">Digital Vessels</h3>
                <p className="text-sm text-gray-600">
                  Orb, box, cube—perfect display for digital consciousness.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
