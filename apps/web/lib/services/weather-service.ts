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
  private static apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
  // simple in-memory cache
  private static _cache: { ts: number; data: WeatherData } | null = null
  private static TTL = 1000 * 60 * 5 // 5 minutes

  static async getCurrentWeather(lat?: number, lon?: number): Promise<WeatherData | null> {
    if (!this.apiKey) {
      console.error('Missing NEXT_PUBLIC_OPENWEATHER_API_KEY in environment')
      return null
    }

    // return cached if still fresh
    if (this._cache && Date.now() - this._cache.ts < this.TTL) {
      return this._cache.data
    }

    try {
      const latitude = lat ?? 39.0997
      const longitude = lon ?? -94.5786

      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather` +
        `?lat=${latitude}&lon=${longitude}` +
        `&appid=${this.apiKey}&units=metric`
      )
      if (!res.ok) throw new Error('Weather API request failed')

      const d = await res.json()
      const output: WeatherData = {
        temperature: Math.round(d.main.temp),
        humidity:    d.main.humidity,
        description: d.weather[0].description,
        feelsLike:   Math.round(d.main.feels_like),
        pressure:    d.main.pressure,
        windSpeed:   d.wind.speed,
        clouds:      d.clouds.all,
        city:        d.name,
        country:     d.sys.country,
      }

      // cache and return
      this._cache = { ts: Date.now(), data: output }
      return output
    } catch (e) {
      console.error('Failed to fetch weather:', e)
      return null
    }
  }

  static async getForecast(lat?: number, lon?: number): Promise<any[]> {
    if (!this.apiKey) return []
    try {
      const latitude  = lat ?? 39.0997
      const longitude = lon ?? -94.5786

      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast` +
        `?lat=${latitude}&lon=${longitude}` +
        `&appid=${this.apiKey}&units=metric&cnt=8`
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
