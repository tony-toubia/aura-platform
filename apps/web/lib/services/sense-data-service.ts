// apps/web/lib/services/sense-data-service.ts
import { WeatherService } from './weather-service'

export interface SenseData {
  senseId:  string
  data:      unknown
  timestamp: Date
  metadata?: {
    unit?:       string
    confidence?: number
    source?:     string
  }
}

export class SenseDataService {
  /**
   * Fetch data for each sense ID in parallel.
   */
  static async getSenseData(senseIds: string[]): Promise<SenseData[]> {
    const tasks = senseIds.map((rawId) =>
      this.fetchSenseData(this.normalizeId(rawId))
        .catch((err) => {
          console.error(`Error loading sense "${rawId}":`, err)
          return null
        })
    )
    const results = await Promise.all(tasks)
    return results.filter((r): r is SenseData => r !== null)
  }

  /**
   * Normalize both camelCase and snake_case to our switch keys
   */
  private static normalizeId(id: string): string {
    switch (id) {
      case 'soilMoisture':
        return 'soil_moisture'
      case 'lightLevel':
        return 'light_level'
      default:
        return id
    }
  }

  private static async fetchSenseData(id: string): Promise<SenseData | null> {
    switch (id) {
      case 'weather':
        return this.getWeatherData()

      case 'news':
        return this.getNewsData()

      case 'soil_moisture':
        return this.getMockSensorData('soil_moisture', 45, '%')

      case 'light_level':
        return this.getMockSensorData('light_level', 750, 'lux')

      case 'air_quality':
        return this.getAirQualityData()

      default:
        return null
    }
  }

  private static async getWeatherData(): Promise<SenseData | null> {
    const weather = await WeatherService.getCurrentWeather()
    if (!weather) return null

    return {
      senseId:  'weather',
      data:      weather,
      timestamp: new Date(),
      metadata: {
        source:     'openweathermap',
        unit:       '°C',
        confidence: 0.9,
      },
    }
  }

  private static async getNewsData(): Promise<SenseData | null> {
    try {
      let articles: Array<{ title: string; url: string }>

      if (typeof window === 'undefined') {
        // SERVER: call NewsService directly (no HTTP, no URL errors)
        const { NewsService } = await import('./news-service')
        articles = await NewsService.getTopHeadlines()
      } else {
        // BROWSER: fetch your internal API
        const res = await fetch('/api/news')
        if (!res.ok) {
          console.error('Failed to fetch /api/news:', await res.text())
          return null
        }
        articles = await res.json()
      }

      // Take first 3 headlines
      const headlines = articles.slice(0, 3).map((a) => a.title)

      return {
        senseId:  'news',
        data: {
          headlines,
          articles,
        },
        timestamp: new Date(),
        metadata: {
          source:     'newsapi',
          confidence: 0.9,
        },
      }
    } catch (err) {
      console.error('Failed to fetch news:', err)
      return null
    }
  }

  private static async getAirQualityData(): Promise<SenseData> {
    return {
      senseId:  'air_quality',
      data: {
        aqi:           42,
        status:        'Good',
        mainPollutant: 'pm2.5',
      },
      timestamp: new Date(),
      metadata: {
        source:     'mock',
        unit:       'AQI US',
        confidence: 0.8,
      },
    }
  }

  private static getMockSensorData(
    senseId:   string,
    baseValue: number,
    unit:      string
  ): SenseData {
    const variance = baseValue * 0.1
    const value    = Math.round(baseValue + (Math.random() - 0.5) * variance)
    return {
      senseId,
      data: {
        value,
        status: this.getSensorStatus(senseId, value),
      },
      timestamp: new Date(),
      metadata: {
        source:     'mock_sensor',
        unit,
        confidence: 0.9,
      },
    }
  }

  private static getSensorStatus(senseId: string, value: number): string {
    if (senseId === 'soil_moisture') {
      if (value < 20) return 'dry'
      if (value < 40) return 'low'
      if (value < 60) return 'optimal'
      if (value < 80) return 'moist'
      return 'wet'
    }
    if (senseId === 'light_level') {
      if (value < 200)   return 'dark'
      if (value < 400)   return 'dim'
      if (value < 800)   return 'moderate'
      if (value < 1500)  return 'bright'
      return 'very bright'
    }
    return 'normal'
  }
}
