// apps/web/components/aura/auras-list.tsx

'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AuraCard } from '@/components/aura/aura-card'
import { Plus, Brain, Edit3, GitBranch } from 'lucide-react'
import { deleteAuraAction } from '@/app/actions/delete-aura'
import type { Aura } from '@/types'

interface AurasListProps {
  initialAuras: Aura[]
}

export function AurasList({ initialAuras }: AurasListProps) {
  const router = useRouter()

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Auras</h1>
          <p className="text-muted-foreground mt-1">
            Manage and interact with your created personalities
          </p>
        </div>
        <Button onClick={() => router.push('/auras/create')} size="lg">
          <Plus className="w-4 h-4 mr-2" />
          Create New Aura
        </Button>
      </div>

      {initialAuras.length === 0 ? (
        <div className="text-center py-12">
          <Brain className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg mb-4 text-muted-foreground">
            No Auras created yet
          </p>
          <Button onClick={() => router.push('/auras/create')}>
            Create your first Aura
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialAuras.map((aura) => (
            <div key={aura.id} className="relative">
              <AuraCard aura={aura} />

              {/* Delete button */}
              <form
                action={deleteAuraAction}
                className="absolute top-2 right-2"
              >
                <input type="hidden" name="auraId" value={aura.id} />
                <Button type="submit" variant="ghost" size="icon">
                  <span role="img" aria-label="Delete">
                    🗑️
                  </span>
                </Button>
              </form>

              {/* Edit & Rules buttons */}
              <div className="absolute top-2 left-2 flex space-x-1">
                {/* Edit Aura */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push(`/auras/${aura.id}/edit`)}
                  title="Edit Aura"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>

                {/* Go to Rules Dashboard */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    router.push(`/auras/${aura.id}/rules`)
                  }
                  title="View Rules"
                >
                  <GitBranch className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
