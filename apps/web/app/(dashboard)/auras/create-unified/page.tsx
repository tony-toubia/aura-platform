// apps/web/app/(dashboard)/auras/create-unified/page.tsx

"use client"

import React from 'react'
import { WizardProvider } from '@/components/aura/creation-wizard/wizard-provider'
import { ProgressIndicator } from '@/components/aura/creation-wizard/progress-indicator'
import { WizardNavigation } from '@/components/aura/creation-wizard/wizard-navigation'
import { FloatingContinueButton } from '@/components/aura/creation-wizard/floating-continue-button'
import { WelcomeStep } from '@/components/aura/creation-wizard/steps/welcome-step'
import { MethodSelectionStep } from '@/components/aura/creation-wizard/steps/method-selection-step'
import { VesselSelectionStep } from '@/components/aura/creation-wizard/steps/vessel-selection-step'
import { ConfigurationStep } from '@/components/aura/creation-wizard/steps/configuration-step'
import { ReviewStep } from '@/components/aura/creation-wizard/steps/review-step'
import { SuccessStep } from '@/components/aura/creation-wizard/steps/success-step'
import { ContextualHelpProvider } from '@/components/help/contextual-help-provider'
import { FloatingHelpWidget } from '@/components/help/floating-help-widget'
import { useCreationContext } from '@/hooks/use-creation-context'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

function WizardContent() {
  const { step, nextStep, canGoNext, method, vessel, configuration } = useCreationContext()

  // Determine when to show floating continue button
  const shouldShowFloatingContinue = () => {
    switch (step) {
      case 'method':
        return !!method
      case 'vessel':
        return !!vessel
      case 'config':
        return !!configuration.name
      default:
        return false
    }
  }

  const getFloatingButtonLabel = () => {
    switch (step) {
      case 'method':
        return 'Continue with ' + (method === 'ai' ? 'AI Guide' : 'Manual Setup')
      case 'vessel':
        return 'Continue with ' + (vessel ? vessel.charAt(0).toUpperCase() + vessel.slice(1) : 'Selection')
      case 'config':
        return 'Review Configuration'
      default:
        return 'Continue'
    }
  }

  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return <WelcomeStep />
      case 'method':
        return <MethodSelectionStep />
      case 'vessel':
        return <VesselSelectionStep />
      case 'config':
        return <ConfigurationStep />
      case 'review':
        return <ReviewStep />
      case 'success':
        return <SuccessStep />
      default:
        return <WelcomeStep />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/auras">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Auras
              </Button>
            </Link>
            <div className="h-6 w-px bg-gray-300" />
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-900">Create New Aura</h1>
            </div>
          </div>
        </div>

        {/* Progress Indicator - Only show after welcome step */}
        {step !== 'welcome' && step !== 'success' && (
          <div className="mb-8">
            <ProgressIndicator />
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              {renderStep()}
            </CardContent>
          </Card>

          {/* Navigation - Only show for non-terminal steps */}
          {step !== 'welcome' && step !== 'success' && (
            <div className="mt-8">
              <WizardNavigation />
            </div>
          )}
        </div>

        {/* Floating Continue Button */}
        <FloatingContinueButton
          show={shouldShowFloatingContinue()}
          onContinue={nextStep}
          disabled={!canGoNext}
          label={getFloatingButtonLabel()}
        />

        {/* Footer */}
        <div className="mt-16 text-center text-sm text-gray-500">
          <p>
            Creating your perfect AI companion with the Aura Platform
          </p>
        </div>
      </div>
    </div>
  )
}

export default function CreateUnifiedPage() {
  return (
    <ContextualHelpProvider>
      <WizardProvider>
        <WizardContent />
        <FloatingHelpWidget />
      </WizardProvider>
    </ContextualHelpProvider>
  )
}