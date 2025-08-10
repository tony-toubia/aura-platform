// apps/web/app/api/weather/forecast/route.ts
import { NextResponse } from 'next/server'
import { getOpenWeatherApiKey } from '@/lib/services/secrets-manager.server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { lat, lon } = await request.json()
    
    if (!lat || !lon) {
      return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 })
    }

    // Securely get API key from Secret Manager (or env in dev)
    const apiKey = await getOpenWeatherApiKey()
    if (!apiKey) {
      console.error('OpenWeather API key not found in secrets')
      return NextResponse.json({ error: 'Weather service configuration error' }, { status: 500 })
    }

    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&cnt=8`
    )
    
    if (!res.ok) {
      throw new Error('Forecast API request failed')
    }

    const data = await res.json()
    return NextResponse.json(data.list)
  } catch (error) {
    console.error('Failed to fetch forecast:', error)
    return NextResponse.json({ error: 'Failed to fetch forecast data' }, { status: 500 })
  }
}