// apps/web/components/aura/animal-selector.tsx
"use client"

import React, { useEffect, useState } from "react"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../ui/select"

/** 
 * Each object must include the real UUID in `individualId`,
 * plus the human-readable label for display. 
 */
interface CombinedIndividual {
  studyId: number
  individualId: string  // <-- this must be the UUID your DB expects
  label: string         // e.g. "Vespertilio murinus VMR-12"
}

interface Props {
  onStudyChange: (id: number) => void
  onIndividualChange: (id: string) => void
}

export function AnimalSelector({
  onStudyChange,
  onIndividualChange,
}: Props) {
  const [animals, setAnimals] = useState<CombinedIndividual[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedIndividualId, setSelectedIndividualId] = useState("")

  useEffect(() => {
    fetch("/api/wildlife/all-individuals")
      .then((r) => r.json())
      .then((data: CombinedIndividual[]) => {
        setAnimals(data)
        setIsLoading(false)
      })
      .catch((error) => {
        console.error("Failed to fetch animals:", error)
        setIsLoading(false)
      })
  }, [])

  const handleValueChange = (value: string) => {
    setSelectedIndividualId(value)

    // Find the matching object so we can also emit the studyId
    const selected = animals.find((a) => a.individualId === value)
    if (selected) {
      onStudyChange(selected.studyId)
      onIndividualChange(selected.individualId)
    }
  }

  return (
    <div className="space-y-4 mb-6">
      <div>
        <label className="block text-sm font-medium mb-1">
          Animal Companion
        </label>
        <Select
          value={selectedIndividualId}
          onValueChange={handleValueChange}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                isLoading ? "Loading animals..." : "Select an animal"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {animals.map((animal) => (
              <SelectItem
                key={animal.individualId}
                value={animal.individualId}
              >
                {animal.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
