import { requireAdminApi } from "@/lib/admin/require-admin-api";
import {
  emptyContactMessageTrash,
  listContactMessages,
  trashContactMessage,
  type ContactMessageBox,
} from "@/lib/contact/store";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function parseBox(value: string | null): ContactMessageBox {
  return value === "trash" ? "trash" : "inbox";
}

export async function GET(request: Request) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  const box = parseBox(new URL(request.url).searchParams.get("box"));
  const messages = await listContactMessages(box);
  return NextResponse.json(messages);
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
    const removed = await emptyContactMessageTrash();
    return NextResponse.json({ ok: true, removed });
  }

  if (action === "trash") {
    const messageId =
      typeof body === "object" && body !== null && "messageId" in body
        ? String((body as { messageId: unknown }).messageId)
        : "";
    const ok = await trashContactMessage(messageId);
    if (!ok) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "unknown_action" }, { status: 400 });
}
