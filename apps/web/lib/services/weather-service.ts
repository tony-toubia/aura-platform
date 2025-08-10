// apps/web/lib/services/weather-service.ts

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
   * We look for either:
   *  - NEXT_PUBLIC_OPENWEATHER_API_KEY (client+server)
   *  - OPENWEATHER_API_KEY            (server‐only)
   */
  private static apiKey =
    process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY ??
    process.env.OPENWEATHER_API_KEY

  static async getCurrentWeather(
    lat?: number,
    lon?: number,
    locationConfig?: LocationConfig
  ): Promise<WeatherData | null> {
    if (!this.apiKey) {
      console.error(
        'Missing NEXT_PUBLIC_OPENWEATHER_API_KEY (or OPENWEATHER_API_KEY) in environment'
      )
      return null
    }

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

      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude
        }&appid=${this.apiKey
        }&units=metric`
      )
      if (!res.ok) throw new Error('Weather API request failed')

      const data = await res.json()
      return {
        temperature: Math.round(data.main.temp),
        humidity:    data.main.humidity,
        description: data.weather[0].description,
        feelsLike:   Math.round(data.main.feels_like),
        pressure:    data.main.pressure,
        windSpeed:   data.wind.speed,
        clouds:      data.clouds.all,
        city:        data.name,
        country:     data.sys.country,
      }
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
    if (!this.apiKey) return []
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

      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude
        }&lon=${longitude
        }&appid=${this.apiKey
        }&units=metric&cnt=8`
      )
      if (!res.ok) throw new Error('Forecast API request failed')

      const json = await res.json()
      return json.list as ForecastEntry[]
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
    if (!this.apiKey) return null

    try {
      const res = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=1&appid=${this.apiKey}`
      )
      if (!res.ok) return null
      const data = await res.json()
      if (!data || data.length === 0) return null
      const location = data[0]
      return {
        name: location.name,
        lat: location.lat,
        lon: location.lon,
        country: location.country,
      }
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

  // New method to geocode location names
  static async geocodeLocation(query: string): Promise<{
    name: string
    lat: number
    lon: number
    country: string
  } | null> {
    if (!this.apiKey) return null

    try {
      const res = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=1&appid=${this.apiKey}`
      )
      
      if (!res.ok) return null
      
      const data = await res.json()
      if (!data || data.length === 0) return null
      
      const location = data[0]
      return {
        name: location.name,
        lat: location.lat,
        lon: location.lon,
        country: location.country,
      }
    } catch (error) {
      console.error('Geocoding failed:', error)
      return null
    }
  }
}