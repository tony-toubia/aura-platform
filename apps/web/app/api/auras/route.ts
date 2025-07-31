// apps/web/app/api/auras/route.ts
import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server.server'
import { AuraServiceServer } from '@/lib/services/aura-service.server'

export async function POST(request: Request) {
  try {
    // 1. Parse out the payload (including the wildlife selections)
    const {
      name,
      vesselType,
      personality,
      senses,
      communicationStyle,
      voiceProfile,
      selectedStudyId,
      selectedIndividualId,
      locationConfigs,
    } = await request.json()

    // 2. Initialize Supabase with the HTTP‐only cookie
    const supabase = await createServerSupabase()
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser()

    // 3. Guard: user must be logged in
    if (userErr || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // 4. Delegate to your server‐side service, passing through the new fields
    //    (No need to send userId - the service uses the Supabase session internally.)
    const aura = await AuraServiceServer.createAura({
      name,
      vesselType,
      personality,
      senses,
      communicationStyle,
      voiceProfile,
      selectedStudyId: selectedStudyId ?? null,
      selectedIndividualId: selectedIndividualId ?? null,
      locationConfigs: locationConfigs ?? null,
    })

    // 5. Return the newly created record
    return NextResponse.json(aura, { status: 201 })
  } catch (err: any) {
    console.error('API /auras POST error:', err)
    return NextResponse.json(
      { error: err.message || 'Unexpected server error' },
      { status: 500 }
    )
  }
}
