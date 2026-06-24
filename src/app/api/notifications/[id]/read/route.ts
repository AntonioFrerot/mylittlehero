import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/get-session";
import { markNotificationRead } from "@/lib/notifications/store";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id?.trim()) {
    return NextResponse.json({ error: "Notification introuvable" }, { status: 400 });
  }

  const ok = await markNotificationRead(session.email, id.trim());
  if (!ok) {
    return NextResponse.json({ error: "Notification introuvable" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
