// apps/web/app/api/geo/direct/route.ts
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const limit = searchParams.get('limit') || '8'

    const apiKey = process.env.OPENWEATHER_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing OpenWeather API key' }, { status: 500 })
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