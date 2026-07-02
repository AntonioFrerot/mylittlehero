import { listAdminFilmsByStatus } from "@/lib/film-creation/admin-films";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  const films = await listAdminFilmsByStatus();
  return NextResponse.json(films);
}
