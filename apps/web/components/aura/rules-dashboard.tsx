// apps/web/components/aura/rules-dashboard.tsx

"use client"

import React, { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RuleEngine, RuleContext } from "@/lib/services/rule-engine"
import { SenseDataService } from "@/lib/services/sense-data-service"
import {
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { BehaviorRule, Aura } from "@/types"

interface RulesDashboardProps {
  aura: Aura
  rules: BehaviorRule[]
}

export function RulesDashboard({ aura, rules }: RulesDashboardProps) {
  console.log("🧪 RulesDashboard mounted", { aura, rules })
  const [senseData, setSenseData] = useState<Record<string, any>>({})
  const [triggeredRules, setTriggeredRules] = useState<string[]>([])
  const [ruleHistory, setRuleHistory] = useState<
    {
      ruleId: string
      ruleName: string
      timestamp: Date
      message: string
    }[]
  >([])

  useEffect(() => {
    const checkRules = async () => {
      // Guard: only run if aura.senses is a valid array
      if (!Array.isArray(aura.senses)) return

      // 1) Fetch and map sense data
      const data = await SenseDataService.getSenseData(aura.senses)
      const dataMap = data.reduce((acc, item) => {
        acc[item.senseId] = item.data
        return acc
      }, {} as Record<string, any>)
      setSenseData(dataMap)

      // 2) Build RuleContext
      const now = new Date()
      const hour = now.getHours()
      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ]
      const context: RuleContext = {
        senseData: dataMap,
        auraPersonality: {
          warmth: aura.personality.warmth || 50,
          playfulness: aura.personality.playfulness || 50,
          verbosity: aura.personality.verbosity || 50,
          empathy: aura.personality.empathy || 50,
          creativity: aura.personality.creativity || 50,
},        timeOfDay:
          hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening",
        dayOfWeek: days[now.getDay()]!, // assert non-null
      }

      // 3) Evaluate rules
      const results = RuleEngine.evaluateRules(rules, context)
      setTriggeredRules(results.map((r) => r.rule.id))

      // 4) Update history (keep last 10)
      setRuleHistory((prev) =>
        [
          ...prev,
          ...results.map((result) => ({
            ruleId: result.rule.id,
            ruleName: result.rule.name,
            timestamp: new Date(),
            message: result.message ?? "",
          })),
        ].slice(-10)
      )
    }

    // run immediately and on interval
    checkRules()
    const interval = setInterval(checkRules, 10000)
    return () => clearInterval(interval)
  }, [aura, rules])

  const getRuleStatus = (rule: BehaviorRule): "triggered" | "active" | "disabled" => {
    if (!rule.enabled) return "disabled"
    if (triggeredRules.includes(rule.id)) return "triggered"
    return "active"
  }

  const getStatusColor = (status: string) =>
    status === "triggered"
      ? "text-amber-600 bg-amber-50"
      : status === "active"
      ? "text-green-600 bg-green-50"
      : "text-gray-600 bg-gray-50"

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "triggered":
        return <Zap className="w-4 h-4" />
      case "active":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Rules Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Rules</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rules.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rules.filter((r) => r.enabled).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Currently Triggered</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {triggeredRules.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recent Triggers</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ruleHistory.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Rules List */}
      <Card>
        <CardHeader>
          <CardTitle>Behavior Rules</CardTitle>
          <CardDescription>Real-time status of all configured rules</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {rules.map((rule) => {
            const status = getRuleStatus(rule)
            return (
              <div
                key={rule.id}
                className={cn(
                  "flex items-center justify-between p-4 rounded-lg border transition-all",
                  status === "triggered" && "border-amber-200 bg-amber-50/50"
                )}
              >
                <div className="flex items-start space-x-3">
                  <div className={cn("p-2 rounded-full", getStatusColor(status))}>
                    {getStatusIcon(status)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{rule.name}</h4>
                      <Badge variant={status === "triggered" ? "default" : "secondary"}>
                        {status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {rule.trigger.sensor} {rule.trigger.operator} {rule.trigger.value}
                    </p>
                    {status === "triggered" && (
                      <p className="text-sm text-amber-600 mt-1">
                        "{rule.action.message}"
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    Priority: {rule.priority ?? 0}
                  </p>
                  {rule.trigger.cooldown && (
                    <p className="text-xs text-muted-foreground">
                      Cooldown: {rule.trigger.cooldown}s
                    </p>
                  )}
                </div>
              </div>
            )
          })}

          {rules.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No behavior rules configured</p>
              <p className="text-sm mt-1">Add rules to make your Aura responsive</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rule History */}
      {ruleHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Rule Triggers</CardTitle>
            <CardDescription>History of recently triggered rules</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ruleHistory
                .slice()
                .reverse()
                .map((entry, idx) => (
                  <div
                    key={`${entry.ruleId}-${idx}`}
                    className="flex items-start justify-between py-2 border-b last:border-0"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{entry.ruleName}</p>
                      <p className="text-xs text-muted-foreground">{entry.message}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {entry.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
