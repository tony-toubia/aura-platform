// apps/web/components/aura/plant-selector.tsx

"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  Leaf,
  Droplets,
  Sun,
  Thermometer,
  Info,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Clock
} from "lucide-react"
import { cn } from "@/lib/utils"
import { PLANT_DATABASE, PlantInfo, getPlantsByCategory } from "@/lib/plant-database"

interface PlantSelectorProps {
  selectedPlant?: string
  onSelectPlant: (plantId: string) => void
}

const categoryConfig = {
  houseplant: {
    name: 'Houseplants',
    icon: '🏠',
    color: 'from-green-500 to-emerald-600',
    bgColor: 'from-green-50 to-emerald-50',
    description: 'Indoor plants that thrive in homes'
  },
  herb: {
    name: 'Herbs',
    icon: '🌿',
    color: 'from-lime-500 to-green-600',
    bgColor: 'from-lime-50 to-green-50',
    description: 'Culinary and aromatic herbs'
  },
  vegetable: {
    name: 'Vegetables',
    icon: '🥬',
    color: 'from-orange-500 to-red-600',
    bgColor: 'from-orange-50 to-red-50',
    description: 'Edible plants for your garden'
  },
  succulent: {
    name: 'Succulents',
    icon: '🌵',
    color: 'from-purple-500 to-pink-600',
    bgColor: 'from-purple-50 to-pink-50',
    description: 'Low-maintenance desert plants'
  },
  flower: {
    name: 'Flowers',
    icon: '🌸',
    color: 'from-pink-500 to-purple-600',
    bgColor: 'from-pink-50 to-purple-50',
    description: 'Beautiful blooming plants'
  }
}

const difficultyConfig = {
  easy: { label: 'Easy', color: 'bg-green-100 text-green-700', icon: '🌱' },
  moderate: { label: 'Moderate', color: 'bg-yellow-100 text-yellow-700', icon: '🌿' },
  hard: { label: 'Challenging', color: 'bg-red-100 text-red-700', icon: '🌳' }
}

export function PlantSelector({ selectedPlant, onSelectPlant }: PlantSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof categoryConfig>("houseplant")
  
  const filteredPlants = Object.values(PLANT_DATABASE).filter(plant => {
    const matchesSearch =
      plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plant.scientificName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = plant.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const selectedPlantInfo = selectedPlant ? PLANT_DATABASE[selectedPlant] : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
          <Leaf className="w-4 h-4" />
          Plant Selection
        </div>
        <h3 className="text-2xl font-bold text-gray-800">
          What are you growing?
        </h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Select your plant type so your Terra vessel can provide personalized care recommendations
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search plants by name..."
          className="pl-10 pr-4 py-6 text-lg border-2 border-green-200 focus:border-green-400"
        />
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as any)}>
        <TabsList className="grid grid-cols-3 md:grid-cols-5 gap-2 h-auto p-1 bg-gradient-to-r from-green-50 to-emerald-50">
          {Object.entries(categoryConfig).map(([key, config]) => (
            <TabsTrigger
              key={key}
              value={key}
              className="data-[state=active]:bg-white data-[state=active]:shadow-md flex flex-col gap-1 py-3"
            >
              <span className="text-2xl">{config.icon}</span>
              <span className="text-xs font-medium">{config.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlants
              .filter(plant => plant.category === selectedCategory)
              .map((plant) => {
                const isSelected = selectedPlant === plant.id
                const category = categoryConfig[plant.category as keyof typeof categoryConfig]
                const difficulty = difficultyConfig[plant.idealConditions.difficulty]
                
                return (
                  <Card
                    key={plant.id}
                    onClick={() => onSelectPlant(plant.id)}
                    className={cn(
                      "cursor-pointer transition-all duration-300 hover:scale-105 border-2",
                      isSelected 
                        ? "border-green-400 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50" 
                        : "border-gray-200 hover:border-green-300"
                    )}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{plant.icon}</div>
                          <div>
                            <CardTitle className="text-lg">{plant.name}</CardTitle>
                            <p className="text-xs text-gray-500 italic">{plant.scientificName}</p>
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-gray-600">{plant.description}</p>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={difficulty.color}>
                          {difficulty.icon} {difficulty.label}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {plant.idealConditions.wateringFrequency}
                        </Badge>
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-3 gap-2 pt-2">
                        <div className="text-center p-2 bg-blue-50 rounded-lg">
                          <Thermometer className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                          <p className="text-xs text-gray-600">
                            {plant.idealConditions.temperature.min}-{plant.idealConditions.temperature.max}°C
                          </p>
                        </div>
                        <div className="text-center p-2 bg-yellow-50 rounded-lg">
                          <Sun className="w-4 h-4 text-yellow-600 mx-auto mb-1" />
                          <p className="text-xs text-gray-600">
                            {plant.idealConditions.lightLevel.min}-{plant.idealConditions.lightLevel.max}%
                          </p>
                        </div>
                        <div className="text-center p-2 bg-cyan-50 rounded-lg">
                          <Droplets className="w-4 h-4 text-cyan-600 mx-auto mb-1" />
                          <p className="text-xs text-gray-600">
                            {plant.idealConditions.soilMoisture.min}-{plant.idealConditions.soilMoisture.max}%
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Selected Plant Details */}
      {selectedPlantInfo && (
        <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-green-600" />
              Your Selected Plant: {selectedPlantInfo.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Ideal Conditions */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Info className="w-4 h-4 text-green-600" />
                  Ideal Conditions
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-orange-500" />
                      <span className="text-sm">Temperature</span>
                    </div>
                    <span className="text-sm font-medium">
                      {selectedPlantInfo.idealConditions.temperature.min}-{selectedPlantInfo.idealConditions.temperature.max}°C
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">Light</span>
                    </div>
                    <span className="text-sm font-medium">
                      {selectedPlantInfo.idealConditions.lightLevel.description}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">Moisture</span>
                    </div>
                    <span className="text-sm font-medium">
                      {selectedPlantInfo.idealConditions.soilMoisture.description}
                    </span>
                  </div>
                </div>
              </div>

              {/* Care Tips */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-green-600" />
                  Care Tips
                </h4>
                <ul className="space-y-2">
                  {selectedPlantInfo.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-3 bg-green-100 rounded-lg">
              <p className="text-sm text-green-700 text-center">
                Your Terra vessel will monitor conditions and alert you when your {selectedPlantInfo.name} needs attention! 🌱
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Selection Prompt */}
      {!selectedPlant && (
        <div className="text-center p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <Leaf className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">
            Select a plant to enable personalized care recommendations
          </p>
        </div>
      )}
    </div>
  )
}