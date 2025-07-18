// apps/web/app/api/wildlife/tracks/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCachedPoints, fetchAndCache } from "@/lib/services/wildlife-service.server";

export async function GET(req: NextRequest) {
  const qp = req.nextUrl.searchParams;
  const studyId = Number(qp.get("studyId"));
  const individualId = qp.get("individualId")!;
  const start = qp.get("start")!;
  const end = qp.get("end")!;
  if (!studyId || !individualId || !start || !end) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  // 1) try cached
  let pts = await getCachedPoints(studyId, individualId, start, end);

  // 2) if none in cache, fetch+cache
  if (!pts.length) {
    pts = await fetchAndCache(studyId, individualId, start, end);
  }
  return NextResponse.json(pts);
}
