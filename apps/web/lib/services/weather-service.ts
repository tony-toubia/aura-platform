// apps/web/lib/services/weather-service.ts
// This is a client-safe version that doesn't import any server-only modules

export interface WeatherData {
  temperature: number
  humidity: number
  description: string
  feelsLike: number
  pressure: number
  windSpeed: number
  clouds: number
  city: string
  country: string
}

export interface LocationConfig {
  type: 'specific' | 'user' | 'global'
  location?: {
    name: string
    lat?: number
    lon?: number
    country?: string
  }
}

export class WeatherService {
  /**
   * Get current weather data
   * Note: This method should only be called from server-side code
   * The API key is handled server-side for security
   */
  static async getCurrentWeather(
    lat?: number,
    lon?: number,
    locationConfig?: LocationConfig
  ): Promise<WeatherData | null> {
    try {
      let latitude = lat ?? 39.0997   // Default to Kansas City
      let longitude = lon ?? -94.5786

      // Handle location config
      if (locationConfig) {
        if (locationConfig.type === 'specific' && locationConfig.location) {
          latitude = locationConfig.location.lat ?? latitude
          longitude = locationConfig.location.lon ?? longitude
        } else if (locationConfig.type === 'user') {
          // This would use the user's current location
          // For now, we'll use the default or passed coordinates
          // In a real implementation, you'd get this from the browser's geolocation API
        }
      }

      // Call server-side API endpoint that handles the actual weather fetching
      const response = await fetch('/api/weather/current', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lat: latitude, lon: longitude }),
      })

      if (!response.ok) {
        throw new Error('Weather API request failed')
      }

      return await response.json()
    } catch (e) {
      console.error('Failed to fetch weather:', e)
      return null
    }
  }

  static async getForecast(
    lat?: number, 
    lon?: number,
    locationConfig?: LocationConfig
  ): Promise<ForecastEntry[]> {
    try {
      let latitude  = lat  ?? 39.0997
      let longitude = lon ?? -94.5786

      // Handle location config
      if (locationConfig) {
        if (locationConfig.type === 'specific' && locationConfig.location) {
          latitude = locationConfig.location.lat ?? latitude
          longitude = locationConfig.location.lon ?? longitude
        }
      }

      // Call server-side API endpoint that handles the actual forecast fetching
      const response = await fetch('/api/weather/forecast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lat: latitude, lon: longitude }),
      })

      if (!response.ok) {
        throw new Error('Forecast API request failed')
      }

      return await response.json()
    } catch (e) {
      console.error('Failed to fetch forecast:', e)
      return []
    }
  }

  // New method to geocode location names
  static async geocodeLocation(query: string): Promise<{
    name: string
    lat: number
    lon: number
    country: string
  } | null> {
    try {
      // Use the existing geo/direct endpoint which already handles auth server-side
      const res = await fetch(`/api/geo/direct?q=${encodeURIComponent(query)}&limit=1`)
      if (!res.ok) return null
      const data = await res.json()
      if (!data || data.length === 0) return null
      return data[0]
    } catch (error) {
      console.error('Geocoding failed:', error)
      return null
    }
  }
}

// Minimal forecast entry typing from OpenWeather 5-day/3-hour API
export type ForecastEntry = {
  dt: number
  main: {
    temp: number
    feels_like: number
    pressure: number
    humidity: number
  }
  weather: Array<{
    id: number
    main: string
    description: string
    icon: string
  }>
  wind: { speed: number; deg: number }
  clouds: { all: number }
  dt_txt?: string
}