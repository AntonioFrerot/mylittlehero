import { getSupportConversationById } from "@/lib/support-chat/store";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const conversationId = params.get("conversationId")?.trim() ?? "";
  const since = params.get("since")?.trim() ?? "";

  if (!conversationId) {
    return NextResponse.json({ error: "missing_conversation" }, { status: 400 });
  }

  const conversation = await getSupportConversationById(conversationId);
  if (!conversation) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const sinceMs = since ? Date.parse(since) : 0;
  const messages = conversation.messages.filter((message) => {
    if (!since || Number.isNaN(sinceMs)) return true;
    return Date.parse(message.createdAt) > sinceMs;
  });

  return NextResponse.json({
    conversationId: conversation.id,
    humanTakeover: conversation.humanTakeover,
    closed: Boolean(conversation.closedAt),
    closedAt: conversation.closedAt,
    messages,
    updatedAt: conversation.updatedAt,
  });
}
