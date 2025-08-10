// apps/web/lib/services/config-service.ts

interface AppConfig {
  googleClientId?: string
  microsoftClientId?: string
  stravaClientId?: string
  fitbitClientId?: string
  appleHealthClientId?: string
  supabaseUrl?: string
  supabaseAnonKey?: string
  stripePublishableKey?: string
  appUrl?: string
  openweatherApiKey?: string
}

class ConfigService {
  private static config: AppConfig | null = null
  private static loading: Promise<AppConfig> | null = null

  static async getConfig(): Promise<AppConfig> {
    // If we already have config, return it
    if (this.config) {
      return this.config
    }

    // If we're already loading, wait for that
    if (this.loading) {
      return this.loading
    }

    // Start loading
    this.loading = this.fetchConfig()
    this.config = await this.loading
    this.loading = null

    return this.config
  }

  private static async fetchConfig(): Promise<AppConfig> {
    try {
      const response = await fetch('/api/config')
      if (!response.ok) {
        throw new Error('Failed to fetch config')
      }
      return await response.json()
    } catch (error) {
      console.error('Failed to load app config:', error)
      // Return empty config as fallback
      return {}
    }
  }

  // Convenience methods for specific config values
  static async getGoogleClientId(): Promise<string | undefined> {
    const config = await this.getConfig()
    return config.googleClientId
  }

  static async getMicrosoftClientId(): Promise<string | undefined> {
    const config = await this.getConfig()
    return config.microsoftClientId
  }

  static async getStravaClientId(): Promise<string | undefined> {
    const config = await this.getConfig()
    return config.stravaClientId
  }

  static async getFitbitClientId(): Promise<string | undefined> {
    const config = await this.getConfig()
    return config.fitbitClientId
  }

  static async getAppleHealthClientId(): Promise<string | undefined> {
    const config = await this.getConfig()
    return config.appleHealthClientId
  }

  static async getSupabaseConfig(): Promise<{ url?: string; anonKey?: string }> {
    const config = await this.getConfig()
    return {
      url: config.supabaseUrl,
      anonKey: config.supabaseAnonKey
    }
  }

  static async getStripePublishableKey(): Promise<string | undefined> {
    const config = await this.getConfig()
    return config.stripePublishableKey
  }

  static async getAppUrl(): Promise<string | undefined> {
    const config = await this.getConfig()
    return config.appUrl
  }

  static async getOpenweatherApiKey(): Promise<string | undefined> {
    // First try cached config
    let config = await this.getConfig()
    if (config.openweatherApiKey) return config.openweatherApiKey

    // If missing, try a one-time refresh to avoid stale cache issues
    try {
      this.config = null
      this.loading = null
      config = await this.getConfig()
      return config.openweatherApiKey
    } catch {
      return undefined
    }
  }
}

export { ConfigService, type AppConfig }