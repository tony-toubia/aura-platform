"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { VesselTypeId, SenseId } from "@/lib/constants";
import type { AuraFormData } from "@/types/aura-forms";
import type { Personality, AuraConfiguration } from "@/types";
import { useAsync, useFormSubmit } from "@/hooks/use-async";
import { auraApi } from "@/lib/api/client";
import { LoadingState } from "@/components/ui/loading-spinner";
import { ErrorDisplay } from "@/components/ui/error-boundary";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SubscriptionGuard } from "@/components/subscription/subscription-guard";
import {
  Bot,
  Sparkles,
  Settings,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Save,
  Heart,
} from "lucide-react";
import { AuraConfigurationAgent } from "@/components/aura/aura-configuration-agent";
import { AuraConfigurationForm } from "@/components/aura/aura-configuration-form";
import { type LocationConfig } from "@/components/aura/sense-location-modal";
import { getCurrentUserId } from "@/lib/oauth/token-storage";

type ConfigurationMode = "agent" | "manual" | "review";

const AVAILABLE_SENSES = [
  "weather",
  "news",
  "air_quality",
  "fitness.steps",
  "fitness.heart_rate",
  "sleep.duration",
  "sleep.quality",
  "calendar.next_meeting",
  "calendar.free_time",
  "location.current",
];

export default function CreateAuraWithAgentPage() {
  const router = useRouter();

  // ✅ Hooks must be unconditional
  const [isMounted, setIsMounted] = useState(false);
  const [mode, setMode] = useState<ConfigurationMode>("agent");
  const [initialAura, setInitialAura] = useState<any>(null);
  const [configuration, setConfiguration] = useState<AuraFormData>({
    id: "",
    name: "",
    vesselType: "digital",
    vesselCode: "digital-only",
    plantType: undefined,
    personality: {
      warmth: 50,
      playfulness: 50,
      verbosity: 50,
      empathy: 50,
      creativity: 50,
      persona: "balanced",
      tone: "casual",
      vocabulary: "average",
      quirks: [],
    },
    rules: [],
    senses: [],
    availableSenses: [],
    selectedStudyId: undefined,
    selectedIndividualId: undefined,
  });

  const [locationConfigs, setLocationConfigs] = useState<Record<string, LocationConfig>>({});

  // Track if we came from manual mode to hide header
  const [cameFromManual, setCameFromManual] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Restore form data from URL parameters if switching from manual mode
    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get('name');
    const vesselType = urlParams.get('vesselType');
    const vesselCode = urlParams.get('vesselCode');
    const personalityStr = urlParams.get('personality');
    const sensesStr = urlParams.get('senses');
    const rulesStr = urlParams.get('rules');
    const locationConfigsStr = urlParams.get('locationConfigs');

    if (name || personalityStr || sensesStr || rulesStr) {
      console.log('Restoring form data from manual mode switch');
      setCameFromManual(true);
      
      const editMode = urlParams.get('editMode');
      const auraId = urlParams.get('auraId');
      
      // Set edit mode flag
      if (editMode === 'true') {
        setIsEditMode(true);
        
        // Fetch full aura data for proper sense counting
        if (auraId) {
          fetch(`/api/auras/${auraId}`)
            .then(response => response.json())
            .then(auraData => {
              console.log('Fetched aura data for edit mode:', auraData);
              setInitialAura(auraData);
            })
            .catch(error => {
              console.error('Failed to fetch aura data:', error);
            });
        }
      }
      
      setConfiguration(prev => ({
        ...prev,
        id: auraId || prev.id,
        name: name || prev.name,
        vesselType: (vesselType as VesselTypeId) || prev.vesselType,
        vesselCode: vesselCode || prev.vesselCode,
        personality: personalityStr ? JSON.parse(personalityStr) : prev.personality,
        senses: sensesStr ? JSON.parse(sensesStr) : prev.senses,
        availableSenses: sensesStr ? JSON.parse(sensesStr) : prev.availableSenses,
        rules: rulesStr ? JSON.parse(rulesStr) : prev.rules,
      }));

      if (locationConfigsStr) {
        setLocationConfigs(JSON.parse(locationConfigsStr));
      }

      // If in edit mode, start directly in AI mode for editing
      if (editMode === 'true') {
        setMode('agent');
      }

      // Clean up URL parameters
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);



  const handleSwitchToManual = useCallback(() => {
    // Navigate to manual mode with current form data preserved
    const queryParams = new URLSearchParams({
      name: configuration.name || '',
      vesselType: configuration.vesselType || 'digital',
      vesselCode: configuration.vesselCode || 'digital-only',
      personality: JSON.stringify(configuration.personality),
      senses: JSON.stringify(configuration.senses),
      rules: JSON.stringify(configuration.rules),
      locationConfigs: JSON.stringify(locationConfigs),
    }).toString()
    
    // If we have an aura ID or are in edit mode, go to edit mode, otherwise go to create mode
    if (configuration.id || isEditMode) {
      window.location.href = `/auras/${configuration.id}/edit?${queryParams}`
    } else {
      window.location.href = `/auras/create?${queryParams}`
    }
  }, [configuration, locationConfigs, isEditMode]);

  const handleBackToAgent = useCallback(() => {
    setMode("agent");
  }, []);

  const handlePersonalityChange = useCallback(
    (updates: Partial<Personality>) => {
      setConfiguration((prev) => ({
        ...prev,
        personality: { ...prev.personality, ...updates },
      }));
    },
    []
  );

  const handleConfigurationChange = useCallback(
    (updates: Partial<AuraFormData>) => {
      setConfiguration((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const handleLocationConfigChange = useCallback(
    (senseId: string, config: LocationConfig) => {
      setLocationConfigs(prev => ({ ...prev, [senseId]: config }));
    },
    []
  );

  const navigateToAura = useCallback(() => {
    if (configuration.id) {
      router.push(`/auras/${configuration.id}`);
    } else if (isEditMode) {
      // If in edit mode but no ID yet, go back to auras list
      router.push('/auras');
    }
  }, [configuration.id, router, isEditMode]);

  // Use the new form submission hook
  const {
    submit: saveAuraToDatabase,
    isSubmitting: isSaving,
    error: saveError,
    clearError,
  } = useFormSubmit(
    async (config: AuraFormData) => {
      // Validate required fields
      if (!config.name) {
        throw new Error("Aura name is required");
      }

      if (!config.vesselType) {
        throw new Error("Vessel type is required");
      }

      const userId = await getCurrentUserId();
      if (!userId) throw new Error("User not authenticated");

      const senseCodes = config.availableSenses.map((s) =>
        s.includes(".") ? s.replace(/\./g, "_") : s
      );

      console.log("Saving aura with config:", {
        name: config.name,
        vesselType: config.vesselType,
        vesselCode: config.vesselCode,
        sensesCount: senseCodes.length,
        rulesCount: config.rules.length,
        personality: config.personality,
        rules: config.rules,
        senses: senseCodes,
        isEditMode,
        auraId: config.id
      });

      let response;
      
      if (isEditMode && config.id) {
        // Update existing aura
        console.log("Updating existing aura:", config.id);
        const updateResponse = await fetch(`/api/auras/${config.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: config.name,
            personality: config.personality,
            senses: senseCodes,
            rules: config.rules.filter((r) => r.name && r.name.trim()),
            locationInfo: config.locationInfo,
            newsType: config.newsType,
          }),
        });
        
        const updateBody = await updateResponse.json();
        if (!updateResponse.ok) {
          throw new Error(updateBody.error || "Failed to update Aura");
        }
        
        response = { success: true, data: { auraId: config.id } };
      } else {
        // Create new aura
        response = await auraApi.createAura({
          userId,
          name: config.name,
          vesselType: config.vesselType,
          vesselCode:
            config.vesselCode ||
            (config.vesselType === "digital" ? "digital-only" : ""),
          personality: config.personality,
          senses: senseCodes,
          rules: config.rules.filter((r) => r.name && r.name.trim()),
          // Pass location and news type information
          locationInfo: config.locationInfo,
          newsType: config.newsType,
        });

        if (!response.success) {
          throw new Error(response.error || "Failed to create Aura");
        }
      }

      console.log("Aura saved successfully:", response.data?.auraId);
      setConfiguration((prev) => ({
        ...prev,
        id: response.data?.auraId || config.id || "",
      }));

      return response.data;
    },
    {
      onSuccess: () => {
        console.log(isEditMode ? "Aura update successful" : "Aura creation successful");
      },
      onError: (error) => {
        console.error("Save error:", error);
      },
    }
  );

  // Convert agent configuration to form data, preserving location info
  const convertAgentConfigToFormData = useCallback((agentConfig: AuraConfiguration): AuraFormData => {
    console.log("Converting agent config to form data:", agentConfig);
    console.log("Location info:", agentConfig.locationInfo);
    console.log("News type:", agentConfig.newsType);
    
    return {
      id: "",
      name: agentConfig.name,
      vesselType: agentConfig.vesselType,
      vesselCode: agentConfig.vesselCode || (agentConfig.vesselType === "digital" ? "digital-only" : ""),
      personality: agentConfig.personality,
      rules: agentConfig.rules || [],
      senses: (agentConfig.availableSenses || []) as SenseId[],
      availableSenses: (agentConfig.availableSenses || []) as SenseId[],
      // Preserve location and news type information
      locationInfo: agentConfig.locationInfo,
      newsType: agentConfig.newsType,
    };
  }, []);

  // Handle real-time configuration updates during agent conversation
  const handleAgentConfigUpdate = useCallback(
    (partialConfig: Partial<AuraConfiguration>) => {
      console.log("Agent config update:", partialConfig);
      
      // Convert partial agent config to form data format and merge
      setConfiguration(prev => {
        const updates: Partial<AuraFormData> = {};
        
        if (partialConfig.name) updates.name = partialConfig.name;
        if (partialConfig.vesselType) updates.vesselType = partialConfig.vesselType;
        if (partialConfig.vesselCode) updates.vesselCode = partialConfig.vesselCode;
        if (partialConfig.personality) {
          updates.personality = { ...prev.personality, ...partialConfig.personality };
        }
        if (partialConfig.rules) updates.rules = partialConfig.rules;
        if (partialConfig.availableSenses) {
          updates.senses = partialConfig.availableSenses as SenseId[];
          updates.availableSenses = partialConfig.availableSenses as SenseId[];
        }
        
        return { ...prev, ...updates };
      });
    },
    []
  );

  const handleAgentComplete = useCallback(
    async (agentConfig: AuraConfiguration) => {
      console.log("Agent completed with config:", agentConfig);
      console.log("Personality details:", agentConfig.personality);
      console.log("Rules details:", agentConfig.rules);
      console.log("Location info:", agentConfig.locationInfo);
      console.log("News type:", agentConfig.newsType);

      // Validate the configuration before proceeding
      if (!agentConfig.name) {
        console.error("Agent configuration missing name:", agentConfig);
        // Error will be handled by the saveAuraToDatabase function
        return;
      }

      if (!agentConfig.vesselType) {
        console.error("Agent configuration missing vessel type:", agentConfig);
        // Error will be handled by the saveAuraToDatabase function
        return;
      }

      const formData = convertAgentConfigToFormData(agentConfig);
      setConfiguration(formData);

      try {
        await saveAuraToDatabase(formData);
        setMode("review");
      } catch (error) {
        console.error("Failed to save aura from agent:", error);
        // Error will be handled by the useFormSubmit hook
        // Stay in agent mode so user can retry
      }
    },
    [saveAuraToDatabase, convertAgentConfigToFormData]
  );

  const handleManualSave = useCallback(async () => {
    await saveAuraToDatabase(configuration);
    setMode("review");
  }, [configuration, saveAuraToDatabase]);

  const getConfigurationProgress = () => {
    let progress = 0;
    const total = 4;
    if (configuration.name) progress++;
    if (configuration.vesselType && configuration.vesselCode) progress++;
    if (
      configuration.personality.persona ||
      configuration.personality.tone !== "casual"
    )
      progress++;
    if (configuration.rules.length > 0) progress++;
    return { progress, total, percentage: (progress / total) * 100 };
  };

  // ✅ Only render UI when mounted (but after all hooks are declared)
  if (!isMounted)
    return <div className="p-8 text-center text-gray-400">Loading...</div>;

  const progressInfo = getConfigurationProgress();

  return (
    <SubscriptionGuard feature="maxAuras">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
        {mode === "agent" && (
          <>
            {!cameFromManual && (
              <>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-6">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    {isEditMode ? `Enhance ${configuration.name || 'Your Aura'} with AI` : 'Create Your Digital Aura with AI'}
                  </h1>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
                    {isEditMode
                      ? `Let our AI assistant help you refine and enhance ${configuration.name || 'your Aura'}. Make adjustments to personality, behaviors, and more.`
                      : 'Let our AI assistant guide you through creating the perfect digital companion. Your Aura will live in the cloud and be accessible from anywhere.'
                    }
                  </p>
                  {!isEditMode && (
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                      <Sparkles className="w-4 h-4" />
                      Launch Special: Digital Auras are completely free
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="flex justify-center mb-8">
              <Card className="p-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Bot className="w-4 h-4" />
                    AI Assistant
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSwitchToManual}
                    className="flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Manual Configuration
                  </Button>
                </div>
              </Card>
            </div>

            <AuraConfigurationAgent
              onConfigurationComplete={handleAgentComplete}
              onConfigurationUpdate={handleAgentConfigUpdate}
              initialConfig={configuration}
              initialAura={initialAura}
              availableSenses={AVAILABLE_SENSES}
              isEditMode={isEditMode}
            />

            {saveError && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-red-800 font-medium">Save Failed</h3>
                    <p className="text-red-700 text-sm mt-1">{saveError}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      clearError();
                      if (configuration.name) {
                        saveAuraToDatabase(configuration);
                      }
                    }}
                    disabled={isSaving}
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    {isSaving ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                        Retrying...
                      </>
                    ) : (
                      "Retry"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {mode === "manual" && (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Digital Aura Manual Configuration
                </h1>
                <p className="text-gray-600">
                  Configure your digital Aura step by step with detailed controls. Any settings from the AI conversation are preserved here.
                </p>
              </div>
              <Button variant="outline" onClick={handleBackToAgent}>
                <Bot className="w-4 h-4 mr-2" />
                Back to AI Assistant
              </Button>
            </div>

            <Card className="mb-8">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    Configuration Progress
                  </span>
                  <span className="text-sm text-gray-600">
                    {progressInfo.progress} of {progressInfo.total} complete
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressInfo.percentage}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <AuraConfigurationForm
              auraData={{
                id: configuration.id,
                name: configuration.name,
                vesselType: configuration.vesselType,
                vesselCode: configuration.vesselCode,
                personality: configuration.personality,
                senses: configuration.senses,
                selectedStudyId: configuration.selectedStudyId,
                selectedIndividualId: configuration.selectedIndividualId,
                rules: configuration.rules,
              }}
              locationConfigs={locationConfigs}
              onAuraDataChange={handleConfigurationChange}
              onLocationConfigChange={handleLocationConfigChange}
              onSave={handleManualSave}
              autoSaveBeforeRules={true}
              showStepNavigation={true}
              showSaveButton={true}
              saveButtonText={isSaving ? "Saving..." : "Save Configuration"}
              isLoading={isSaving}
              error={saveError}
            />
          </>
        )}

        {mode === "review" && (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {isEditMode ? 'Your Aura Has Been Updated!' : 'Your Aura is Ready!'}
              </h1>
              <p className="text-gray-600">
                {isEditMode
                  ? `${configuration.name} has been successfully updated with your changes.`
                  : `${configuration.name} has been created and is ready to start their journey with you.`
                }
              </p>
            </div>

            <Card className="mb-8">
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <h3 className="font-semibold text-purple-700 mb-2">Name</h3>
                    <p className="text-lg">{configuration.name}</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-700 mb-2">Vessel</h3>
                    <p className="text-lg capitalize">
                      {configuration.vesselCode === "digital-only"
                        ? "Digital Only"
                        : configuration.vesselCode || configuration.vesselType}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-700 mb-2">Rules</h3>
                    <p className="text-lg">
                      {configuration.rules.length} configured
                    </p>
                  </div>
                </div>

                {configuration.availableSenses.length > 0 && (
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-3">
                      Connected Senses
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {configuration.availableSenses.map((sense, index) => (
                        <Badge key={index} variant="secondary">
                          {sense.replace("_", " ").replace(".", ": ")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {saveError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700">{saveError}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={handleBackToAgent}>
                <ArrowLeft className="w-4 h-4" />
                Back to Configuration
              </Button>
              <Button
                onClick={navigateToAura}
                disabled={!configuration.id && !isEditMode}
                size="lg"
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Heart className="w-4 h-4" />
                {isEditMode ? `Continue with ${configuration.name}` : `Chat with ${configuration.name}`}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </div>
      <div className="mt-4 p-3 bg-gray-50 rounded text-xs font-mono">
        <div>
          <strong>Debug Info:</strong>
        </div>
        <div>
          Mode: {mode} | Progress: {progressInfo.progress}/{progressInfo.total}
        </div>
        <div>
          Name: {configuration.name || "Not set"} | Vessel:{" "}
          {configuration.vesselType} | Code:{" "}
          {configuration.vesselCode || "Not set"}
        </div>
        <div>
          Senses: {configuration.availableSenses.length} | Rules:{" "}
          {configuration.rules.length}
        </div>
        {configuration.id && <div>✅ Aura ID: {configuration.id}</div>}
        {saveError && <div className="text-red-600">❌ Error: {saveError}</div>}
        {isSaving && <div className="text-blue-600">⏳ Saving...</div>}

        {/* Manual completion button for debugging - only show if there's an error */}
        {mode === "agent" &&
          configuration.name &&
          configuration.vesselType &&
          !configuration.id &&
          saveError && (
            <button
              onClick={() => {
                const agentConfig = {
                  name: configuration.name,
                  vesselType: configuration.vesselType,
                  vesselCode:
                    configuration.vesselCode ||
                    (configuration.vesselType === "digital"
                      ? "digital-only"
                      : ""),
                  personality: configuration.personality,
                  rules: configuration.rules,
                  availableSenses: configuration.availableSenses,
                };
                handleAgentComplete(agentConfig);
              }}
              className="mt-2 px-2 py-1 bg-red-500 text-white text-xs rounded"
              disabled={isSaving}
            >
              🚨 Force Save (Debug)
            </button>
          )}
        </div>
      </div>
    </SubscriptionGuard>
  );
}
