// apps/web/app/api/behavior-rules/route.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server.server'

export async function POST(req: NextRequest) {
  try {
    const { auraId, name, trigger, action, priority = 0, enabled = true } =
      await req.json()

    if (!auraId || !name || !trigger || !action) {
      return NextResponse.json(
        { error: 'Missing auraId, name, trigger or action' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabase()

    const { data, error } = await supabase
      .from('behavior_rules')
      .insert([
        {
          aura_id: auraId,
          name,
          trigger,
          action,
          priority,
          enabled,
        },
      ])
      .select('*')
      .single()

    if (error) {
      console.error('[POST /api/behavior-rules] insert error', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err: any) {
    console.error('[POST /api/behavior-rules] unexpected error', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
