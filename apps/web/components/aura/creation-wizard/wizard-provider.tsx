// apps/web/components/aura/creation-wizard/wizard-provider.tsx

"use client"

import React from 'react'
import { CreationContextContext, useCreationContextProvider } from '@/hooks/use-creation-context'

interface CreationWizardProviderProps {
  children: React.ReactNode
}

export function CreationWizardProvider({ children }: CreationWizardProviderProps) {
  const contextValue = useCreationContextProvider()

  return (
    <CreationContextContext.Provider value={contextValue}>
      {children}
    </CreationContextContext.Provider>
  )
}

// Export as WizardProvider for convenience
export const WizardProvider = CreationWizardProvider