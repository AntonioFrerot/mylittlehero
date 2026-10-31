import {
  getAdminClientDetails,
  listAdminClientSummaries,
} from "@/lib/admin/clients";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { isAdminEmail } from "@/lib/auth/is-admin";
import { deleteRegisteredUser } from "@/lib/auth/users-store";
import { normalizeEmail } from "@/lib/db/normalize-email";
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

export async function DELETE(request: Request) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  let emailRaw: string | null = null;
  try {
    const body = (await request.json()) as { email?: unknown };
    if (typeof body.email === "string") emailRaw = body.email;
  } catch {
    emailRaw = new URL(request.url).searchParams.get("email");
  }

  const email = normalizeEmail(emailRaw ?? "");
  if (!email) {
    return NextResponse.json({ error: "missing_email" }, { status: 400 });
  }
  if (isAdminEmail(email)) {
    return NextResponse.json({ error: "cannot_delete_admin" }, { status: 403 });
  }

  const removed = await deleteRegisteredUser(email);
  if (!removed) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, email });
}
