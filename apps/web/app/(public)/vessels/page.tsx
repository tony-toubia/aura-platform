// apps/web/app/(public)/vessels/page.tsx

"use client"

import React, { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Sparkles, Award } from "lucide-react"
import { VesselProductCard } from "@/components/vessels/vessel-product-card"
import { 
  VESSEL_PRODUCTS, 
  VESSEL_TYPE_LABELS, 
  getProductsByType,
  getAnimalOptions,
  getAnimalById 
} from "@/lib/vessel-products"
import type { VesselProductType } from "@/types/products"

export default function VesselsPage() {
  // State for animal selections
  const [selectedAnimals, setSelectedAnimals] = useState<Record<string, string>>({
    "companion-plush": "elephant",
    "companion-figurine": "lion",
    "companion-bracelet": "whale",
    "terra-animal-sensor": "trex",
  })

  const handleAnimalSelect = (productId: string, animalId: string) => {
    setSelectedAnimals(prev => ({ ...prev, [productId]: animalId }))
  }

  const renderProductSection = (type: VesselProductType) => {
    const section = VESSEL_TYPE_LABELS[type]
    const products = getProductsByType(type)

    return (
      <section key={type} className="space-y-6">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className={`text-3xl font-bold mb-2 ${section!.text}`}>
            {section!.title}
          </h2>
          <p className="text-gray-600">{section!.subtitle}</p>
          {type === "licensed" && (
            <div className="flex items-center justify-center gap-2 mt-3">
              <Award className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-700">
                Officially Licensed Characters
              </span>
            </div>
          )}
        </div>
        
        {/* Product Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 min-w-0">
          {products.map((product) => {
            const isPlantSensor = product.id === "terra-animal-sensor"
            const animalOptions = product.hasVariants
              ? getAnimalOptions(isPlantSensor ? 'dinosaur' : 'companion')
              : undefined
            const selectedAnimalId = selectedAnimals[product.id]
            const selectedAnimal = selectedAnimalId ? getAnimalById(selectedAnimalId) : undefined

            return (
              <VesselProductCard
                key={product.id}
                product={product}
                typeConfig={section!}
                selectedAnimal={selectedAnimal}
                animalOptions={animalOptions}
                onAnimalSelect={(animalId) => handleAnimalSelect(product.id, animalId)}
                isPlantSensor={isPlantSensor}
              />
            )
          })}
        </div>
      </section>
    )
  }

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

      {/* Product Sections */}
      {(["licensed", "terra", "companion", "digital"] as VesselProductType[]).map(renderProductSection)}

      {/* How It Works */}
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
              {Object.entries(VESSEL_TYPE_LABELS).map(([key, config]: [string, any]) => (
                <div key={key} className="space-y-3">
                  <div className={`w-16 h-16 mx-auto bg-gradient-to-r ${config.gradient} rounded-full flex items-center justify-center text-white text-2xl shadow-lg`}>
                    {config.icon}
                  </div>
                  <h3 className={`font-semibold ${config.text}`}>{config.title.split(" ")[0]} Vessels</h3>
                  <p className="text-sm text-gray-600">
                    {key === "terra" && "Plant guardians with sensors that help nurture growth and share the garden's story"}
                    {key === "companion" && "Wildlife friends in plush or figurine form, ready for adventures and connections"}
                    {key === "digital" && "Pure consciousness in elegant forms—orbs, boxes, and cubes for digital beings"}
                    {key === "licensed" && "Beloved characters with preset personalities that match their iconic traits"}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}