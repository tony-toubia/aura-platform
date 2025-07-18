"use client"

import React, { useEffect, useState } from "react"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import dynamic from "next/dynamic"

const WildlifeMap = dynamic(
  () => import("@/components/wildlife-map"),
  { ssr: false }
)

// Define the shape of our combined animal data
interface CombinedIndividual {
  studyId: number;
  individualId: string;
  label: string;
}

interface TrackPoint {
  lat: number
  lon: number
  timestamp?: string
}

export default function WildlifePage() {
  // State for the combined animal list
  const [allAnimals, setAllAnimals] = useState<CombinedIndividual[]>([])
  
  // State for the selected study and individual
  const [studyId, setStudyId] = useState<number>()
  const [individualId, setIndividualId] = useState<string>()
  
  // Other page state
  const [start, setStart] = useState(() => new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10))
  const [end, setEnd] = useState(() => new Date().toISOString().slice(0, 10))
  const [points, setPoints] = useState<TrackPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch the combined list of animals on page load
  useEffect(() => {
    fetch("/api/wildlife/all-individuals")
      .then((r) => r.json())
      .then((data) => {
        setAllAnimals(data)
        setIsLoading(false)
      })
      .catch(error => {
        console.error("Failed to fetch animals:", error)
        setIsLoading(false)
      })
  }, [])

  async function loadTrack() {
    if (!studyId || !individualId) return
    const res = await fetch(
      `/api/wildlife/tracks?studyId=${studyId}` +
        `&individualId=${encodeURIComponent(individualId)}` +
        `&start=${start}&end=${end}`
    )
    const data: TrackPoint[] = await res.json()
    setPoints(data)
  }

  // Handle selection from the new single dropdown
  const handleAnimalSelect = (value: string) => {
    if (!value) return;
    try {
      const selected: CombinedIndividual = JSON.parse(value);
      setStudyId(selected.studyId);
      setIndividualId(selected.individualId);
    } catch (error) {
      console.error("Failed to parse selected animal value:", error);
    }
  };

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-2xl font-bold">Wildlife Tracker</h1>
      <div className="grid grid-cols-4 gap-4">
        {/* The new single dropdown for animal selection */}
        <div className="col-span-2">
          <label>Animal</label>
          <Select onValueChange={handleAnimalSelect} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder={isLoading ? "Loading animals..." : "Select animal"} />
            </SelectTrigger>
            <SelectContent>
              {allAnimals.map((animal) => (
                <SelectItem key={animal.label} value={JSON.stringify(animal)}>
                  {animal.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Date pickers remain the same */}
        <div>
          <label>From</label>
          <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div>
          <label>To</label>
          <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
      </div>

      <Button onClick={loadTrack} disabled={!studyId || !individualId}>Load Track</Button>

      <div className="h-[400px]">
        <WildlifeMap points={points} />
      </div>
    </div>
  )
}
