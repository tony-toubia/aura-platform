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
    lon?: number
  ): Promise<WeatherData | null> {
    if (!this.apiKey) {
      console.error(
        'Missing NEXT_PUBLIC_OPENWEATHER_API_KEY (or OPENWEATHER_API_KEY) in environment'
      )
      return null
    }

    try {
      const latitude = lat  ?? 39.0997
      const longitude = lon ?? -94.5786

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

  static async getForecast(lat?: number, lon?: number): Promise<any[]> {
    if (!this.apiKey) return []
    try {
      const latitude  = lat  ?? 39.0997
      const longitude = lon ?? -94.5786

      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude
        }&lon=${longitude
        }&appid=${this.apiKey
        }&units=metric&cnt=8`
      )
      if (!res.ok) throw new Error('Forecast API request failed')

      const json = await res.json()
      return json.list
    } catch (e) {
      console.error('Failed to fetch forecast:', e)
      return []
    }
  }
}
