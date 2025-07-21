// apps/web/app/(dashboard)/auras/[id]/page.tsx
import React from 'react'
import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server.server'
import { AuraServiceServer } from '@/lib/services/aura-service.server'
import { ChatInterface } from '@/components/aura/chat-interface'

export default async function AuraInteractionPage({
  params,
}: {
  // now params is a Promise
  params: Promise<{ id: string }>
}) {
  // await the params promise
  const { id } = await params

  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const aura = await AuraServiceServer.getAuraById(id)
  if (!aura) {
    return (
      <div className="container py-8">
        <div className="text-center py-12 text-muted-foreground">
          Aura not found
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <ChatInterface aura={aura} />
      </div>
    </div>
  )
}
