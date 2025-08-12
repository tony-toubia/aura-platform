// apps/web/app/api/rule/preview/route.ts

import { NextRequest, NextResponse } from 'next/server'
import type { RulePreviewRequest } from '@/lib/services/rule-preview-service'

export async function POST(request: NextRequest) {
  let body: any = {}
  
  try {
    body = await request.json()
    
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

    let preview: string

    // Check if OpenAI is configured
    const hasOpenAI = !!process.env.OPENAI_API_KEY
    
    if (hasOpenAI) {
      try {
        // Try to use the AI-powered preview with a timeout
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Preview generation timeout')), 4000)
        )
        
        const { generateRulePreview } = await import('@/lib/services/rule-preview-service')
        preview = await Promise.race([
          generateRulePreview(previewRequest),
          timeoutPromise
        ])
      } catch (aiError) {
        console.log('AI preview failed, using static fallback:', aiError)
        // Fall back to static preview
        const { generateRulePreview: staticPreview } = await import('@/lib/rule-preview')
        preview = staticPreview(previewRequest)
      }
    } else {
      // No OpenAI configured, use static preview directly
      console.log('OpenAI not configured, using static preview')
      const { generateRulePreview: staticPreview } = await import('@/lib/rule-preview')
      preview = staticPreview(previewRequest)
    }

    return NextResponse.json({
      preview,
      timestamp: Date.now(),
      method: hasOpenAI ? 'ai' : 'static'
    })

  } catch (error) {
    console.error('Rule preview generation error:', error)
    
    // Last resort: return a generic preview
    try {
      const { generateRulePreview: staticPreview } = await import('@/lib/rule-preview')
      const fallbackPreview = staticPreview({
        guidelines: body.guidelines || 'Respond to the rule trigger',
        tones: body.tones || ['encouraging'],
        sensorConfig: body.sensorConfig || { name: 'sensor', category: 'general' },
        sensorValue: body.sensorValue || 'triggered',
        operator: body.operator || '==',
        vesselType: body.vesselType || 'digital',
        vesselCode: body.vesselCode || '',
        auraName: body.auraName || 'Your Aura'
      })
      
      return NextResponse.json({
        preview: fallbackPreview,
        timestamp: Date.now(),
        method: 'fallback'
      })
    } catch (fallbackError) {
      // Absolute last resort
      return NextResponse.json({
        preview: 'Your assistant will respond based on your guidelines when this rule triggers.',
        timestamp: Date.now(),
        method: 'default'
      })
    }
  }
}

// Optional: Add a GET endpoint for health checks
export async function GET() {
  return NextResponse.json({ 
    status: 'Rule Preview API is running',
    timestamp: new Date().toISOString()
  })
}