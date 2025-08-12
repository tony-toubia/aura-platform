// Legacy endpoint for public data (which has proven to be the most stable)
const LEGACY_API_BASE = "https://www.movebank.org/movebank/service/public/json";

export type Point = {
  timestamp: string;
  location_lat: number;
  location_long: number;
};

// This helper is for making authenticated calls, kept for fetchTrackPage.
function buildAuthHeaders(): Record<string, string> {
  const { MOVEBANK_USER, MOVEBANK_PASS } = process.env;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (MOVEBANK_USER && MOVEBANK_PASS) {
    const creds = Buffer.from(`${MOVEBANK_USER}:${MOVEBANK_PASS}`).toString("base64");
    headers["Authorization"] = `Basic ${creds}`;
  }
  return headers;
}

/**
 * Returns a hard-coded list of studies and their individuals.
 *
 * FINAL SOLUTION: Since the Movebank API for listing individuals is unreliable,
 * you must manually add the study and its list of individuals here.
 */
export async function getKnownStudies(): Promise<{ id: number; name: string; individuals: string[] }[]> {
  console.log("Returning a fully hard-coded list of studies and individuals.");
  
  // TODO: Replace this with your actual studies and their individual tags.
  // You can find these on the Movebank website under the study details.
  return [
    { 
      id: 1322770395, 
      name: "Parti-colored bats (Vespertilio murinus) in the City of Zurich",
      individuals: ["Vespertilio murinus VMR-11", "Vespertilio murinus VMR-12", "Vespertilio murinus VMR-13 (eobs 6157)"]
    },
    // Using your working study from the logs
    {
      id: 430263960,
      name: "Bald Eagle (Haliaeetus leucocephalus) in the Pacific Northwest",
      individuals: ["BACA01", "BACA02", "BACA03", "BAEA24-69"] // Example individuals from your log
    },
    {
      id: 3809257699,
      name: "African lions in Central Kalahari Botswana",
      individuals: ["BACA01", "BACA02", "BACA03", "BAEA24-69"] // Example individuals from your log
    }
  ];
}


/**
 * Fetches GPS track points for a specific animal.
 */
export async function fetchTrackPage(
  studyId: number,
  individualId: string,
  start: string,
  end: string
): Promise<Point[]> {
  const url = new URL(LEGACY_API_BASE);
  url.searchParams.set("study_id", studyId.toString());
  url.searchParams.set("individual_local_identifiers", individualId);
  url.searchParams.set("start_timestamp", start);
  url.searchParams.set("end_timestamp", end);
  url.searchParams.set("entity_type", "event");

  try {
    const res = await fetch(url.toString(), { headers: buildAuthHeaders() });
    if (!res.ok) {
      throw new Error(`Failed to fetch track page: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return data.individuals?.[0]?.locations || [];
  } catch (error) {
    console.error(error);
    return [];
  }
}
