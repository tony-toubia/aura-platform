// apps/web/components/aura/rule-builder/enhanced-rule-builder.tsx

"use client"

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Sparkles,
  Settings,
  Library,
  Zap,
  Plus,
  ArrowLeft,
  Eye,
  BarChart3,
  Lightbulb,
  Target
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { RuleBuilder } from '@/components/aura/rule-builder'
import { VisualRuleBuilder } from './visual-rule-builder'
import { RuleTemplateLibrary } from './rule-template-library'
import type { BehaviorRule } from '@/types'
import type { RuleBuilderProps } from '@/types/rules'

interface EnhancedRuleBuilderProps extends RuleBuilderProps {
  showVisualBuilder?: boolean
  showTemplateLibrary?: boolean
}

export function EnhancedRuleBuilder({
  auraId,
  vesselType,
  vesselCode,
  availableSenses,
  existingRules = [],
  editingRule = null,
  onEditRule,
  onSaveEditedRule,
  onAddRule,
  onDeleteRule,
  onToggleRule,
  showVisualBuilder = true,
  showTemplateLibrary = true
}: EnhancedRuleBuilderProps) {
  const [activeTab, setActiveTab] = useState<'builder' | 'visual' | 'templates'>('builder')
  const [showTemplateModal, setShowTemplateModal] = useState(false)

  const handleRuleUpdate = useCallback((updatedRules: BehaviorRule[]) => {
    // This would typically sync with the parent component
    // For now, we'll handle individual rule operations
    console.log('Rules updated:', updatedRules)
  }, [])

  const handleApplyTemplate = useCallback((template: any) => {
    // Convert template to rule format and apply
    const newRule = {
      auraId,
      name: template.name,
      trigger: {
        type: "simple" as const,
        sensor: template.sensor,
        operator: template.operator,
        value: template.value,
        cooldown: template.cooldown
      },
      action: {
        type: template.responseType === 'prompt' ? "prompt_respond" : "respond" as const,
        message: template.message,
        promptGuidelines: template.promptGuidelines,
        responseTones: template.responseTones,
        responseType: template.responseType,
        severity: "info" as const,
      },
      priority: template.priority,
      enabled: true,
    }

    // Apply the template by calling the form's apply function
    // This would integrate with the existing RuleBuilder component
    setShowTemplateModal(false)
    setActiveTab('builder')
  }, [auraId])

  const getTabStats = () => {
    const activeRules = existingRules.filter(r => r.enabled).length
    const totalRules = existingRules.length
    const highPriorityRules = existingRules.filter(r => (r.priority || 5) >= 8).length

    return { activeRules, totalRules, highPriorityRules }
  }

  const stats = getTabStats()

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 rounded-lg p-6 border border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Zap className="w-7 h-7 text-purple-600" />
              Enhanced Rule Builder
            </h2>
            <p className="text-gray-600 mt-1">
              Create intelligent behaviors for your Aura with advanced tools and templates
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">{stats.activeRules}</div>
              <div className="text-sm text-gray-600">Active Rules</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{availableSenses.length}</div>
              <div className="text-sm text-gray-600">Senses</div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Zap className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">{stats.activeRules}</div>
                <div className="text-xs text-gray-600">Active Rules</div>
              </div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <Eye className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-600">{stats.totalRules - stats.activeRules}</div>
                <div className="text-xs text-gray-600">Inactive</div>
              </div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <Target className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-red-600">{stats.highPriorityRules}</div>
                <div className="text-xs text-gray-600">High Priority</div>
              </div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">
                  {stats.totalRules > 0 ? Math.round((stats.activeRules / stats.totalRules) * 100) : 0}%
                </div>
                <div className="text-xs text-gray-600">Active Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Template Library Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Rule Template Library</h3>
                <Button variant="outline" onClick={() => setShowTemplateModal(false)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Builder
                </Button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <RuleTemplateLibrary
                availableSenses={availableSenses}
                onApplyTemplate={handleApplyTemplate}
                onClose={() => setShowTemplateModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="builder" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Form Builder</span>
              <span className="sm:hidden">Form</span>
            </TabsTrigger>
            {showVisualBuilder && (
              <TabsTrigger value="visual" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Visual Manager</span>
                <span className="sm:hidden">Visual</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Library className="w-4 h-4" />
              <span className="hidden sm:inline">Templates</span>
              <span className="sm:hidden">Library</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            {showTemplateLibrary && (
              <Button
                variant="outline"
                onClick={() => setShowTemplateModal(true)}
                className="gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Browse Templates
              </Button>
            )}
            
            <Button
              onClick={() => setActiveTab('builder')}
              className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Plus className="w-4 h-4" />
              Create Rule
            </Button>
          </div>
        </div>

        <TabsContent value="builder" className="space-y-6">
          <Card className="border-2 border-purple-100" data-help="rule-builder">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-600" />
                Rule Builder
              </CardTitle>
              <p className="text-sm text-gray-600">
                Create detailed rules with full customization options
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <RuleBuilder
                auraId={auraId}
                vesselType={vesselType}
                vesselCode={vesselCode}
                availableSenses={availableSenses}
                existingRules={existingRules}
                editingRule={editingRule}
                onEditRule={onEditRule}
                onSaveEditedRule={onSaveEditedRule}
                onAddRule={onAddRule}
                onDeleteRule={onDeleteRule}
                onToggleRule={onToggleRule}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {showVisualBuilder && (
          <TabsContent value="visual" className="space-y-6">
            <Card className="border-2 border-blue-100">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Visual Rule Manager
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Manage and organize your rules with enhanced visual tools
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <VisualRuleBuilder
                  auraId={auraId}
                  availableSenses={availableSenses}
                  existingRules={existingRules}
                  onRuleUpdate={handleRuleUpdate}
                  onCreateRule={() => setActiveTab('builder')}
                  onEditRule={(rule) => {
                    onEditRule?.(rule)
                    setActiveTab('builder')
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="templates" className="space-y-6">
          <Card className="border-2 border-emerald-100">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
              <CardTitle className="flex items-center gap-2">
                <Library className="w-5 h-5 text-emerald-600" />
                Template Library
              </CardTitle>
              <p className="text-sm text-gray-600">
                Quick-start with pre-built rule templates for common scenarios
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <RuleTemplateLibrary
                availableSenses={availableSenses}
                onApplyTemplate={handleApplyTemplate}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Help Section */}
      <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Getting Started with Rules</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
                <div>
                  <h4 className="font-medium mb-1">🎯 Form Builder</h4>
                  <p>Create detailed rules with full control over triggers, conditions, and responses.</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">📊 Visual Manager</h4>
                  <p>Organize and prioritize your rules with drag-and-drop interface and visual flow.</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">📚 Templates</h4>
                  <p>Start quickly with pre-built templates for common scenarios like wellness and productivity.</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}