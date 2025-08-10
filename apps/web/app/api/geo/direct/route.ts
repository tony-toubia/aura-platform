// apps/web/app/api/geo/direct/route.ts
import { NextResponse } from 'next/server'
import { getOpenWeatherApiKey } from '@/lib/services/secrets-manager'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const limit = searchParams.get('limit') || '8'

    // Securely get API key from Secret Manager (or env in dev)
    const apiKey = await getOpenWeatherApiKey()
    if (!apiKey) {
      console.error('OpenWeather API key not found in secrets')
      return NextResponse.json({ error: 'Weather service configuration error' }, { status: 500 })
    }

    if (!q.trim()) {
      return NextResponse.json([])
    }

    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=${encodeURIComponent(limit)}&appid=${apiKey}`
    const res = await fetch(url)
    if (!res.ok) {
      return NextResponse.json([], { status: res.status })
    }
    const data = await res.json()
    const results = (data || []).map((loc: any) => ({
      name: `${loc.name}${loc.state ? `, ${loc.state}` : ''}`,
      lat: loc.lat,
      lon: loc.lon,
      country: loc.country,
    }))

    return NextResponse.json(results)
  } catch (err) {
    console.error('Geo direct error:', err)
    return NextResponse.json([], { status: 500 })
  }
}