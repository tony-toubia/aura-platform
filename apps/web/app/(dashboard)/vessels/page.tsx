// apps/web/app/(dashboard)/vessels/page.tsx
import React from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Zap, Leaf, Globe } from "lucide-react"
import type { NextPage } from "next"

// (Example data—swap in real product info / images / pricing as you like)
const vessels = [
  {
    id: "glass-orb",
    name: "Glass Orb Vessel",
    price: "$29.99",
    image: "/images/vessels/glass-orb.jpg",
    description: "A sleek glass orb to house your Aura. Perfect for digital entities with its clean, modern aesthetic.",
    icon: "🔮",
    vesselType: "digital",
    features: ["LED indicators", "Touch sensors", "Wireless charging"],
  },
  {
    id: "wooden-box",
    name: "Terra Plant Pot",
    price: "$39.99",
    image: "/images/vessels/wooden-box.jpg",
    description: "Hand-crafted ceramic pot with built-in sensors. Perfect for plant-based Auras with soil and light monitoring.",
    icon: "🌱",
    vesselType: "terra",
    features: ["Soil moisture sensor", "Light sensor", "Temperature probe"],
  },
  {
    id: "ceramic-cube",
    name: "Companion Tracker",
    price: "$49.99",
    image: "/images/vessels/ceramic-cube.jpg",
    description: "Advanced tracking device for wildlife companions. Weatherproof and durable for outdoor adventures.",
    icon: "🦋",
    vesselType: "companion",
    features: ["GPS tracking", "Weather sensors", "Long battery life"],
  },
]

const vesselTypeColors = {
  digital: "bg-purple-100 text-purple-700",
  terra: "bg-green-100 text-green-700", 
  companion: "bg-blue-100 text-blue-700",
}

const vesselTypeIcons = {
  digital: Zap,
  terra: Leaf,
  companion: Globe,
}

const VesselsPage: NextPage = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Aura Vessels</h1>
        <p className="text-muted-foreground text-lg">
          Choose the perfect physical vessel to house your Aura. Each vessel type is designed for specific environments and sensing capabilities.
        </p>
      </div>

      {/* Vessels Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {vessels.map((vessel) => {
          const IconComponent = vesselTypeIcons[vessel.vesselType as keyof typeof vesselTypeIcons]
          
          return (
            <Card key={vessel.id} className="flex flex-col h-full hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-4xl">{vessel.icon}</div>
                  <span className={`text-xs px-2 py-1 rounded-full ${vesselTypeColors[vessel.vesselType as keyof typeof vesselTypeColors]}`}>
                    <IconComponent className="w-3 h-3 inline mr-1" />
                    {vessel.vesselType}
                  </span>
                </div>
                <CardTitle className="text-xl">{vessel.name}</CardTitle>
                <CardDescription className="text-sm">
                  {vessel.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col">
                {/* Features List */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Features:</h4>
                  <ul className="space-y-1">
                    {vessel.features.map((feature, index) => (
                      <li key={index} className="text-sm flex items-center">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Price and Action */}
                <div className="mt-auto">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-purple-700">{vessel.price}</span>
                    <span className="text-sm text-muted-foreground">+ shipping</span>
                  </div>
                  
                  <div className="space-y-2">
                    <Link href={`/vessels/${vessel.id}`} className="block">
                      <Button className="w-full" size="lg">
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Buy Now
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Info Section */}
      <Card className="mt-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            How Vessels Work
          </CardTitle>
          <CardDescription>
            Each vessel type is designed for specific Aura personalities and environments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-3">🔮</div>
              <h3 className="font-semibold mb-2">Digital Vessels</h3>
              <p className="text-sm text-muted-foreground">
                Perfect for AI entities and digital assistants. Features LED displays and touch interfaces.
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🌱</div>
              <h3 className="font-semibold mb-2">Terra Vessels</h3>
              <p className="text-sm text-muted-foreground">
                Designed for plant-based Auras. Includes environmental sensors for optimal plant care.
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🦋</div>
              <h3 className="font-semibold mb-2">Companion Vessels</h3>
              <p className="text-sm text-muted-foreground">
                Built for wildlife tracking and outdoor adventures. Rugged and weather-resistant.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default VesselsPage