import {
  getAdminClientDetails,
  listAdminClientSummaries,
} from "@/lib/admin/clients";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { getServerLocale } from "@/lib/i18n/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email")?.trim();

  if (email) {
    const details = await getAdminClientDetails(email);
    if (!details) {
      return NextResponse.json({ error: "Client introuvable." }, { status: 404 });
    }
    return NextResponse.json(details);
  }

  const locale = await getServerLocale();
  const clients = await listAdminClientSummaries(locale);
  return NextResponse.json(clients);
}
