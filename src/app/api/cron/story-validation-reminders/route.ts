import { NextResponse } from "next/server";
import { processStoryValidationReminders } from "@/lib/notifications/story-validation-reminder";

function isAuthorizedCronRequest(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;

  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const sent = await processStoryValidationReminders();
  return NextResponse.json({ ok: true, sent });
}
