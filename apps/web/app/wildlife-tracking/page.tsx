// app/wildlife-tracking/page.tsx

"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Map, 
  Navigation, 
  Thermometer, 
  Droplets, 
  Wind, 
  Sun, 
  Moon,
  Activity,
  Heart,
  Footprints,
  TreePine,
  Mountain,
  Waves,
  Calendar,
  Clock,
  MapPin,
  TrendingUp,
  AlertCircle,
  Sparkles,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"

// Mock data for different animals
const animalData = {
  elephant: {
    name: "Kibo",
    species: "African Elephant",
    icon: "🐘",
    location: "Amboseli National Park, Kenya",
    status: "Active",
    lastUpdate: "2 minutes ago",
    health: {
      heartRate: 28,
      temperature: 36.5,
      activity: "Foraging",
      mood: "Content"
    },
    journey: {
      distance: 12.4,
      duration: "6 hours",
      elevation: 1150,
      speed: 2.1
    },
    coordinates: [
      { lat: -2.6527, lng: 37.2606, time: "06:00", activity: "Starting morning trek" },
      { lat: -2.6489, lng: 37.2650, time: "07:30", activity: "Drinking at watering hole" },
      { lat: -2.6445, lng: 37.2689, time: "09:00", activity: "Foraging in acacia grove" },
      { lat: -2.6401, lng: 37.2732, time: "10:30", activity: "Dust bathing" },
      { lat: -2.6358, lng: 37.2778, time: "12:00", activity: "Resting under baobab tree" },
    ]
  },
  giraffe: {
    name: "Twiga",
    species: "Masai Giraffe",
    icon: "🦒",
    location: "Serengeti National Park, Tanzania",
    status: "Resting",
    lastUpdate: "5 minutes ago",
    health: {
      heartRate: 65,
      temperature: 38.5,
      activity: "Grazing",
      mood: "Peaceful"
    },
    journey: {
      distance: 8.2,
      duration: "4 hours",
      elevation: 1320,
      speed: 2.0
    },
    coordinates: [
      { lat: -2.3328, lng: 34.8310, time: "08:00", activity: "Morning browse" },
      { lat: -2.3301, lng: 34.8342, time: "09:00", activity: "Moving with herd" },
      { lat: -2.3275, lng: 34.8375, time: "10:00", activity: "Acacia feeding" },
      { lat: -2.3248, lng: 34.8409, time: "11:00", activity: "Approaching water" },
      { lat: -2.3221, lng: 34.8443, time: "12:00", activity: "Drinking and socializing" },
    ]
  },
  whale: {
    name: "Luna",
    species: "Humpback Whale",
    icon: "🐋",
    location: "Pacific Ocean, Monterey Bay",
    status: "Migrating",
    lastUpdate: "10 minutes ago",
    health: {
      heartRate: 8,
      temperature: 36.0,
      activity: "Deep diving",
      mood: "Energetic"
    },
    journey: {
      distance: 45.7,
      duration: "8 hours",
      elevation: -120,
      speed: 5.7
    },
    coordinates: [
      { lat: 36.6195, lng: -121.9018, time: "04:00", activity: "Dawn feeding dive" },
      { lat: 36.6002, lng: -121.9145, time: "06:00", activity: "Surface breathing" },
      { lat: 36.5810, lng: -121.9273, time: "08:00", activity: "Pod communication" },
      { lat: 36.5618, lng: -121.9401, time: "10:00", activity: "Krill feeding" },
      { lat: 36.5425, lng: -121.9530, time: "12:00", activity: "Breaching display" },
    ]
  }
}

const weatherData = {
  elephant: {
    temp: 28,
    humidity: 45,
    wind: 12,
    conditions: "Partly Cloudy",
    icon: "⛅",
    forecast: "Clear skies expected"
  },
  giraffe: {
    temp: 31,
    humidity: 38,
    wind: 8,
    conditions: "Sunny",
    icon: "☀️",
    forecast: "Hot and dry conditions"
  },
  whale: {
    temp: 14,
    humidity: 78,
    wind: 22,
    conditions: "Foggy",
    icon: "🌫️",
    forecast: "Marine layer clearing"
  }
}

type AnimalType = keyof typeof animalData

export default function WildlifeTrackingPage() {
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalType>("elephant")
  const [activeTab, setActiveTab] = useState("journey")
  const [isLive, setIsLive] = useState(true)
  
  const animal = animalData[selectedAnimal]
  const weather = weatherData[selectedAnimal]

  // Simulate live updates
  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        // Would update with real data here
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [isLive])

  return (      
      <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4 pt-8">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
              <Navigation className="w-4 h-4" />
              Wildlife Companion Tracking
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Journey Through Wild Eyes
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Follow the incredible adventures of your companion vessels as they explore their natural habitats
            </p>
          </div>

          {/* Animal Selector */}
          <div className="flex flex-wrap gap-4 justify-center">
            {(Object.keys(animalData) as AnimalType[]).map((type) => {
              const data = animalData[type]
              const isSelected = selectedAnimal === type
              
              return (
                <Card
                  key={type}
                  onClick={() => setSelectedAnimal(type)}
                  className={cn(
                    "cursor-pointer transition-all duration-300 hover:scale-105 border-2",
                    isSelected 
                      ? "border-blue-500 shadow-xl bg-gradient-to-br from-blue-50 to-green-50" 
                      : "border-gray-200 hover:border-blue-300"
                  )}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="text-5xl">{data.icon}</div>
                      <div>
                        <h3 className="font-bold text-lg">{data.name}</h3>
                        <p className="text-sm text-gray-600">{data.species}</p>
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "mt-1",
                            data.status === "Active" && "bg-green-100 text-green-700",
                            data.status === "Resting" && "bg-yellow-100 text-yellow-700",
                            data.status === "Migrating" && "bg-blue-100 text-blue-700"
                          )}
                        >
                          {data.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Map/Journey View */}
            <Card className="lg:col-span-2 border-2 border-blue-100">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Map className="w-5 h-5 text-blue-600" />
                    Today's Journey
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={isLive ? "default" : "secondary"}
                      className={cn(
                        "gap-1",
                        isLive && "bg-green-500"
                      )}
                    >
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        isLive ? "bg-white animate-pulse" : "bg-gray-400"
                      )} />
                      {isLive ? "LIVE" : "PAUSED"}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsLive(!isLive)}
                    >
                      {isLive ? "Pause" : "Resume"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Journey Map Visualization */}
                <div className="relative bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-8 min-h-[400px]">
                  {/* Path visualization */}
                  <div className="absolute inset-0 p-8">
                    <svg className="w-full h-full" viewBox="0 0 400 300">
                      {/* Draw path */}
                      <path
                        d={`M ${animal.coordinates.map((c, i) => 
                          `${50 + i * 70} ${150 - (c.lat + 2.65) * 1000}`
                        ).join(' L ')}`}
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="3"
                        strokeDasharray="5,5"
                        className="animate-pulse"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3B82F6" />
                          <stop offset="100%" stopColor="#10B981" />
                        </linearGradient>
                      </defs>
                      
                      {/* Journey points */}
                      {animal.coordinates.map((coord, i) => (
                        <g key={i}>
                          <circle
                            cx={50 + i * 70}
                            cy={150 - (coord.lat + 2.65) * 1000}
                            r="8"
                            fill={i === animal.coordinates.length - 1 ? "#10B981" : "#3B82F6"}
                            className="cursor-pointer hover:r-10 transition-all"
                          />
                          {i === animal.coordinates.length - 1 && (
                            <circle
                              cx={50 + i * 70}
                              cy={150 - (coord.lat + 2.65) * 1000}
                              r="12"
                              fill="none"
                              stroke="#10B981"
                              strokeWidth="2"
                              className="animate-ping"
                            />
                          )}
                        </g>
                      ))}
                    </svg>
                  </div>
                  
                  {/* Journey Timeline */}
                  <div className="relative z-10 mt-[320px] space-y-3">
                    {animal.coordinates.map((coord, i) => (
                      <div 
                        key={i}
                        className={cn(
                          "flex items-center gap-4 p-3 rounded-lg transition-all",
                          i === animal.coordinates.length - 1 
                            ? "bg-green-100 border-2 border-green-300" 
                            : "bg-white/80 hover:bg-white"
                        )}
                      >
                        <div className="text-sm font-medium text-gray-600 w-16">
                          {coord.time}
                        </div>
                        <div className="flex-1 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-500" />
                          <span className="text-sm">{coord.activity}</span>
                        </div>
                        {i === animal.coordinates.length - 1 && (
                          <Badge className="bg-green-500">Current</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Journey Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-blue-600 mb-1">
                      <Footprints className="w-4 h-4" />
                      <span className="text-sm font-medium">Distance</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-700">
                      {animal.journey.distance} km
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-green-600 mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">Duration</span>
                    </div>
                    <div className="text-2xl font-bold text-green-700">
                      {animal.journey.duration}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-orange-600 mb-1">
                      <Mountain className="w-4 h-4" />
                      <span className="text-sm font-medium">Elevation</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-700">
                      {animal.journey.elevation}m
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-purple-600 mb-1">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm font-medium">Avg Speed</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-700">
                      {animal.journey.speed} km/h
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Side Panel */}
            <div className="space-y-6">
              {/* Live Status Card */}
              <Card className="border-2 border-green-100">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-600" />
                    Live Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Current Activity</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        {animal.health.activity}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-red-500" />
                          <span className="text-sm">Heart Rate</span>
                        </div>
                        <span className="font-medium">{animal.health.heartRate} bpm</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Thermometer className="w-4 h-4 text-orange-500" />
                          <span className="text-sm">Temperature</span>
                        </div>
                        <span className="font-medium">{animal.health.temperature}°C</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-500" />
                          <span className="text-sm">Mood</span>
                        </div>
                        <span className="font-medium text-purple-600">{animal.health.mood}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      Last updated: <span className="font-medium">{animal.lastUpdate}</span>
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Weather Card */}
              <Card className="border-2 border-blue-100">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-sky-50">
                  <CardTitle className="flex items-center gap-2">
                    <Sun className="w-5 h-5 text-yellow-500" />
                    Local Weather
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="text-6xl mb-2">{weather.icon}</div>
                    <p className="text-lg font-medium">{weather.conditions}</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <Thermometer className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                      <p className="text-2xl font-bold">{weather.temp}°</p>
                      <p className="text-xs text-gray-600">Temp</p>
                    </div>
                    <div>
                      <Droplets className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                      <p className="text-2xl font-bold">{weather.humidity}%</p>
                      <p className="text-xs text-gray-600">Humidity</p>
                    </div>
                    <div>
                      <Wind className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                      <p className="text-2xl font-bold">{weather.wind}</p>
                      <p className="text-xs text-gray-600">km/h</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <span className="font-medium">Forecast:</span> {weather.forecast}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Location Info */}
              <Card className="border-2 border-purple-100">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-purple-600" />
                    Location Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Current Location</p>
                      <p className="font-medium">{animal.location}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                      <TreePine className="w-5 h-5 text-green-600" />
                      <span className="text-sm">
                        Protected habitat with diverse ecosystems
                      </span>
                    </div>
                    
                    <Button className="w-full" variant="outline">
                      View on Map
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Story Updates */}
          <Card className="border-2 border-purple-100">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Today's Adventure Story
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="prose prose-purple max-w-none">
                <p className="text-lg leading-relaxed">
                  <span className="text-2xl">{animal.icon}</span> {animal.name}'s day began with 
                  {animal === animalData.elephant && " the gentle rustling of acacia leaves. The herd moved together through the savanna, following ancient paths worn smooth by countless generations. At the watering hole, young calves played while the matriarch kept watchful guard."}
                  {animal === animalData.giraffe && " reaching for the tender leaves at the top of an umbrella thorn tree. The morning sun cast long shadows across the Serengeti as the tower moved gracefully across the plains, their movements synchronized in an ancient dance."}
                  {animal === animalData.whale && " a spectacular breach that sent thousands of droplets sparkling in the dawn light. The pod's songs echoed through the deep waters as they followed the nutrient-rich currents, part of their timeless migration along the California coast."}
                </p>
                
                <div className="flex items-center gap-2 mt-4 p-4 bg-purple-50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-purple-600" />
                  <p className="text-sm text-purple-700 mb-0">
                    This companion is part of a conservation research program. Your connection helps support wildlife protection efforts.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
  )
}