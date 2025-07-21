// apps/web/hooks/use-aura.ts
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Aura } from '@/types'

export function useAura(auraId: string) {
  const [aura, setAura] = useState<Aura | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchAura() {
      try {
        const { data, error } = await createClient()
          .from('auras')
          .select(`
            *,
            aura_senses (
              sense:senses ( code )
            )
          `)
          .eq('id', auraId)
          .single()

        if (error || !data) {
          setError(error ?? new Error('Aura not found'))
          return
        }

        setAura({
          id: data.id,
          name: data.name,
          vesselType: data.vessel_type as Aura['vesselType'],
          personality: data.personality,
          senses: data.aura_senses?.map((as: any) => as.sense.code) || [],
          selectedStudyId: data.selected_study_id,
          selectedIndividualId: data.selected_individual_id,
          avatar: data.avatar,
          rules: [], // if you load rules separately
          enabled: data.enabled,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        })
      } catch (err: any) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAura()
  }, [auraId])

  return { aura, loading, error }
}