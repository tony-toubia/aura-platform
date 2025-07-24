// apps/web/app/(public)/vessels/[id]/page.tsx

"use client"

import React, { useState } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ShoppingBag,
  Heart,
  Share2,
  Award,
  Package,
  Shield,
  Sparkles,
  ArrowLeft,
  Leaf,
  CheckCircle,
  Info,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { 
  getProductById, 
  getAnimalById, 
  getAnimalOptions,
  getProductsByType,
  VESSEL_TYPE_LABELS 
} from "@/lib/vessel-products"

export default function VesselDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const productId = params.id as string
  const product = getProductById(productId)
  
  // Handle animal selection
  const animalParam = searchParams.get('animal')
  const [selectedAnimalId, setSelectedAnimalId] = useState(animalParam || 'elephant')
  
  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Product not found</h1>
        <Button onClick={() => router.push('/vessels')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Vessels
        </Button>
      </div>
    )
  }

  const typeConfig = VESSEL_TYPE_LABELS[product.type]
  const isPlantSensor = product.id === "terra-animal-sensor"
  const animalOptions = product.hasVariants
    ? getAnimalOptions(isPlantSensor ? 'dinosaur' : 'companion')
    : []
  const selectedAnimal = getAnimalById(selectedAnimalId)
  
  const displayName = selectedAnimal && product.hasVariants
    ? `${selectedAnimal.label} ${
        product.name.includes("Plush") ? "Plush" :
        product.name.includes("Figurine") ? "Figurine" :
        product.name.includes("Bracelet") ? "Bracelet" :
        "Plant Guardian"
      }`
    : product.name

  const displayIcon = product.icon || selectedAnimal?.icon || typeConfig!.icon || "✨"

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/vessels')}
          className="hover:bg-purple-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to All Vessels
        </Button>
      </nav>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Product Image/Icon Section */}
        <div className="space-y-6">
          <Card className="p-12 bg-gradient-to-br from-gray-50 to-gray-100 border-2">
            <div className="flex items-center justify-center">
              <div className="text-[120px] relative">
                {displayIcon}
                {isPlantSensor && (
                  <Leaf className="w-12 h-12 text-green-500 absolute -bottom-2 -right-2" />
                )}
              </div>
            </div>
          </Card>

          {/* Animal Selector for Variants */}
          {product.hasVariants && animalOptions.length > 0 && (
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Choose Your {isPlantSensor ? "Guardian" : "Animal"}
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {animalOptions.map((animal) => (
                  <button
                    key={animal.id}
                    onClick={() => setSelectedAnimalId(animal.id)}
                    className={cn(
                      "aspect-square rounded-lg flex items-center justify-center text-2xl transition-all",
                      "border-2 hover:scale-105 relative",
                      animal.id === selectedAnimalId
                        ? "border-purple-400 bg-purple-50 ring-2 ring-purple-200 shadow-md"
                        : "border-gray-200 bg-white hover:border-purple-300"
                    )}
                  >
                    {animal.icon}
                    {animal.id === selectedAnimalId && (
                      <CheckCircle className="w-4 h-4 text-purple-600 absolute top-1 right-1" />
                    )}
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Product Details Section */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{displayName}</h1>
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Heart className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge
                variant="secondary"
                className={cn(
                  product.isLicensed
                    ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                    : `${typeConfig!.bg} ${typeConfig!.text} ${typeConfig!.border}`
                )}
              >
                {product.isLicensed
                  ? product.licenseTag
                  : product.type.charAt(0).toUpperCase() + product.type.slice(1) + " Vessel"
                }
              </Badge>
              {product.isLicensed && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  <Award className="w-3 h-3 mr-1" />
                  Limited Edition
                </Badge>
              )}
            </div>

            <p className="text-lg text-gray-600">{product.description}</p>
          </div>

          {/* Price Section */}
          <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-100">
            <div className="flex items-end justify-between mb-4">
              <div>
                <span className="text-3xl font-bold text-gray-900">{product.price}</span>
                <span className="text-sm text-gray-500 ml-2">
                  {product.isLicensed ? "Limited time offer" : "+ shipping"}
                </span>
              </div>
              <div className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                In Stock
              </div>
            </div>

            <div className="space-y-3">
              <Button size="lg" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Package className="w-4 h-4" />
                  Ships in 2-3 days
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4" />
                  1 Year Warranty
                </div>
              </div>
            </div>
          </Card>

          {/* Personality Preset (Licensed) */}
          {product.personalityPreset && (
            <Card className="p-6 border-2 border-yellow-200 bg-yellow-50">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-600" />
                Preset Personality
              </h3>
              <div className="space-y-2">
                <div className="font-medium text-yellow-800">{product.personalityPreset.name}</div>
                <p className="text-sm text-gray-700">{product.personalityPreset.description}</p>
              </div>
            </Card>
          )}

          {/* Features & Details Tabs */}
          <Tabs defaultValue="features" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="specs">Specifications</TabsTrigger>
              <TabsTrigger value="setup">Setup Guide</TabsTrigger>
            </TabsList>
            
            <TabsContent value="features" className="mt-6 space-y-4">
              <h3 className="font-semibold mb-3">Key Features</h3>
              <ul className="space-y-3">
                {product.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle className={cn(
                      "w-5 h-5 mt-0.5 flex-shrink-0",
                      product.isLicensed ? "text-yellow-600" : "text-purple-600"
                    )} />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </TabsContent>
            
            <TabsContent value="specs" className="mt-6 space-y-4">
              <h3 className="font-semibold mb-3">Technical Specifications</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Connectivity</span>
                  <span className="font-medium">Bluetooth 5.0 / WiFi</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Power</span>
                  <span className="font-medium">USB-C / Battery</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Dimensions</span>
                  <span className="font-medium">Varies by model</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Material</span>
                  <span className="font-medium">Premium quality materials</span>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="setup" className="mt-6 space-y-4">
              <h3 className="font-semibold mb-3">Quick Setup Guide</h3>
              <ol className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    1
                  </span>
                  <span className="text-gray-700">Unbox your vessel and connect to power</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    2
                  </span>
                  <span className="text-gray-700">Download the Aura app and create your account</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    3
                  </span>
                  <span className="text-gray-700">Follow the in-app pairing process</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    4
                  </span>
                  <span className="text-gray-700">Create and customize your Aura personality</span>
                </li>
              </ol>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Related Products */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-8 text-center">You Might Also Like</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {getProductsByType(product.type)
            .filter(p => p.id !== product.id)
            .slice(0, 4)
            .map((relatedProduct) => (
              <Card key={relatedProduct.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(relatedProduct.href)}>
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3">{relatedProduct.icon || typeConfig!.icon}</div>
                  <h3 className="font-semibold mb-2">{relatedProduct.name}</h3>
                  <p className="text-xl font-bold text-purple-600">{relatedProduct.price}</p>
                </CardContent>
              </Card>
            ))}
        </div>
      </section>
    </div>
  )
}