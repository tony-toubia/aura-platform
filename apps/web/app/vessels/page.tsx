// apps/web/app/vessels/page.tsx
import React from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { NextPage } from "next"

// (Example data—swap in real product info / images / pricing as you like)
const vessels = [
  {
    id: "glass-orb",
    name: "Glass Orb Vessel",
    price: "$29.99",
    image: "/images/vessels/glass-orb.jpg",
    description: "A sleek glass orb to house your Aura.",
  },
  {
    id: "wooden-box",
    name: "Wooden Box Vessel",
    price: "$39.99",
    image: "/images/vessels/wooden-box.jpg",
    description: "Hand-crafted oak box, feels warm to the touch.",
  },
  {
    id: "ceramic-cube",
    name: "Ceramic Cube Vessel",
    price: "$34.99",
    image: "/images/vessels/ceramic-cube.jpg",
    description: "Modern geometry in glazed ceramic.",
  },
]

const VesselsPage: NextPage = () => {
  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-4xl font-bold mb-8">Aura Vessels</h1>
      <div className="grid gap-8 md:grid-cols-3">
        {vessels.map((v) => (
          <Card key={v.id} className="flex flex-col">
            <img
              src={v.image}
              alt={v.name}
              className="w-full h-48 object-cover rounded-md mb-4"
            />
            <h2 className="text-xl font-semibold mb-2">{v.name}</h2>
            <p className="text-muted-foreground mb-4">{v.description}</p>
            <div className="mt-auto flex items-center justify-between">
              <span className="text-lg font-bold">{v.price}</span>
              <Link href={`/vessels/${v.id}`}>
                <Button size="sm">Buy Now</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default VesselsPage
