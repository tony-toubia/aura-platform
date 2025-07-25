// apps/web/hooks/use-cooldown-config.ts (Type-safe version)

import { useState, useEffect } from 'react'
import { DEFAULT_COOLDOWN } from '@/lib/constants/rules'
import type { BehaviorRule } from '@/types'

export type CooldownType = 'simple' | 'frequency'

export interface CooldownConfig {
  type: CooldownType
  simpleCooldown: string
  frequencyLimit: string
  frequencyPeriod: string
  minimumGap: string
}

export interface CooldownHookReturn extends CooldownConfig {
  setCooldownType: (type: CooldownType) => void
  setSimpleCooldown: (value: string) => void
  setFrequencyLimit: (value: string) => void
  setFrequencyPeriod: (value: string) => void
  setMinimumGap: (value: string) => void
  applyEditingRule: (rule: BehaviorRule | null) => void
  clearCooldownConfig: () => void
  calculateFinalCooldown: () => number
  getCooldownPayload: () => {
    cooldown: number
    frequencyLimit?: number
    frequencyPeriod?: string
    minimumGap?: number
  }
}

const DEFAULT_CONFIG: CooldownConfig = {
  type: 'simple',
  simpleCooldown: String(DEFAULT_COOLDOWN),
  frequencyLimit: '3',
  frequencyPeriod: 'day',
  minimumGap: '300'
}

export function useCooldownConfig(): CooldownHookReturn {
  const [type, setCooldownType] = useState<CooldownType>('simple')
  const [simpleCooldown, setSimpleCooldown] = useState(String(DEFAULT_COOLDOWN))
  const [frequencyLimit, setFrequencyLimit] = useState('3')
  const [frequencyPeriod, setFrequencyPeriod] = useState('day')
  const [minimumGap, setMinimumGap] = useState('300')

  const applyEditingRule = (rule: BehaviorRule | null) => {
    if (rule && rule.trigger) {
      const cooldown = rule.trigger.cooldown ?? DEFAULT_COOLDOWN
      
      // Check if rule has frequency-based cooldown properties
      if (rule.trigger.frequencyLimit && rule.trigger.frequencyPeriod) {
        setCooldownType('frequency')
        setFrequencyLimit(String(rule.trigger.frequencyLimit))
        setFrequencyPeriod(rule.trigger.frequencyPeriod)
        setMinimumGap(String(rule.trigger.minimumGap || 300))
      } else {
        setCooldownType('simple')
        setSimpleCooldown(String(cooldown))
      }
    }
  }

  const clearCooldownConfig = () => {
    setCooldownType(DEFAULT_CONFIG.type)
    setSimpleCooldown(DEFAULT_CONFIG.simpleCooldown)
    setFrequencyLimit(DEFAULT_CONFIG.frequencyLimit)
    setFrequencyPeriod(DEFAULT_CONFIG.frequencyPeriod)
    setMinimumGap(DEFAULT_CONFIG.minimumGap)
  }

  const calculateFinalCooldown = (): number => {
    if (type === 'frequency') {
      return calculateCooldownFromFrequency(
        parseInt(frequencyLimit), 
        frequencyPeriod, 
        parseInt(minimumGap)
      )
    }
    return parseInt(simpleCooldown, 10)
  }

  const getCooldownPayload = () => {
    const finalCooldown = calculateFinalCooldown()
    
    if (type === 'frequency') {
      return {
        cooldown: finalCooldown,
        frequencyLimit: parseInt(frequencyLimit),
        frequencyPeriod,
        minimumGap: parseInt(minimumGap)
      }
    }
    
    return { cooldown: finalCooldown }
  }

  return {
    type,
    simpleCooldown,
    frequencyLimit,
    frequencyPeriod,
    minimumGap,
    setCooldownType,
    setSimpleCooldown,
    setFrequencyLimit,
    setFrequencyPeriod,
    setMinimumGap,
    applyEditingRule,
    clearCooldownConfig,
    calculateFinalCooldown,
    getCooldownPayload
  }
}

// Helper function moved here too
const calculateCooldownFromFrequency = (limit: number, period: string, gap: number) => {
  const FREQUENCY_PERIODS = [
    { value: 'hour', seconds: 3600 },
    { value: 'day', seconds: 86400 },
    { value: 'week', seconds: 604800 },
    { value: 'month', seconds: 2592000 }
  ]
  
  const periodConfig = FREQUENCY_PERIODS.find(p => p.value === period)
  if (!periodConfig) return gap
  
  const averageInterval = periodConfig.seconds / limit
  return Math.max(averageInterval, gap)
}