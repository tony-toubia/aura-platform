import { NextResponse } from "next/server";
// Import the new function that gets the hard-coded data
import { getKnownStudies } from "@/lib/services/movebank-service";

export interface CombinedIndividual {
  studyId: number;
  individualId: string;
  label: string;
}

export async function GET() {
  try {
    // 1. Get the fully hard-coded list of studies and their individuals.
    const studies = await getKnownStudies();

    if (!studies || !studies.length) {
      console.warn("The hard-coded study list is empty.");
      return NextResponse.json([]);
    }

    const allIndividuals: CombinedIndividual[] = [];

    // 2. Loop through the static data and format it for the dropdown.
    // This makes NO external API calls.
    for (const study of studies) {
      const formattedIndividuals = study.individuals.map((individualId: string): CombinedIndividual => ({
        studyId: study.id,
        individualId: individualId,
        label: `${individualId} (${study.name})`,
      }));
      allIndividuals.push(...formattedIndividuals);
    }

    console.log(`Successfully formatted ${allIndividuals.length} individuals from the hard-coded list.`);
    return NextResponse.json(allIndividuals);

  } catch (err) {
    console.error("API /wildlife/all-individuals error:", err);
    return NextResponse.json([], { status: 500 });
  }
}
