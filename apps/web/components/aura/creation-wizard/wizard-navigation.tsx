// apps/web/components/aura/creation-wizard/wizard-navigation.tsx

"use client"

import React from 'react'
import { useCreationContext } from '@/hooks/use-creation-context'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function WizardNavigation() {
  const { 
    step, 
    nextStep, 
    prevStep, 
    canGoNext, 
    canGoPrev, 
    saveProgress,
    configuration,
    method,
    vessel
  } = useCreationContext()

  const [isSaving, setIsSaving] = React.useState(false)
  const [saveError, setSaveError] = React.useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = React.useState(false)

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setSaveError(null)
      await saveProgress()
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save progress')
    } finally {
      setIsSaving(false)
    }
  }

  const getNextButtonText = () => {
    switch (step) {
      case 'welcome':
        return 'Get Started'
      case 'method':
        return method ? 'Continue' : 'Select Method'
      case 'vessel':
        return vessel ? 'Continue' : 'Select Vessel'
      case 'config':
        return configuration.name ? 'Review' : 'Complete Configuration'
      case 'review':
        return 'Create Aura'
      default:
        return 'Next'
    }
  }

  const getPrevButtonText = () => {
    switch (step) {
      case 'method':
        return 'Back to Welcome'
      case 'vessel':
        return 'Change Method'
      case 'config':
        return 'Change Vessel'
      case 'review':
        return 'Edit Configuration'
      default:
        return 'Previous'
    }
  }

  const getValidationMessage = () => {
    switch (step) {
      case 'method':
        return !method ? 'Please select a configuration method to continue' : null
      case 'vessel':
        return !vessel ? 'Please select a vessel type to continue' : null
      case 'config':
        return !configuration.name ? 'Please provide a name for your Aura' : null
      default:
        return null
    }
  }

  const validationMessage = getValidationMessage()
  const showSaveButton = step === 'config' && configuration.name

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          {/* Previous Button */}
          <div className="flex items-center gap-4">
            {canGoPrev ? (
              <Button
                variant="outline"
                onClick={prevStep}
                className="gap-2 hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4" />
                {getPrevButtonText()}
              </Button>
            ) : (
              <div /> // Spacer
            )}

            {/* Save Button */}
            {showSaveButton && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="gap-2 border-green-300 text-green-700 hover:bg-green-50"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : saveSuccess ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Progress'}
                </Button>

                {saveError && (
                  <div className="flex items-center gap-1 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span>{saveError}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Next Button & Validation */}
          <div className="flex items-center gap-4">
            {/* Validation Message */}
            {validationMessage && (
              <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{validationMessage}</span>
              </div>
            )}

            {/* Next Button */}
            <Button
              onClick={nextStep}
              disabled={!canGoNext}
              size="lg"
              data-static-continue
              className={cn(
                "gap-2 px-6 py-3 text-base font-medium transition-all duration-200",
                canGoNext
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              )}
            >
              {getNextButtonText()}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Progress Hint */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            {step === 'welcome' && "Welcome! Let's create your perfect Aura together."}
            {step === 'method' && "Choose how you'd like to configure your Aura."}
            {step === 'vessel' && "Select the type of vessel for your Aura."}
            {step === 'config' && "Configure your Aura's personality and capabilities."}
            {step === 'review' && "Review your configuration before creating your Aura."}
            {step === 'success' && "Congratulations! Your Aura has been created successfully."}
          </p>
        </div>

        {/* Keyboard Shortcuts Hint */}
        {(canGoNext || canGoPrev) && (
          <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-400">
            {canGoPrev && (
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">←</kbd>
                <span>Previous</span>
              </div>
            )}
            {canGoNext && (
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">→</kbd>
                <span>Next</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}