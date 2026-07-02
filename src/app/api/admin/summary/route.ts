import { loadAdminDashboardSummary } from "@/lib/admin/summary";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  const summary = await loadAdminDashboardSummary();
  return NextResponse.json(summary);
}
