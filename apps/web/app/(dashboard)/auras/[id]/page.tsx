// apps/web/app/(dashboard)/auras/[id]/page.tsx
import React from 'react'
import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server.server'
import { AuraServiceServer } from '@/lib/services/aura-service.server'
import { ChatInterface } from '@/components/aura/chat-interface'

export default async function AuraInteractionPage({
  params,
  searchParams,
}: {
  // now params is a Promise
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // await the params promise
  const { id } = await params
  const { conversation: conversationId } = await searchParams

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

  // Check if aura is disabled
  if (!aura.enabled) {
    return (
      <div className="container py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-3xl border-2 border-gray-200 shadow-lg p-8">
            <div className="text-6xl mb-4">{aura.avatar || '✨'}</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{aura.name}</h1>
            <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium mb-6">
              <div className="w-2 h-2 rounded-full bg-gray-400" />
              Inactive
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-amber-600">⚠️</span>
                </div>
                <h3 className="text-lg font-semibold text-amber-800">Aura is Inactive</h3>
              </div>
              <p className="text-amber-700 mb-4">
                This aura has been deactivated and is not available for chat.
                You can reactivate it from your auras list if you have available slots.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="/auras"
                  className="inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  ← Back to Auras
                </a>
                <a
                  href="/subscription"
                  className="inline-flex items-center justify-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                >
                  Upgrade Plan
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="max-w-4xl mx-auto">
        <ChatInterface
          aura={aura}
          conversationId={typeof conversationId === 'string' ? conversationId : undefined}
        />
      </div>
    </div>
  )
}
