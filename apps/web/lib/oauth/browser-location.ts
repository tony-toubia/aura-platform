// lib/oauth/browser-location.ts
"use client"

export interface LocationConfig {
  enableTracking: boolean
  accuracy: 'high' | 'balanced' | 'low'
  updateFrequency: 'realtime' | 'periodic' | 'manual'
  shareHistory: boolean
}

export interface LocationData {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: Date
  address?: string
}

export interface LocationPermissionStatus {
  granted: boolean
  denied: boolean
  prompt: boolean
  error?: string
}

export class BrowserLocationService {
  private watchId: number | null = null
  private lastKnownPosition: LocationData | null = null
  private onLocationUpdate?: (location: LocationData) => void

  /**
   * Check if geolocation is supported by the browser
   */
  isSupported(): boolean {
    return 'geolocation' in navigator
  }

  /**
   * Check current permission status
   */
  async checkPermissionStatus(): Promise<LocationPermissionStatus> {
    if (!this.isSupported()) {
      return {
        granted: false,
        denied: true,
        prompt: false,
        error: 'Geolocation not supported by this browser'
      }
    }

    try {
      // Check if permissions API is available
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' })
        return {
          granted: permission.state === 'granted',
          denied: permission.state === 'denied',
          prompt: permission.state === 'prompt'
        }
      }

      // Fallback: try to get position to check permission
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          () => resolve({ granted: true, denied: false, prompt: false }),
          (error) => {
            if (error.code === error.PERMISSION_DENIED) {
              resolve({ granted: false, denied: true, prompt: false })
            } else {
              resolve({ granted: false, denied: false, prompt: true })
            }
          },
          { timeout: 1000 }
        )
      })
    } catch (error) {
      return {
        granted: false,
        denied: false,
        prompt: true,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Request location permission and get current position
   */
  async requestLocationAccess(config: LocationConfig): Promise<LocationData> {
    if (!this.isSupported()) {
      throw new Error('Geolocation is not supported by this browser')
    }

    const options: PositionOptions = {
      enableHighAccuracy: config.accuracy === 'high',
      timeout: config.accuracy === 'high' ? 15000 : 10000,
      maximumAge: config.accuracy === 'low' ? 300000 : 60000 // 5 min for low, 1 min for others
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(position.timestamp)
          }

          // Optionally get address using reverse geocoding
          if (config.enableTracking) {
            try {
              locationData.address = await this.reverseGeocode(
                locationData.latitude,
                locationData.longitude
              )
            } catch (error) {
              console.warn('Failed to get address:', error)
            }
          }

          this.lastKnownPosition = locationData
          resolve(locationData)
        },
        (error) => {
          let errorMessage = 'Failed to get location'
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable'
              break
            case error.TIMEOUT:
              errorMessage = 'Location request timed out'
              break
          }
          
          reject(new Error(errorMessage))
        },
        options
      )
    })
  }

  /**
   * Start continuous location tracking
   */
  startTracking(config: LocationConfig, onUpdate: (location: LocationData) => void): void {
    if (!this.isSupported()) {
      throw new Error('Geolocation is not supported by this browser')
    }

    this.onLocationUpdate = onUpdate
    
    const options: PositionOptions = {
      enableHighAccuracy: config.accuracy === 'high',
      timeout: 10000,
      maximumAge: config.updateFrequency === 'realtime' ? 0 : 60000
    }

    this.watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp)
        }

        // Get address if tracking is enabled
        if (config.enableTracking) {
          try {
            locationData.address = await this.reverseGeocode(
              locationData.latitude,
              locationData.longitude
            )
          } catch (error) {
            console.warn('Failed to get address:', error)
          }
        }

        this.lastKnownPosition = locationData
        onUpdate(locationData)
      },
      (error) => {
        console.error('Location tracking error:', error)
      },
      options
    )
  }

  /**
   * Stop location tracking
   */
  stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId)
      this.watchId = null
    }
    this.onLocationUpdate = undefined
  }

  /**
   * Get the last known position
   */
  getLastKnownPosition(): LocationData | null {
    return this.lastKnownPosition
  }

  /**
   * Simple reverse geocoding using a free service
   * Note: In production, you might want to use a more robust service
   */
  private async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      // Using OpenStreetMap's Nominatim service (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'AuraPlatform/1.0'
          }
        }
      )

      if (!response.ok) {
        throw new Error('Geocoding service unavailable')
      }

      const data = await response.json()
      
      if (data.display_name) {
        return data.display_name
      }

      // Fallback to coordinates
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    } catch (error) {
      console.warn('Reverse geocoding failed:', error)
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    }
  }

  /**
   * Calculate distance between two points in kilometers
   */
  static calculateDistance(
    lat1: number, lng1: number,
    lat2: number, lng2: number
  ): number {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  /**
   * Format location for display
   */
  static formatLocation(location: LocationData): string {
    if (location.address) {
      return location.address
    }
    return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
  }

  /**
   * Get accuracy description
   */
  static getAccuracyDescription(accuracy: number): string {
    if (accuracy <= 10) return 'Very High (±10m)'
    if (accuracy <= 50) return 'High (±50m)'
    if (accuracy <= 100) return 'Good (±100m)'
    if (accuracy <= 500) return 'Fair (±500m)'
    return 'Low (±1km+)'
  }
}