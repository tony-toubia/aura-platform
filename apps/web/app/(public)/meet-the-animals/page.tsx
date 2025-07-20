// apps/web/app/meet-the-animals/page.tsx

"use client"

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingBag, Globe, ShieldCheck, Leaf } from 'lucide-react'
import { cn } from '@/lib/utils'

// Data structure for our animal companions
interface Animal {
  id: string
  name: string
  scientificName: string
  icon: string
  region: string
  conservationStatus: 'Vulnerable' | 'Endangered' | 'Critically Endangered' | 'Least Concern'
  funFact: string
  imageUrl: string
  vessels: {
    id: 'plush' | 'figurine'
    name: string
    price: string
    href: string
  }[]
}

// The list of available animals, inspired by your existing list
const animals: Animal[] = [
  {
    id: 'elephant',
    name: 'African Elephant',
    scientificName: 'Loxodonta africana',
    icon: '🐘',
    region: 'Sub-Saharan Africa',
    conservationStatus: 'Endangered',
    funFact: 'Elephants can communicate over long distances using low-frequency sounds that humans cannot hear.',
    imageUrl: 'https://placehold.co/600x400/6366F1/FFFFFF?text=🐘',
    vessels: [
      { id: 'plush', name: 'Plush Companion', price: '$24.99', href: '/vessels/companion-plush?animal=elephant' },
      { id: 'figurine', name: 'Desktop Figurine', price: '$29.99', href: '/vessels/companion-figurine?animal=elephant' },
    ],
  },
  {
    id: 'giraffe',
    name: 'Masai Giraffe',
    scientificName: 'Giraffa tippelskirchi',
    icon: '🦒',
    region: 'East Africa',
    conservationStatus: 'Endangered',
    funFact: 'A giraffe\'s neck is too short to reach the ground. To drink, it has to awkwardly spread its front legs.',
    imageUrl: 'https://placehold.co/600x400/EC4899/FFFFFF?text=🦒',
    vessels: [
      { id: 'plush', name: 'Plush Companion', price: '$24.99', href: '/vessels/companion-plush?animal=giraffe' },
      { id: 'figurine', name: 'Desktop Figurine', price: '$29.99', href: '/vessels/companion-figurine?animal=giraffe' },
    ],
  },
  {
    id: 'tortoise',
    name: 'Galápagos Tortoise',
    scientificName: 'Chelonoidis niger',
    icon: '🐢',
    region: 'Galápagos Islands',
    conservationStatus: 'Vulnerable',
    funFact: 'These gentle giants can live for over 100 years, making them one of the longest-living vertebrates.',
    imageUrl: 'https://placehold.co/600x400/22C55E/FFFFFF?text=🐢',
    vessels: [
      { id: 'plush', name: 'Plush Companion', price: '$24.99', href: '/vessels/companion-plush?animal=tortoise' },
      { id: 'figurine', name: 'Desktop Figurine', price: '$29.99', href: '/vessels/companion-figurine?animal=tortoise' },
    ],
  },
  {
    id: 'lion',
    name: 'African Lion',
    scientificName: 'Panthera leo',
    icon: '🦁',
    region: 'Africa & India',
    conservationStatus: 'Vulnerable',
    funFact: 'A lion\'s roar can be heard from as far as 5 miles (8 kilometers) away.',
    imageUrl: 'https://placehold.co/600x400/F97316/FFFFFF?text=🦁',
    vessels: [
      { id: 'plush', name: 'Plush Companion', price: '$24.99', href: '/vessels/companion-plush?animal=lion' },
      { id: 'figurine', name: 'Desktop Figurine', price: '$29.99', href: '/vessels/companion-figurine?animal=lion' },
    ],
  },
  {
    id: 'whale',
    name: 'Humpback Whale',
    scientificName: 'Megaptera novaeangliae',
    icon: '🐋',
    region: 'Oceans Worldwide',
    conservationStatus: 'Least Concern',
    funFact: 'Humpback whales sing complex songs that can last for hours and evolve over time.',
    imageUrl: 'https://placehold.co/600x400/3B82F6/FFFFFF?text=🐋',
    vessels: [
      { id: 'plush', name: 'Plush Companion', price: '$24.99', href: '/vessels/companion-plush?animal=whale' },
      { id: 'figurine', name: 'Desktop Figurine', price: '$29.99', href: '/vessels/companion-figurine?animal=whale' },
    ],
  },
  {
    id: 'gorilla',
    name: 'Mountain Gorilla',
    scientificName: 'Gorilla beringei beringei',
    icon: '🦍',
    region: 'Central Africa',
    conservationStatus: 'Endangered',
    funFact: 'Gorillas share about 98% of their DNA with humans, making them one of our closest living relatives.',
    imageUrl: 'https://placehold.co/600x400/8B5CF6/FFFFFF?text=🦍',
    vessels: [
      { id: 'plush', name: 'Plush Companion', price: '$24.99', href: '/vessels/companion-plush?animal=gorilla' },
      { id: 'figurine', name: 'Desktop Figurine', price: '$29.99', href: '/vessels/companion-figurine?animal=gorilla' },
    ],
  },
];

const statusColors: { [key in Animal['conservationStatus']]: string } = {
  'Critically Endangered': 'bg-red-100 text-red-800 border-red-200',
  'Endangered': 'bg-orange-100 text-orange-800 border-orange-200',
  'Vulnerable': 'bg-amber-100 text-amber-800 border-amber-200',
  'Least Concern': 'bg-green-100 text-green-800 border-green-200',
};

export default function MeetTheAnimalsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-12 py-12 px-4">
      <header className="text-center space-y-2 mb-8">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Meet the Companions
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover the incredible animals you can connect with. Each companion has a story, and every vessel helps support wildlife conservation.
        </p>
      </header>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {animals.map((animal) => (
          <Card key={animal.id} className="flex flex-col overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2">
            <CardHeader className="p-0 relative">
              <img src={animal.imageUrl} alt={animal.name} className="w-full h-48 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4">
                <h2 className="text-3xl font-bold text-white">{animal.name}</h2>
                <p className="text-sm text-white/80 italic">{animal.scientificName}</p>
              </div>
            </CardHeader>

            <CardContent className="p-6 flex-1 flex flex-col">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Globe className="w-4 h-4 text-blue-500" />
                    <span>{animal.region}</span>
                  </div>
                  <Badge className={cn("border", statusColors[animal.conservationStatus])}>
                    <ShieldCheck className="w-3 h-3 mr-1.5" />
                    {animal.conservationStatus}
                  </Badge>
                </div>
                <p className="text-gray-700 text-center bg-gray-50 p-3 rounded-lg border">
                  <span className="font-bold">Did you know?</span> {animal.funFact}
                </p>
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-center text-lg font-semibold text-gray-800 mb-4">Shop Companion Vessels</h3>
                <div className="space-y-3">
                  {animal.vessels.map(vessel => (
                     <Button key={vessel.id} asChild size="lg" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
                       <Link href={vessel.href}>
                         <div className="flex justify-between items-center w-full">
                           <span>{vessel.name}</span>
                           <span className="font-bold text-base">{vessel.price}</span>
                         </div>
                       </Link>
                     </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
