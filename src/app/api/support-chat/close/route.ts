import { closeSupportConversation } from "@/lib/support-chat/store";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const conversationId =
    typeof body === "object" && body !== null && "conversationId" in body
      ? String((body as { conversationId: unknown }).conversationId).trim()
      : "";

  if (!conversationId) {
    return NextResponse.json({ error: "missing_conversation" }, { status: 400 });
  }

  const updated = await closeSupportConversation(conversationId, "client");
  if (!updated) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const closingMessage = updated.messages.at(-1)?.content ?? null;

  return NextResponse.json({
    ok: true,
    closed: true,
    closingMessage,
  });
}
