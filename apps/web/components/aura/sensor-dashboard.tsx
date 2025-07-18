"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Cloud, Droplets, Sun, Wind, Gauge, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SensorDashboardProps {
  senseData: any
  className?: string
}

export function SensorDashboard({ senseData, className }: SensorDashboardProps) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3", className)}>
      {senseData.weather && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weather</CardTitle>
            <Cloud className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{senseData.weather.temperature}°C</div>
            <p className="text-xs text-muted-foreground">
              {senseData.weather.description} in {senseData.weather.city}
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div>Humidity: {senseData.weather.humidity}%</div>
              <div>Wind: {senseData.weather.windSpeed} m/s</div>
            </div>
          </CardContent>
        </Card>
      )}

      {senseData.soil_moisture && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Soil Moisture</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{senseData.soil_moisture.value}%</div>
            <p className="text-xs text-muted-foreground">
              Status: {senseData.soil_moisture.status}
            </p>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all",
                  senseData.soil_moisture.value < 20 ? "bg-red-500" :
                  senseData.soil_moisture.value < 40 ? "bg-orange-500" :
                  senseData.soil_moisture.value < 60 ? "bg-green-500" :
                  senseData.soil_moisture.value < 80 ? "bg-blue-500" :
                  "bg-blue-700"
                )}
                style={{ width: `${senseData.soil_moisture.value}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {senseData.light_level && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Light Level</CardTitle>
            <Sun className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{senseData.light_level.value} lux</div>
            <p className="text-xs text-muted-foreground">
              {senseData.light_level.status}
            </p>
          </CardContent>
        </Card>
      )}

      {senseData.air_quality && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Air Quality</CardTitle>
            <Wind className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">AQI {senseData.air_quality.aqi}</div>
            <p className="text-xs text-muted-foreground">
              {senseData.air_quality.status}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}