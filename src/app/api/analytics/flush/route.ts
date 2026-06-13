import { NextResponse } from "next/server";
import { flushVisits } from "@/lib/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Flush Redis visit counters into VisitAggregate. Intended to be hit by a
 * scheduled job (cron) periodically; idempotent and safe to call often.
 */
export async function POST() {
  const flushed = await flushVisits();
  return NextResponse.json({ flushed });
}

export async function GET() {
  const flushed = await flushVisits();
  return NextResponse.json({ flushed });
}
