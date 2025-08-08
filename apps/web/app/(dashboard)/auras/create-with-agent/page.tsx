import React from "react";
import { createServerSupabase } from "@/lib/supabase/server.server";
import { SubscriptionService } from "@/lib/services/subscription-service";
import { UpgradePrompt } from "@/components/subscription/upgrade-prompt";
import { CreateWithAgentClient } from "./create-with-agent-client";

export default async function CreateAuraWithAgentPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Please sign in to create an Aura.</p>
      </div>
    );
  }

  // For now, just show the client component
  // The subscription check can be handled client-side
  return <CreateWithAgentClient />;
}
