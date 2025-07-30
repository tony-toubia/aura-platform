// apps/web/app/api/rule/preview/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { generateRulePreview } from '@/lib/services/rule-preview-service'
import type { RulePreviewRequest } from '@/lib/services/rule-preview-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      guidelines,
      tones,
      sensorConfig,
      sensorValue,
      operator,
      vesselType,
      vesselCode,
      auraName
    } = body

    // Validate required fields
    if (!guidelines || !sensorConfig) {
      return NextResponse.json(
        { error: 'Missing required fields: guidelines and sensorConfig are required' },
        { status: 400 }
      )
    }

    if (!sensorValue && sensorValue !== 0) {
      return NextResponse.json(
        { error: 'Missing required field: sensorValue is required' },
        { status: 400 }
      )
    }

    const previewRequest: RulePreviewRequest = {
      guidelines,
      tones: tones || ['encouraging'],
      sensorConfig,
      sensorValue,
      operator: operator || '==',
      vesselType: vesselType || 'digital',
      vesselCode: vesselCode || '',
      auraName: auraName || 'Your Aura'
    }

    const preview = await generateRulePreview(previewRequest)

    return NextResponse.json({
      preview,
      timestamp: Date.now()
    })

  } catch (error) {
    console.error('Rule preview generation error:', error)
    
    // Return more specific error information in development
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    return NextResponse.json(
      { 
        error: 'Failed to generate rule preview',
        details: isDevelopment && error instanceof Error ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

// Optional: Add a GET endpoint for health checks
export async function GET() {
  return NextResponse.json({ 
    status: 'Rule Preview API is running',
    timestamp: new Date().toISOString()
  })
}