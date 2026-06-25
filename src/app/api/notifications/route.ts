import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/get-session";
import {
  countUnreadNotifications,
  listNotificationsForUser,
} from "@/lib/notifications/store";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const [notifications, unreadCount] = await Promise.all([
    listNotificationsForUser(session.email),
    countUnreadNotifications(session.email),
  ]);

  return NextResponse.json({ notifications, unreadCount });
}
