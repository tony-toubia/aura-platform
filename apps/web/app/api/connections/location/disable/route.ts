import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server.server"

export async function POST(request: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    // Get all user's auras that have location sense
    const { data: auras, error: aurasError } = await supabase
      .from('auras')
      .select('id, aura_senses(id, sense:senses(code))')
      .eq('user_id', user.id)

    if (aurasError) {
      console.error('Error fetching auras:', aurasError)
      return NextResponse.json({ error: aurasError.message }, { status: 500 })
    }

    // Find aura_senses entries with location sense
    const locationSenseIds: string[] = []
    auras?.forEach(aura => {
      aura.aura_senses?.forEach((auraSense: any) => {
        if (auraSense.sense?.code === 'location') {
          locationSenseIds.push(auraSense.id)
        }
      })
    })

    if (locationSenseIds.length > 0) {
      // Remove location sense from all auras
      const { error: deleteError } = await supabase
        .from('aura_senses')
        .delete()
        .in('id', locationSenseIds)

      if (deleteError) {
        console.error('Error removing location senses:', deleteError)
        return NextResponse.json({ error: deleteError.message }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      removedCount: locationSenseIds.length
    })
  } catch (error: any) {
    console.error("Unexpected error removing location sense:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}