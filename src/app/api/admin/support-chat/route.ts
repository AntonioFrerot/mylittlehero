import { requireAdminApi } from "@/lib/admin/require-admin-api";
import {
  appendStaffSupportMessage,
  closeSupportConversation,
  countSupportConversationsNeedingAttention,
  getSupportConversationById,
  groupConversationsByClient,
  listSupportChatConversationsForAdmin,
  setSupportHumanTakeover,
} from "@/lib/support-chat/store";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  const sinceRaw = new URL(request.url).searchParams.get("since")?.trim();
  const sinceMs = sinceRaw ? Date.parse(sinceRaw) : Number.NaN;

  const conversations = await listSupportChatConversationsForAdmin();
  const clients = groupConversationsByClient(conversations);
  const updatedConversationIds =
    sinceRaw && !Number.isNaN(sinceMs)
      ? conversations
          .filter((entry) => Date.parse(entry.updatedAt) > sinceMs)
          .map((entry) => entry.id)
      : [];

  return NextResponse.json({
    clients,
    updatedConversationIds,
    needsAttentionCount: countSupportConversationsNeedingAttention(conversations),
    serverTime: new Date().toISOString(),
  });
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
  const conversationId =
    typeof body === "object" && body !== null && "conversationId" in body
      ? String((body as { conversationId: unknown }).conversationId).trim()
      : "";

  if (!conversationId) {
    return NextResponse.json({ error: "missing_conversation" }, { status: 400 });
  }

  if (action === "takeover") {
    const prior = await getSupportConversationById(conversationId);
    if (!prior) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    if (prior.closedAt) {
      return NextResponse.json({ error: "conversation_closed" }, { status: 409 });
    }
    const updated = await setSupportHumanTakeover(
      conversationId,
      auth.email,
      true
    );
    if (!updated) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, conversation: updated });
  }

  if (action === "release") {
    const updated = await setSupportHumanTakeover(
      conversationId,
      auth.email,
      false
    );
    if (!updated) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, conversation: updated });
  }

  if (action === "close") {
    const existing = await getSupportConversationById(conversationId);
    if (!existing) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    if (existing.closedAt) {
      return NextResponse.json({ ok: true, conversation: existing });
    }
    const updated = await closeSupportConversation(conversationId, "admin");
    if (!updated) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, conversation: updated });
  }

  if (action === "reply") {
    const message =
      typeof body === "object" && body !== null && "message" in body
        ? String((body as { message: unknown }).message)
        : "";
    const existing = await getSupportConversationById(conversationId);
    if (!existing?.humanTakeover || existing.closedAt) {
      return NextResponse.json({ error: "takeover_required" }, { status: 409 });
    }
    const updated = await appendStaffSupportMessage(
      conversationId,
      auth.email,
      message
    );
    if (!updated) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, conversation: updated });
  }

  return NextResponse.json({ error: "unknown_action" }, { status: 400 });
}
