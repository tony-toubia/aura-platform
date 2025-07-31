// apps/web/app/api/aura-agent/process/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { auraAgent } from '@/lib/services/aura-agent-service'
import type { AgentProcessingRequest } from '@/lib/services/aura-agent-service'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as AgentProcessingRequest
    
    // Process the message through the agent
    const response = await auraAgent.processUserMessage(body)
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error processing agent request:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}