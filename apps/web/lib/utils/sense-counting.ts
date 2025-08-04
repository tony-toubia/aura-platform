// apps/web/lib/utils/sense-counting.ts

import type { Aura } from '@/types'

/**
 * Properly counts the total number of configured senses for an aura.
 * This should match the number of unique rows in aura_senses + oauth_connections tables.
 *
 * - Each entry in aura.senses array = 1 row in aura_senses table = 1 sense
 * - Each OAuth connection with actual connections = 1 sense
 */
export function countAuraSenses(aura: Aura): number {
  let count = 0
  
  // Count all senses from aura_senses table (represented by aura.senses array)
  count += aura.senses?.length || 0
  
  // Count OAuth connected senses (1 per sense type if any connections exist)
  const oauthSenses = aura.oauthConnections ? Object.keys(aura.oauthConnections) : []
  oauthSenses.forEach(senseType => {
    const connections = aura.oauthConnections?.[senseType] || []
    if (connections.length > 0) {
      count += 1
    }
  })
  
  return count
}

/**
 * Counts total senses across all auras
 */
export function countTotalSenses(auras: Aura[]): number {
  return auras.reduce((total, aura) => total + countAuraSenses(aura), 0)
}