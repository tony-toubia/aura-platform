// apps/web/app/api/config/check-weather/route.ts
import { NextResponse } from 'next/server'
import { getOpenWeatherApiKey } from '@/lib/services/secrets-manager'

export const dynamic = 'force-dynamic'

/**
 * Check if OpenWeather API is properly configured
 * This endpoint is used by client components to verify weather functionality
 * without exposing the actual API key
 */
export async function GET() {
  try {
    const apiKey = await getOpenWeatherApiKey()
    
    return NextResponse.json({
      configured: !!apiKey,
      // Never expose the actual key, just indicate if it's configured
      message: apiKey 
        ? 'Weather service is properly configured' 
        : 'Weather service is not configured. Please set up the OpenWeather API key.'
    })
  } catch (error) {
    console.error('Error checking weather configuration:', error)
    return NextResponse.json({
      configured: false,
      message: 'Error checking weather service configuration'
    }, { status: 500 })
  }
}