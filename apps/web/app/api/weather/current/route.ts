// apps/web/app/api/weather/current/route.ts
import { NextResponse } from 'next/server'
import { getOpenWeatherApiKey } from '@/lib/services/secrets-manager.server'
import { CacheKeys, CacheTTL, withCache } from '@/lib/redis'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { lat, lon } = await request.json()
    
    if (!lat || !lon) {
      return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 })
    }

    // Round coordinates to 2 decimal places for cache key consistency
    const roundedLat = Math.round(lat * 100) / 100
    const roundedLon = Math.round(lon * 100) / 100
    
    // Use Redis cache with automatic fallback to API
    const weatherData = await withCache(
      CacheKeys.weather(roundedLat, roundedLon),
      async () => {
        console.log(`Fetching fresh weather data for ${roundedLat}, ${roundedLon}`)
        
        // Securely get API key from Secret Manager (or env in dev)
        const apiKey = await getOpenWeatherApiKey()
        if (!apiKey) {
          console.error('OpenWeather API key not found in secrets')
          throw new Error('Weather service configuration error')
        }

        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${roundedLat}&lon=${roundedLon}&appid=${apiKey}&units=metric`
        )
        
        if (!res.ok) {
          throw new Error('Weather API request failed')
        }

        const data = await res.json()
        
        // Return formatted data that will be cached
        return {
          temperature: Math.round(data.main.temp),
          humidity: data.main.humidity,
          description: data.weather[0].description,
          feelsLike: Math.round(data.main.feels_like),
          pressure: data.main.pressure,
          windSpeed: data.wind.speed,
          clouds: data.clouds.all,
          city: data.name,
          country: data.sys.country,
          cachedAt: new Date().toISOString(),
        }
      },
      CacheTTL.WEATHER // 10 minutes TTL
    )
    
    return NextResponse.json(weatherData)
  } catch (error) {
    console.error('Failed to fetch weather:', error)
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 })
  }
}