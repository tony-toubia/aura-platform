// app/api/debug/test-sense-data/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server.server'
import { WeatherService } from '@/lib/services/weather-service'
import { SENSOR_CONFIGS } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { senseId, auraId } = await request.json()
    
    if (!senseId) {
      return NextResponse.json({ error: 'senseId is required' }, { status: 400 })
    }

    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log(`[TEST-SENSE-DATA] Testing sense: ${senseId} for aura: ${auraId || 'all'}`)

    let result: any = {
      senseId,
      timestamp: new Date().toISOString(),
      status: 'success'
    }

    try {
      // Get sensor configuration
      const sensorConfig = SENSOR_CONFIGS[senseId]
      if (!sensorConfig) {
        result.status = 'warning'
        result.message = 'Sensor configuration not found in SENSOR_CONFIGS'
        result.data = { senseId, configExists: false }
        return NextResponse.json(result)
      }

      // Get aura configuration if auraId provided
      let auraConfig = null
      if (auraId) {
        const { data: aura } = await supabase
          .from('auras')
          .select('*')
          .eq('id', auraId)
          .eq('user_id', user.id)
          .single()

        if (!aura) {
          return NextResponse.json({ error: 'Aura not found' }, { status: 404 })
        }
        auraConfig = aura
      }

      // Test different sensor types
      const baseSenseId = senseId ? senseId.split('.')[0] : ''

      switch (baseSenseId) {
        case 'weather':
          result.data = await testWeatherSense(senseId, auraConfig, supabase)
          break
        case 'air_quality':
          result.data = await testAirQualitySense(senseId, auraConfig, supabase)
          break
        case 'news':
          result.data = await testNewsSense(senseId, auraConfig, supabase)
          break
        case 'fitness':
          result.data = await testFitnessSense(senseId, auraConfig, supabase, user.id)
          break
        case 'sleep':
          result.data = await testSleepSense(senseId, auraConfig, supabase, user.id)
          break
        case 'calendar':
          result.data = await testCalendarSense(senseId, auraConfig, supabase, user.id)
          break
        case 'location':
          result.data = await testLocationSense(senseId, auraConfig, supabase, user.id)
          break
        case 'soil_moisture':
          result.data = await testSoilMoistureSense(senseId)
          break
        default:
          // Generic sensor data generation
          result.data = generateTestSensorData(senseId, sensorConfig)
      }

      // Add sensor metadata
      result.sensorConfig = {
        id: sensorConfig.id,
        name: sensorConfig.name,
        type: sensorConfig.type,
        category: sensorConfig.category,
        unit: sensorConfig.unit,
        range: sensorConfig.range,
        operators: sensorConfig.operators
      }

    } catch (error) {
      result.status = 'error'
      result.error = error instanceof Error ? error.message : 'Unknown error'
      result.details = error instanceof Error ? error.stack : undefined
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('[TEST-SENSE-DATA] Error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    }, { status: 500 })
  }
}

async function testWeatherSense(senseId: string, auraConfig: any, supabase: any) {
  const weatherField = senseId ? senseId.split('.')[1] : 'temperature' // temperature, conditions, humidity, etc.
  
  // Try to get location from aura configuration
  let lat = 39.0997 // Default Kansas City
  let lon = -94.5786
  let locationSource = 'default'

  if (auraConfig?.location_configs?.weather) {
    const weatherConfig = auraConfig.location_configs.weather
    if (weatherConfig.location?.lat && weatherConfig.location?.lon) {
      lat = weatherConfig.location.lat
      lon = weatherConfig.location.lon
      locationSource = 'aura_config'
    }
  }

  try {
    const weatherData = await WeatherService.getCurrentWeather(lat, lon)
    
    if (!weatherData) {
      return {
        error: 'Failed to fetch weather data',
        location: { lat, lon, source: locationSource }
      }
    }

    let fieldValue
    switch (weatherField) {
      case 'temperature':
        fieldValue = weatherData.temperature
        break
      case 'conditions':
        fieldValue = weatherData.description
        break
      case 'humidity':
        fieldValue = weatherData.humidity
        break
      case 'pressure':
        fieldValue = weatherData.pressure
        break
      default:
        fieldValue = weatherData
    }

    return {
      field: weatherField,
      value: fieldValue,
      fullWeatherData: weatherData,
      location: { lat, lon, source: locationSource, city: weatherData.city },
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    return {
      error: `Weather API error: ${error}`,
      location: { lat, lon, source: locationSource }
    }
  }
}

async function testAirQualitySense(senseId: string, auraConfig: any, supabase: any) {
  const field = senseId ? senseId.split('.')[1] : 'aqi' // aqi, pm25, etc.
  
  // Mock air quality data for now (would integrate with real API)
  const mockData = {
    aqi: Math.floor(Math.random() * 200) + 50,
    pm25: Math.floor(Math.random() * 100) + 10,
    pm10: Math.floor(Math.random() * 150) + 20,
    o3: Math.floor(Math.random() * 200) + 50,
    no2: Math.floor(Math.random() * 100) + 10,
    so2: Math.floor(Math.random() * 50) + 5,
    co: Math.floor(Math.random() * 1000) + 100
  }

  return {
    field,
    value: mockData[field as keyof typeof mockData] || mockData.aqi,
    fullData: mockData,
    source: 'mock_api',
    location: auraConfig?.weather_air_quality_configurations?.air_quality || 'default',
    timestamp: new Date().toISOString()
  }
}

async function testNewsSense(senseId: string, auraConfig: any, supabase: any) {
  // Mock news data
  const mockNews = [
    'Breaking: Tech Innovation Drives Market Growth',
    'Climate Change: New Initiatives Announced',
    'Local Community: Residents Unite for Clean-up Event',
    'Economy: Positive Growth in Q4 Results',
    'Health: New Study Shows Benefits of Regular Exercise'
  ]

  const newsConfig = auraConfig?.news_configurations?.news || []
  
  return {
    headlines: mockNews.slice(0, 3),
    totalAvailable: mockNews.length,
    configuration: newsConfig,
    locations: newsConfig.map((loc: any) => loc.name || 'Unknown'),
    source: 'mock_api',
    timestamp: new Date().toISOString()
  }
}

async function testFitnessSense(senseId: string, auraConfig: any, supabase: any, userId: string) {
  const field = senseId ? senseId.split('.')[1] : 'steps' // steps, heartRate, calories, etc.
  
  // Check for OAuth connections
  const { data: oauthConnections } = await supabase
    .from('oauth_connections')
    .select('*')
    .eq('user_id', userId)
    .or('provider_type.eq.fitness,provider_id.eq.google-fit,provider_id.eq.fitbit,provider_id.eq.strava')

  const mockFitnessData = {
    steps: Math.floor(Math.random() * 8000) + 2000,
    heartRate: Math.floor(Math.random() * 50) + 65,
    calories: Math.floor(Math.random() * 800) + 1200,
    distance: Math.floor(Math.random() * 10) + 2,
    activity: ['walking', 'running', 'cycling', 'workout', 'sedentary'][Math.floor(Math.random() * 5)]
  }

  return {
    field,
    value: mockFitnessData[field as keyof typeof mockFitnessData] || mockFitnessData.steps,
    fullData: mockFitnessData,
    oauthConnections: oauthConnections?.length || 0,
    connectedProviders: oauthConnections?.map(c => c.provider_id) || [],
    source: oauthConnections?.length ? 'oauth_connected' : 'mock_data',
    timestamp: new Date().toISOString()
  }
}

async function testSleepSense(senseId: string, auraConfig: any, supabase: any, userId: string) {
  const field = senseId ? senseId.split('.')[1] : 'duration' // duration, quality, stage, etc.
  
  const { data: oauthConnections } = await supabase
    .from('oauth_connections')
    .select('*')
    .eq('user_id', userId)
    .or('provider_type.eq.sleep,provider_id.eq.fitbit,provider_id.eq.apple-health')

  const mockSleepData = {
    duration: Math.floor(Math.random() * 3) + 6,
    quality: ['poor', 'fair', 'good', 'excellent'][Math.floor(Math.random() * 4)],
    stage: ['light', 'deep', 'rem', 'awake'][Math.floor(Math.random() * 4)],
    bedtime: '23:' + Math.floor(Math.random() * 60).toString().padStart(2, '0'),
    wakeTime: '0' + (6 + Math.floor(Math.random() * 3)) + ':' + Math.floor(Math.random() * 60).toString().padStart(2, '0')
  }

  return {
    field,
    value: mockSleepData[field as keyof typeof mockSleepData] || mockSleepData.duration,
    fullData: mockSleepData,
    oauthConnections: oauthConnections?.length || 0,
    connectedProviders: oauthConnections?.map(c => c.provider_id) || [],
    source: oauthConnections?.length ? 'oauth_connected' : 'mock_data',
    timestamp: new Date().toISOString()
  }
}

async function testCalendarSense(senseId: string, auraConfig: any, supabase: any, userId: string) {
  const field = senseId ? senseId.split('.')[1] : 'nextEvent'
  
  const { data: oauthConnections } = await supabase
    .from('oauth_connections')
    .select('*')
    .eq('user_id', userId)
    .or('provider_type.eq.calendar,provider_id.eq.google,provider_id.eq.microsoft')

  const mockCalendarData = {
    nextEvent: ['Meeting with team', 'Doctor appointment', 'Lunch with friend', 'Project review', 'Personal time'][Math.floor(Math.random() * 5)],
    timeUntilNext: Math.floor(Math.random() * 240) + 15, // 15 to 255 minutes
    eventType: ['meeting', 'appointment', 'personal', 'reminder', 'break'][Math.floor(Math.random() * 5)]
  }

  return {
    field,
    value: mockCalendarData[field as keyof typeof mockCalendarData] || mockCalendarData.nextEvent,
    fullData: mockCalendarData,
    oauthConnections: oauthConnections?.length || 0,
    connectedProviders: oauthConnections?.map(c => c.provider_id) || [],
    source: oauthConnections?.length ? 'oauth_connected' : 'mock_data',
    timestamp: new Date().toISOString()
  }
}

async function testLocationSense(senseId: string, auraConfig: any, supabase: any, userId: string) {
  const field = senseId ? senseId.split('.')[1] : 'place'
  
  const { data: oauthConnections } = await supabase
    .from('oauth_connections')
    .select('*')
    .eq('user_id', userId)
    .or('provider_type.eq.location,provider_id.eq.google')

  const mockLocationData = {
    place: ['home', 'work', 'gym', 'outdoors', 'transit', 'other'][Math.floor(Math.random() * 6)],
    city: ['San Francisco', 'New York', 'Austin', 'Seattle', 'Los Angeles'][Math.floor(Math.random() * 5)],
    movement: ['stationary', 'walking', 'driving', 'transit'][Math.floor(Math.random() * 4)]
  }

  return {
    field,
    value: mockLocationData[field as keyof typeof mockLocationData] || mockLocationData.place,
    fullData: mockLocationData,
    oauthConnections: oauthConnections?.length || 0,
    connectedProviders: oauthConnections?.map(c => c.provider_id) || [],
    source: oauthConnections?.length ? 'oauth_connected' : 'mock_data',
    timestamp: new Date().toISOString()
  }
}

async function testSoilMoistureSense(senseId: string) {
  const field = (senseId ? senseId.split('.')[1] : null) || 'value'
  
  const moistureValue = Math.floor(Math.random() * 70) + 20 // 20-90%
  
  return {
    field,
    value: moistureValue,
    unit: '%',
    status: moistureValue < 30 ? 'low' : moistureValue > 70 ? 'high' : 'normal',
    source: 'hardware_sensor',
    timestamp: new Date().toISOString()
  }
}

function generateTestSensorData(senseId: string, config: any): any {
  if (!config) {
    return {
      error: 'No sensor configuration found',
      senseId
    }
  }

  let value
  switch (config.type) {
    case 'numeric':
      const range = config.range || { min: 0, max: 100 }
      value = Math.floor(Math.random() * (range.max - range.min) + range.min)
      break
    case 'boolean':
      value = Math.random() > 0.5
      break
    case 'enum':
      const enumValues = config.enumValues || [{ value: 'unknown', label: 'Unknown' }]
      value = enumValues[Math.floor(Math.random() * enumValues.length)].value
      break
    case 'text':
      value = `Sample ${config.name.toLowerCase()} data`
      break
    case 'time':
      value = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
      break
    case 'duration':
      value = Math.floor(Math.random() * 12) + 1 // 1-12 hours
      break
    default:
      value = { type: config.type, generated: true }
  }

  return {
    field: (senseId ? senseId.split('.')[1] : null) || 'value',
    value,
    unit: config.unit,
    type: config.type,
    range: config.range,
    source: 'generated',
    timestamp: new Date().toISOString()
  }
}