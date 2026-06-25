import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/get-session";
import { markAllNotificationsRead } from "@/lib/notifications/store";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const marked = await markAllNotificationsRead(session.email);
  return NextResponse.json({ ok: true, marked });
}
