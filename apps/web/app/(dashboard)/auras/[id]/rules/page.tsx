// apps/web/app/(dashboard)/auras/[id]/rules/page.tsx
"use client"

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { RulesDashboard } from '@/components/aura/rules-dashboard'
import { useAura } from '@/hooks/use-aura'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { BehaviorRule } from '@/types'

export default function AuraRulesPage() {
  // 1. Normalize the `id` param to a single string (or bail out)
  const params = useParams()
  const rawId = params.id
  const auraId = Array.isArray(rawId) ? rawId[0] : rawId
  if (!auraId) {
    // Could render a spinner or message here instead
    return null
  }

  // 2. Fetch the Aura metadata
  const { aura, loading: auraLoading, error } = useAura(auraId)

  // 3. Fetch its rules
  const [rules, setRules] = useState<BehaviorRule[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRules = async () => {
      if (!aura) return
      const supabase = createClient()
      const { data, error: sbErr } = await supabase
        .from('behavior_rules')
        .select('*')
        .eq('aura_id', auraId)
        .order('priority', { ascending: false })

      if (!sbErr && data) {
        setRules(
          data.map((r) => ({
            id:        r.id,
            name:      r.name,
            trigger:   r.trigger,
            action:    r.action,
            priority:  r.priority ?? 0,
            enabled:   r.enabled,
            createdAt: new Date(r.created_at!),   // assert non-null
            updatedAt: new Date(r.updated_at!),   // assert non-null
          }))
        )
      }
      setLoading(false)
    }

    fetchRules()
  }, [aura, auraId])

  // 4. Loading / error states
  if (auraLoading || loading) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="p-8">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-64" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !aura) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Aura not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 5. Render dashboard with an "Edit" link
  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{aura.name} - Behavior Rules</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage automated responses based on sensor data
          </p>
        </div>
        <Link
        href={`/auras/${encodeURIComponent(auraId)}/edit?tab=rules`}
        className="ml-4"
        >
        <Button variant="outline" size="sm">
            Edit Aura & Rules
        </Button>
        </Link>
      </div>

      <RulesDashboard aura={aura} rules={rules} />
    </div>
  )
}
