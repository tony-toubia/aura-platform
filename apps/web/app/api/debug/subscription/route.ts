// app/api/debug/subscription/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server.server'
import { SubscriptionService } from '@/lib/services/subscription-service'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ 
        error: 'Unauthorized - please log in',
        details: 'User authentication required'
      }, { status: 401 })
    }

    console.log(`[DEBUG-SUBSCRIPTION] Debugging subscription for user: ${user.id}`)

    // Get comprehensive subscription debug info
    const debugInfo = await SubscriptionService.debugUserSubscription(user.id, supabase)

    // Check specific sense access
    const testSenses = ['fitness', 'sleep', 'calendar', 'location'] as const
    const senseAccess: Record<string, boolean> = {}
    
    for (const sense of testSenses) {
      senseAccess[sense] = await SubscriptionService.canUseSense(user.id, sense)
    }

    // Check hasPersonalConnectedSenses specifically
    const hasPersonalAccess = await SubscriptionService.checkFeatureAccess(
      user.id, 
      'hasPersonalConnectedSenses', 
      supabase
    )

    return NextResponse.json({
      success: true,
      userId: user.id,
      userEmail: user.email,
      debug: debugInfo,
      senseAccess,
      hasPersonalConnectedSenses: hasPersonalAccess,
      timestamp: new Date().toISOString(),
      recommendations: generateRecommendations(debugInfo, hasPersonalAccess, senseAccess)
    })

  } catch (error) {
    console.error('[DEBUG-SUBSCRIPTION] Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

function generateRecommendations(debugInfo: any, hasPersonalAccess: boolean, senseAccess: Record<string, boolean>) {
  const recommendations = []
  
  if (debugInfo.database.error) {
    recommendations.push({
      type: 'error',
      message: 'Database error detected when fetching subscription',
      action: 'Check database connectivity and Supabase status'
    })
  }
  
  if (!debugInfo.database.row && !debugInfo.database.error) {
    recommendations.push({
      type: 'warning', 
      message: 'No subscription record found in database',
      action: 'Create a subscription record or check if user completed signup'
    })
  }
  
  if (debugInfo.service.id === 'free' && debugInfo.database.row?.tier !== 'free') {
    recommendations.push({
      type: 'error',
      message: 'Service tier mismatch - database shows different tier than service',
      action: 'Clear subscription cache and retry'
    })
  }
  
  if (!hasPersonalAccess) {
    recommendations.push({
      type: 'warning',
      message: 'Personal connected senses access denied',
      action: 'Check subscription tier and upgrade if needed'
    })
  }
  
  const blockedSenses = Object.entries(senseAccess).filter(([sense, access]) => !access)
  if (blockedSenses.length > 0) {
    recommendations.push({
      type: 'info',
      message: `Blocked senses: ${blockedSenses.map(([sense]) => sense).join(', ')}`,
      action: 'These senses require a higher subscription tier'
    })
  }
  
  if (debugInfo.cached && !debugInfo.database.error) {
    const cacheAge = Date.now() - debugInfo.cached.timestamp
    if (cacheAge > 5 * 60 * 1000) {
      recommendations.push({
        type: 'info',
        message: 'Subscription cache is stale',
        action: 'Cache will refresh automatically or can be cleared manually'
      })
    }
  }
  
  return recommendations
}