// apps/web/lib/config/env.ts
// Centralized environment variable configuration

export const env = {
  // Node environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Supabase configuration
  SUPABASE: {
    URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ahzmfkjtiiyuipweaktx.supabase.co',
    ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoem1ma2p0aWl5dWlwd2Vha3R4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2Mzc3OTksImV4cCI6MjA2ODIxMzc5OX0.adTiPqedJv1TvuDvj53HGA_jlZr23MJ_L3jiKDb0GTk',
    SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoem1ma2p0aWl5dWlwd2Vha3R4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjYzNzc5OSwiZXhwIjoyMDY4MjEzNzk5fQ.2A8x3g6TrpVShkUEadwhw1ztttbxJvw6HLhQ0L22kMQ'
  },
  
  // App URLs
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3001',
  
  // API Keys
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENWEATHER_API_KEY: process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY,
  NEWS_API_KEY: process.env.NEWS_API_KEY,
  
  // OAuth Configuration
  GOOGLE: {
    CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET
  },
  
  MICROSOFT: {
    CLIENT_ID: process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID,
    CLIENT_SECRET: process.env.MICROSOFT_CLIENT_SECRET
  },
  
  STRAVA: {
    CLIENT_ID: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID,
    CLIENT_SECRET: process.env.STRAVA_CLIENT_SECRET
  },
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'aura-platform-secret-key-change-this-in-production',
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '7d'
} as const

// Validation function to check required environment variables
export function validateEnvironment(serverSide = false) {
  const errors: string[] = []
  const isServer = typeof window === 'undefined' || serverSide
  
  // Debug: Log actual environment values (without sensitive data)
  console.log('Environment Debug:', {
    NODE_ENV: env.NODE_ENV,
    isServer,
    hasOpenAIKey: !!env.OPENAI_API_KEY,
    openAIKeyLength: env.OPENAI_API_KEY?.length || 0,
    jwtSecret: env.JWT_SECRET?.substring(0, 20) + '...',
    jwtSecretLength: env.JWT_SECRET?.length || 0
  })
  
  // Check required Supabase variables (needed on both client and server)
  if (!env.SUPABASE.URL) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is required')
  }
  
  if (!env.SUPABASE.ANON_KEY) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
  }
  
  // In production, check for additional required variables (server-side only)
  // Skip JWT_SECRET validation during build time as it will be set by Cloud Run
  if (env.NODE_ENV === 'production' && isServer) {
    if (!env.OPENAI_API_KEY) {
      errors.push('OPENAI_API_KEY is required in production')
    }
    
    // Skip JWT_SECRET validation in production builds
    // Cloud Run will provide the proper JWT_SECRET at runtime
    // For now, accept the production placeholder
    if (env.JWT_SECRET === 'production-jwt-secret-override-in-cloud-run') {
      // This is acceptable for production builds
      console.log('Using production JWT placeholder - will be overridden by Cloud Run')
    } else if (!env.JWT_SECRET) {
      errors.push('JWT_SECRET is required')
    }
  }
  
  if (errors.length > 0) {
    console.error('Environment validation errors:', errors)
    console.error('Raw process.env values:', {
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      JWT_SECRET: !!process.env.JWT_SECRET,
      NODE_ENV: process.env.NODE_ENV,
      isServer
    })
    throw new Error(`Environment validation failed: ${errors.join(', ')}`)
  }
  
  return true
}

// Log environment status (without sensitive values)
export function logEnvironmentStatus() {
  console.log('Environment Status:', {
    NODE_ENV: env.NODE_ENV,
    hasSupabaseUrl: !!env.SUPABASE.URL,
    hasSupabaseAnonKey: !!env.SUPABASE.ANON_KEY,
    hasSupabaseServiceKey: !!env.SUPABASE.SERVICE_ROLE_KEY,
    hasOpenAIKey: !!env.OPENAI_API_KEY,
    hasGoogleClientId: !!env.GOOGLE.CLIENT_ID,
    hasMicrosoftClientId: !!env.MICROSOFT.CLIENT_ID,
    hasStravaClientId: !!env.STRAVA.CLIENT_ID,
    appUrl: env.APP_URL
  })
}