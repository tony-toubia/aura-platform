// apps/web/app/api/config/route.ts
import { NextResponse } from 'next/server'

// Ensure this route is always dynamic (no static caching)
export const dynamic = 'force-dynamic'

export async function GET() {
  const config = {
    googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    microsoftClientId: process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID,
    stravaClientId: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID,
    fitbitClientId: process.env.NEXT_PUBLIC_FITBIT_CLIENT_ID,
    appleHealthClientId: process.env.NEXT_PUBLIC_APPLE_HEALTH_CLIENT_ID,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
  };

  return NextResponse.json(config)
}