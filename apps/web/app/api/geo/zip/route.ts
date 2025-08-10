// apps/web/app/api/geo/zip/route.ts
import { NextResponse } from 'next/server'
import { getOpenWeatherApiKey } from '@/lib/services/secrets-manager'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const zip = searchParams.get('zip') || ''
    const country = (searchParams.get('country') || 'US').toUpperCase()

    // Securely get API key from Secret Manager (or env in dev)
    const apiKey = await getOpenWeatherApiKey()
    if (!apiKey) {
      console.error('OpenWeather API key not found in secrets')
      return NextResponse.json({ error: 'Weather service configuration error' }, { status: 500 })
    }

    if (!zip.trim()) {
      return NextResponse.json([])
    }

    const url = `https://api.openweathermap.org/geo/1.0/zip?zip=${encodeURIComponent(`${zip},${country}`)}&appid=${apiKey}`
    const res = await fetch(url)
    if (!res.ok) {
      return NextResponse.json([], { status: res.status })
    }
    const data = await res.json()
    if (!data || !data.name) return NextResponse.json([])

    const result = [{ name: data.name, lat: data.lat, lon: data.lon, country: data.country }]
    return NextResponse.json(result)
  } catch (err) {
    console.error('Geo zip error:', err)
    return NextResponse.json([], { status: 500 })
  }
}