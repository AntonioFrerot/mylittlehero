import { generateSupportReply } from "@/lib/support-chat/assistant";
import type { ChatMessage } from "@/lib/support-chat/types";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function parseMessages(body: unknown): ChatMessage[] | null {
  if (!body || typeof body !== "object") return null;
  const raw = (body as { messages?: unknown }).messages;
  if (!Array.isArray(raw)) return null;

  const messages: ChatMessage[] = [];
  for (const item of raw) {
    if (
      item &&
      typeof item === "object" &&
      (item as ChatMessage).role === "user" &&
      typeof (item as ChatMessage).content === "string"
    ) {
      const content = (item as ChatMessage).content.trim().slice(0, 2000);
      if (content) messages.push({ role: "user", content });
    }
    if (
      item &&
      typeof item === "object" &&
      (item as ChatMessage).role === "assistant" &&
      typeof (item as ChatMessage).content === "string"
    ) {
      const content = (item as ChatMessage).content.trim().slice(0, 4000);
      if (content) messages.push({ role: "assistant", content });
    }
  }

  return messages.length > 0 ? messages : null;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const messages = parseMessages(body);
  if (!messages) {
    return NextResponse.json(
      { error: "Envoyez au moins un message." },
      { status: 400 }
    );
  }

  const last = messages[messages.length - 1];
  if (last.role !== "user") {
    return NextResponse.json(
      { error: "Le dernier message doit être le vôtre." },
      { status: 400 }
    );
  }

  const { reply, source } = await generateSupportReply(messages);

  return NextResponse.json({ reply, source });
}
