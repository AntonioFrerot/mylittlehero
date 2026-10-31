import {
  getAdminClientDetails,
  listAdminClientSummaries,
  type AdminClientAccountBox,
} from "@/lib/admin/clients";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { isAdminEmail } from "@/lib/auth/is-admin";
import {
  emptyUserAccountTrash,
  restoreUserAccount,
  trashUserAccount,
} from "@/lib/auth/users-store";
import { normalizeEmail } from "@/lib/db/normalize-email";
import { getServerLocale } from "@/lib/i18n/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function parseBox(value: string | null): AdminClientAccountBox {
  return value === "trash" ? "trash" : "inbox";
}

export async function GET(request: Request) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email")?.trim();
  const box = parseBox(searchParams.get("box"));

  if (email) {
    const details = await getAdminClientDetails(email);
    if (!details) {
      return NextResponse.json({ error: "Client introuvable." }, { status: 404 });
    }
    return NextResponse.json(details);
  }

  const locale = await getServerLocale();
  const clients = await listAdminClientSummaries(locale, box);
  return NextResponse.json(clients);
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const action =
    typeof body === "object" && body !== null && "action" in body
      ? String((body as { action: unknown }).action)
      : "";

  if (action === "emptyTrash") {
    const removed = await emptyUserAccountTrash();
    return NextResponse.json({ ok: true, removed });
  }

  if (action === "restore") {
    const emailRaw =
      typeof body === "object" && body !== null && "email" in body
        ? String((body as { email: unknown }).email)
        : "";
    const email = normalizeEmail(emailRaw);
    if (!email) {
      return NextResponse.json({ error: "missing_email" }, { status: 400 });
    }
    if (isAdminEmail(email)) {
      return NextResponse.json({ error: "cannot_restore_admin" }, { status: 403 });
    }
    const ok = await restoreUserAccount(email);
    if (!ok) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, email });
  }

  if (action === "trash") {
    const emailRaw =
      typeof body === "object" && body !== null && "email" in body
        ? String((body as { email: unknown }).email)
        : "";
    const email = normalizeEmail(emailRaw);
    if (!email) {
      return NextResponse.json({ error: "missing_email" }, { status: 400 });
    }
    if (isAdminEmail(email)) {
      return NextResponse.json({ error: "cannot_delete_admin" }, { status: 403 });
    }
    const ok = await trashUserAccount(email);
    if (!ok) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, email });
  }

  return NextResponse.json({ error: "unknown_action" }, { status: 400 });
}

/** @deprecated Préférez POST { action: "trash" } */
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

  const ok = await trashUserAccount(email);
  if (!ok) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, email });
}
