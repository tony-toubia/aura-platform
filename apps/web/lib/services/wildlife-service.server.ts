// apps/web/lib/services/wildlife-service.server.ts
import { createServerSupabase } from "@/lib/supabase/server.server"
import { fetchTrackPage, Point } from "./movebank-service"

const CACHE_TABLE = "wildlife_tracks"

export async function getCachedPoints(
  studyId: number,
  individualId: string,
  start: string,
  end: string
): Promise<Point[]> {
  const supabase = await createServerSupabase()
  const { data } = await supabase
    .from(CACHE_TABLE)
    .select("timestamp, lat, lon")
    .eq("study_id", studyId)
    .eq("individual_id", individualId)
    .gte("timestamp", start)
    .lte("timestamp", end)
    .order("timestamp", { ascending: true })

  return (data || []).map((r: any) => ({
    timestamp: r.timestamp,
    location_lat: r.lat,
    location_long: r.lon,
  }))
}

export async function fetchAndCache(
  studyId: number,
  individualId: string,
  start: string,
  end: string
): Promise<Point[]> {
  const points = await fetchTrackPage(studyId, individualId, start, end)
  if (!points.length) return []

  const supabase = await createServerSupabase()
  const rows = points.map((p) => ({
    study_id:      studyId,
    individual_id: individualId,
    timestamp:     p.timestamp,
    lat:           p.location_lat,
    lon:           p.location_long,
  }))

  await supabase
    .from(CACHE_TABLE)
    .upsert(rows, {
      onConflict: "study_id,individual_id,timestamp",
    })

  return points
}
