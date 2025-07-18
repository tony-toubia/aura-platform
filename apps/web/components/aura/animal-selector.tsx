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

// Define the shape of the data we expect from our new API endpoint
interface CombinedIndividual {
  studyId: number;
  individualId: string;
  label: string; // e.g., "A01 (Galapagos Albatrosses)"
}

interface Props {
  // We still need to inform the parent component of the selection
  onStudyChange: (id: number) => void
  onIndividualChange: (id: string) => void
}

export function AnimalSelector({ onStudyChange, onIndividualChange }: Props) {
  // State to hold the combined list of all animals
  const [animals, setAnimals] = useState<CombinedIndividual[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedValue, setSelectedValue] = useState("")

  // Fetch the combined list from our new endpoint when the component loads
  useEffect(() => {
    fetch("/api/wildlife/all-individuals")
      .then((r) => r.json())
      .then((data) => {
        setAnimals(data)
        setIsLoading(false)
      })
      .catch(error => {
        console.error("Failed to fetch animals:", error)
        setIsLoading(false)
      })
  }, [])

  // When a user makes a selection, we parse the value and update the parent
  const handleValueChange = (value: string) => {
    if (!value) return;

    try {
      const selected: CombinedIndividual = JSON.parse(value);
      setSelectedValue(value);
      onStudyChange(selected.studyId);
      onIndividualChange(selected.individualId);
    } catch (error) {
      console.error("Failed to parse selected animal value:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Animal Companion</label>
        <Select
          value={selectedValue}
          onValueChange={handleValueChange}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder={isLoading ? "Loading animals..." : "Select an animal"} />
          </SelectTrigger>
          <SelectContent>
            {animals.map((animal) => (
              // The value is a stringified JSON object containing all necessary info
              <SelectItem key={animal.label} value={JSON.stringify(animal)}>
                {animal.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
