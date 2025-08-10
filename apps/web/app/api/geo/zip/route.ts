// apps/web/app/api/geo/zip/route.ts
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const zip = searchParams.get('zip') || ''
    const country = (searchParams.get('country') || 'US').toUpperCase()

    const apiKey = process.env.OPENWEATHER_API_KEY || process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing OpenWeather API key' }, { status: 500 })
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