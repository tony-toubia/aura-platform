import { redirect } from "next/navigation"
import { createServerSupabase } from "@/lib/supabase/server.server"
import { ConnectionsManager } from "@/components/connections/connections-manager"

export default async function ConnectionsPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return <ConnectionsManager userId={user.id} />
}