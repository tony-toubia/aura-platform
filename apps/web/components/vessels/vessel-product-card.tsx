// apps/web/components/vessels/vessel-product-card.tsx

"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Award, Leaf } from "lucide-react"
import { cn } from "@/lib/utils"
import type { VesselProduct, AnimalOption, VesselTypeConfig } from "@/types/products"

interface VesselProductCardProps {
  product: VesselProduct
  typeConfig: VesselTypeConfig
  selectedAnimal?: AnimalOption
  animalOptions?: AnimalOption[]
  onAnimalSelect?: (animalId: string) => void
  isPlantSensor?: boolean
}

export function VesselProductCard({
  product,
  typeConfig,
  selectedAnimal,
  animalOptions,
  onAnimalSelect,
  isPlantSensor = false,
}: VesselProductCardProps) {
  const href = selectedAnimal
    ? `${product.href}?animal=${encodeURIComponent(selectedAnimal.id)}`
    : product.href

  const displayName = selectedAnimal
    ? `${selectedAnimal.label} ${
        product.name.includes("Plush") ? "Plush" :
        product.name.includes("Figurine") ? "Figurine" :
        product.name.includes("Bracelet") ? "Bracelet" :
        "Plant Guardian"
      }`
    : product.name

  const displayIcon = product.icon || selectedAnimal?.icon || typeConfig.icon || "✨"

  return (
    <Card
      className={cn(
        "relative flex flex-col items-center text-center h-full transition-all duration-300",
        "hover:shadow-2xl hover:scale-[1.02]",
        "border-2 group overflow-hidden",
        product.isLicensed
          ? "border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50"
          : cn("bg-white", typeConfig.border)
      )}
    >
      {/* Badge */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
        <Badge
          variant="secondary"
          className={cn(
            product.isLicensed
              ? "bg-yellow-100 text-yellow-800 border-yellow-300"
              : `${typeConfig.bg} ${typeConfig.text} ${typeConfig.border}`
          )}
        >
          {product.isLicensed
            ? product.licenseTag
            : product.type.charAt(0).toUpperCase() + product.type.slice(1)
          }
        </Badge>
        <Badge className="bg-orange-500 hover:bg-orange-500 text-white text-xs px-2 py-0.5">
          Coming Soon
        </Badge>
      </div>

      {/* Product Image or Icon */}
      {product.image ? (
        <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100">
          <Image
            src={product.image}
            alt={displayName}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {/* Icon overlay */}
          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-xl p-2 shadow-lg">
            <div className="text-2xl relative">
              {displayIcon}
              {isPlantSensor && (
                <Leaf className="w-3 h-3 text-green-500 absolute -bottom-1 -right-1" />
              )}
            </div>
          </div>
        </div>
      ) : (
        <CardHeader className="pb-4">
          <div className="relative text-6xl mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
            {displayIcon}
            {isPlantSensor && (
              <Leaf className="w-6 h-6 text-green-500 absolute -bottom-1 -right-1" />
            )}
          </div>
        </CardHeader>
      )}

      <CardHeader className={cn("flex-1", product.image ? "pt-4" : "pt-0")}>
        <CardTitle className="text-xl">{displayName}</CardTitle>
        <CardDescription className="text-sm mt-2">
          {product.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col items-center justify-between w-full px-6">
        {/* Animal Selector */}
        {product.hasVariants && animalOptions && selectedAnimal && onAnimalSelect && (
          <div className="mb-4 min-w-0">
            <div className="text-xs text-gray-500 mb-2 text-center font-medium">
              Choose your {isPlantSensor ? "guardian" : "animal"}:
            </div>
            <div className="grid grid-cols-3 gap-1.5 max-w-full">
              {animalOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onAnimalSelect(opt.id)}
                  className={cn(
                    "w-full aspect-square rounded-lg flex items-center justify-center text-lg transition-all duration-200",
                    "border-2 hover:scale-105 active:scale-95 min-w-0 relative",
                    opt.id === selectedAnimal.id
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
                  {isPlantSensor && opt.id === selectedAnimal.id && (
                    <Leaf className="w-3 h-3 text-green-500 absolute top-1 right-1" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Personality Preset (for licensed products) */}
        {product.personalityPreset && (
          <div className="mb-4 p-3 bg-white/80 rounded-lg border border-yellow-200 w-full">
            <div className="text-xs font-medium text-yellow-700 mb-1">
              Preset: {product.personalityPreset.name}
            </div>
            <div className="text-xs text-gray-600">
              {product.personalityPreset.description}
            </div>
          </div>
        )}

        {/* Features */}
        <ul className="space-y-1 mb-4 w-full">
          {product.features.map((feat, i) => (
            <li key={i} className="text-sm flex items-center">
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full mr-2 flex-shrink-0",
                  product.isLicensed
                    ? "bg-yellow-500"
                    : isPlantSensor
                    ? "bg-green-500"
                    : product.type === "companion"
                    ? "bg-blue-500"
                    : "bg-purple-500"
                )}
              />
              <span className="truncate">{feat}</span>
            </li>
          ))}
        </ul>

        {/* Price & Button */}
        <div className="mt-auto w-full space-y-3">
          <div className="flex items-baseline justify-between">
            <span
              className={cn(
                "text-2xl font-bold",
                product.isLicensed
                  ? "text-orange-700"
                  : isPlantSensor
                  ? "text-green-700"
                  : typeConfig.text
              )}
            >
              {product.price}
            </span>
            <span className="text-xs text-gray-500">
              {product.isLicensed ? "Limited Edition" : "+ shipping"}
            </span>
          </div>
          <Button
            size="lg"
            disabled
            className="w-full text-gray-400 bg-gray-200 cursor-not-allowed"
          >
            {product.isLicensed ? (
              <>
                <Award className="w-4 h-4 mr-2" />
                Get {product.name.split(" ")[0]}
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 mr-2" />
                <span className="truncate">
                  {selectedAnimal
                    ? `Buy ${selectedAnimal.label} ${
                        isPlantSensor
                          ? "Guardian"
                          : product.name.includes("Plush")
                          ? "Plush"
                          : product.name.includes("Figurine")
                          ? "Figurine"
                          : "Bracelet"
                      }`
                    : "Buy Now"}
                </span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}