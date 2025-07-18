// apps/web/lib/services/rule-engine.ts

import { SenseDataService, SenseData } from './sense-data-service'
import type { BehaviorRule } from '@/types'

export interface RuleContext {
  senseData: Record<string, any>
  auraPersonality: Record<string, number>
  timeOfDay: string
  dayOfWeek: string
  lastTriggered?: Record<string, Date>
}

export interface RuleResult {
  triggered: boolean
  rule: BehaviorRule
  message?: string
  action?: string
  priority: number
}

export class RuleEngine {
  private static operators = {
    '<': (a: number, b: number) => a < b,
    '<=': (a: number, b: number) => a <= b,
    '>': (a: number, b: number) => a > b,
    '>=': (a: number, b: number) => a >= b,
    '==': (a: any, b: any) => a == b,
    '!=': (a: any, b: any) => a != b,
    'contains': (a: string, b: string) => a.toLowerCase().includes(b.toLowerCase()),
    'between': (value: number, range: [number, number]) => value >= range[0] && value <= range[1],
  }

  static evaluateRules(rules: BehaviorRule[], context: RuleContext): RuleResult[] {
    const results: RuleResult[] = []

    for (const rule of rules) {
      if (!rule.enabled) continue

      const result = this.evaluateRule(rule, context)
      if (result.triggered) {
        results.push(result)
      }
    }

    // Sort by priority (higher first)
    return results.sort((a, b) => b.priority - a.priority)
  }

  private static evaluateRule(rule: BehaviorRule, context: RuleContext): RuleResult {
    try {
      const triggered = this.evaluateCondition(rule.trigger, context)
      
        if (triggered) {
            const lastTrigger = context.lastTriggered?.[rule.id]
            if (rule.trigger.cooldown && lastTrigger) {
                const cooldownMs = rule.trigger.cooldown * 1000
                if (Date.now() - lastTrigger.getTime() < cooldownMs) {
                 return { triggered: false, rule, priority: rule.priority || 0 }
                }
            } 

        return {
          triggered: true,
          rule,
          message: this.generateMessage(rule.action, context),
          action: rule.action.type,
          priority: rule.priority || 0
        }
      }

      return { triggered: false, rule, priority: rule.priority || 0 }
    } catch (error) {
      console.error('Error evaluating rule:', error)
      return { triggered: false, rule, priority: 0 }
    }
  }

  private static evaluateCondition(trigger: any, context: RuleContext): boolean {
    switch (trigger.type) {
      case 'simple':
        return this.evaluateSimpleCondition(trigger, context)
      
      case 'compound':
        return this.evaluateCompoundCondition(trigger, context)
      
      case 'time':
        return this.evaluateTimeCondition(trigger, context)
      
      case 'threshold':
        return this.evaluateThresholdCondition(trigger, context)
      
      default:
        return false
    }
  }

  private static evaluateSimpleCondition(trigger: any, context: RuleContext): boolean {
    const { sensor, operator, value } = trigger
    const sensorValue = this.getSensorValue(sensor, context)
    
    if (sensorValue === undefined) return false

    const op = this.operators[operator as keyof typeof this.operators]
    if (!op) return false

    return op(sensorValue, value)
  }

  private static evaluateCompoundCondition(trigger: any, context: RuleContext): boolean {
    const { conditions, logic = 'AND' } = trigger

    if (logic === 'AND') {
      return conditions.every((condition: any) => 
        this.evaluateCondition(condition, context)
      )
    } else if (logic === 'OR') {
      return conditions.some((condition: any) => 
        this.evaluateCondition(condition, context)
      )
    }

    return false
  }

  private static evaluateTimeCondition(trigger: any, context: RuleContext): boolean {
    const { timeRange, daysOfWeek } = trigger
    const now = new Date()
    const currentHour = now.getHours()
    const currentDay = now.getDay()

    if (timeRange) {
      const [startHour, endHour] = timeRange
      if (currentHour < startHour || currentHour > endHour) {
        return false
      }
    }

    if (daysOfWeek && daysOfWeek.length > 0) {
      if (!daysOfWeek.includes(currentDay)) {
        return false
      }
    }

    return true
  }

  private static evaluateThresholdCondition(trigger: any, context: RuleContext): boolean {
    const { sensor, thresholds } = trigger
    const sensorValue = this.getSensorValue(sensor, context)
    
    if (sensorValue === undefined) return false

    for (const threshold of thresholds) {
      if (threshold.min !== undefined && sensorValue < threshold.min) continue
      if (threshold.max !== undefined && sensorValue > threshold.max) continue
      return true
    }

    return false
  }

  private static getSensorValue(sensorPath: string, context: RuleContext): any {
    const parts = sensorPath.split('.')
    let value: any = context.senseData

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part]
      } else {
        return undefined
      }
    }

    return value
  }

  private static generateMessage(action: any, context: RuleContext): string {
    if (action.message) {
      // Replace variables in the message
      return action.message.replace(/\{([^}]+)\}/g, (match: string, path: string) => {
        const value = this.getSensorValue(path, context)
        return value !== undefined ? value : match
      })
    }

    return action.defaultMessage || 'A rule was triggered!'
  }
}