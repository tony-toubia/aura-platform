// apps/web/components/aura/auras-list.tsx

'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { VESSEL_TYPE_CONFIG } from '@/lib/vessel-config'
import { 
  Plus, 
  Brain, 
  Edit3, 
  GitBranch, 
  Sparkles, 
  Heart,
  Zap,
  Trash2,
  Settings,
  Activity,
  ArrowRight
} from 'lucide-react'
import { deleteAuraAction } from '@/app/actions/delete-aura'
import { cn } from '@/lib/utils'
import type { Aura } from '@/types'

interface AurasListProps {
  initialAuras: Aura[]
}

export function AurasList({ initialAuras }: AurasListProps) {
  const router = useRouter()

  return (
    <div className="max-w-7xl mx-auto">
      {/* Enhanced Header */}
      <div className="mb-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Brain className="w-4 h-4" />
            Aura Collection
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            My Auras
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage and interact with your magical AI personalities
          </p>
        </div>

        {/* Stats Overview */}
        {initialAuras.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-700">{initialAuras.length}</div>
              <div className="text-sm text-purple-600">Total Auras</div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-green-700">
                {initialAuras.filter(a => a.enabled).length}
              </div>
              <div className="text-sm text-green-600">Active</div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-700">
                {initialAuras.reduce((acc, aura) => acc + (aura.senses?.length || 0), 0)}
              </div>
              <div className="text-sm text-blue-600">Total Senses</div>
            </div>
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-amber-700">
                {initialAuras.reduce((acc, aura) => acc + (aura.rules?.length || 0), 0)}
              </div>
              <div className="text-sm text-amber-600">Total Rules</div>
            </div>
          </div>
        )}

        {/* Create Button */}
        <div className="text-center">
          <Button 
            onClick={() => router.push('/auras/create')} 
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-6 text-lg"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Create New Aura
          </Button>
        </div>
      </div>

      {/* Content */}
      {initialAuras.length === 0 ? (
        <EmptyState
          icon={Brain}
          iconGradient="from-purple-500 to-blue-500"
          title="Ready to Create Magic?"
          description="You haven't created any Auras yet. Start your journey by bringing your first AI personality to life!"
          primaryAction={{
            label: "Create Your First Aura",
            onClick: () => router.push('/auras/create'),
            icon: Sparkles
          }}
          secondaryText="✨ Start with a digital being or connect a physical vessel"
        >
          {/* Feature Preview */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            {Object.entries(VESSEL_TYPE_CONFIG).slice(0, 3).map(([key, config]) => (
              <div key={key} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className={cn(
                  "w-8 h-8 bg-gradient-to-r rounded-lg flex items-center justify-center mb-3",
                  config.color
                )}>
                  <span className="text-white text-lg">{config.icon}</span>
                </div>
                <h4 className="font-semibold mb-1">{config.name}</h4>
                <p className="text-sm text-gray-600">{config.description}</p>
              </div>
            ))}
          </div>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {initialAuras.map((aura) => {
            const config = VESSEL_TYPE_CONFIG[aura.vesselType]
            
            return (
              <div 
                key={aura.id} 
                className="group relative bg-white rounded-3xl border-2 border-gray-200 hover:border-purple-300 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                {/* Enhanced Aura Card */}
                <div className={cn(
                  "relative p-6 bg-gradient-to-br",
                  config?.bgColor || "from-gray-50 to-gray-100"
                )}>
                  {/* Vessel Type Badge */}
                  <div className="absolute top-4 right-4">
                    <div className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r text-white shadow-md",
                      config?.color || "from-gray-500 to-gray-600"
                    )}>
                      {config?.icon} {config?.name || aura.vesselType}
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="absolute top-4 left-4">
                    <div className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                      aura.enabled 
                        ? "bg-green-100 text-green-700" 
                        : "bg-gray-100 text-gray-600"
                    )}>
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        aura.enabled ? "bg-green-500 animate-pulse" : "bg-gray-400"
                      )} />
                      {aura.enabled ? "Active" : "Inactive"}
                    </div>
                  </div>

                  {/* Avatar & Name */}
                  <div className="text-center pt-8 pb-4">
                    <div className="text-6xl mb-4 bg-white/70 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-md">
                      {aura.avatar || config?.icon || '✨'}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{aura.name}</h3>
                    <p className="text-sm text-gray-600">
                      {aura.senses?.length || 0} senses • {aura.rules?.length || 0} rules
                    </p>
                  </div>

                  {/* Senses Preview */}
                  <div className="mb-4 min-h-[60px] flex items-center justify-center px-2">
                    {aura.senses && aura.senses.length > 0 ? (
                      <div className="flex flex-wrap gap-1 justify-center">
                        {aura.senses.slice(0, 4).map((sense, idx) => (
                          <span 
                            key={idx}
                            className="text-xs bg-white/70 text-gray-700 px-2 py-1 rounded-full"
                          >
                            {sense.replace(/_/g, ' ')}
                          </span>
                        ))}
                        {aura.senses.length > 4 && (
                          <span className="text-xs bg-white/70 text-gray-700 px-2 py-1 rounded-full">
                            +{aura.senses.length - 4} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-xs text-gray-500">
                        <p className="mb-2">No senses added yet.</p>
                        <Link href={`/auras/${aura.id}/edit`} className="inline-flex items-center gap-1 text-purple-600 hover:underline font-semibold">
                          <Plus className="w-3 h-3" />
                          Add Senses
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={() => router.push(`/auras/${aura.id}`)}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md flex-1"
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Chat
                    </Button>
                  </div>
                </div>

                {/* Management Controls */}
                <div className="bg-white border-t border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      Last active: {new Date(aura.updatedAt).toLocaleDateString()}
                    </span>
                    
                    <div className="flex items-center gap-1">
                      {/* Edit Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/auras/${aura.id}/edit`)}
                        className="hover:bg-purple-50 hover:text-purple-600"
                        title="Edit Aura"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>

                      {/* Rules Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/auras/${aura.id}/rules`)}
                        className="hover:bg-blue-50 hover:text-blue-600"
                        title="Manage Rules"
                      >
                        <GitBranch className="w-4 h-4" />
                      </Button>

                      {/* Settings Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/auras/${aura.id}/edit`)}
                        className="hover:bg-gray-50 hover:text-gray-600"
                        title="Settings"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>

                      {/* Delete Button */}
                      <form action={deleteAuraAction} className="inline">
                        <input type="hidden" name="auraId" value={aura.id} />
                        <Button 
                          type="submit" 
                          variant="ghost" 
                          size="sm"
                          className="hover:bg-red-50 hover:text-red-600"
                          title="Delete Aura"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            )
          })}
        </div>
      )}

      {/* Quick Actions Footer */}
      {initialAuras.length > 0 && (
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Ready to expand your collection?
            </h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => router.push('/auras/create')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Another Aura
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/vessels')}
                className="border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50"
              >
                <Zap className="w-4 h-4 mr-2" />
                Browse Vessels
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}