import { NextResponse } from "next/server";
import { getCurrentDashboardUser } from "@/lib/auth/context";
import { can } from "@/lib/auth/rbac";
import { getDashboardAnalytics } from "@/lib/analyticsQueries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentDashboardUser();
  if (!user || !can(user.role, "analytics.view")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = await getDashboardAnalytics();
  return NextResponse.json(data);
}
