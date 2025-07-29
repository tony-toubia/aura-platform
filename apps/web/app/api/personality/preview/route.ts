// apps/web/app/api/personality/preview/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { generatePersonalityPreview } from '@/lib/services/personality-preview-service'
import type { PreviewRequest } from '@/lib/services/personality-preview-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.personality) {
      return NextResponse.json(
        { error: 'Personality data is required' }, 
        { status: 400 }
      )
    }
    
    if (!body.vesselType) {
      return NextResponse.json(
        { error: 'Vessel type is required' }, 
        { status: 400 }
      )
    }
    
    const previewRequest: PreviewRequest = {
      personality: body.personality,
      vesselType: body.vesselType,
      vesselCode: body.vesselCode || '',
      auraName: body.auraName || 'Your Aura'
    }
    
    const preview = await generatePersonalityPreview(previewRequest)
    
    return NextResponse.json({ 
      preview,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Personality preview error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate personality preview',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}

// Optional: Add a GET endpoint for health checks
export async function GET() {
  return NextResponse.json({ 
    status: 'Personality Preview API is running',
    timestamp: new Date().toISOString()
  })
}