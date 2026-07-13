import { NextResponse } from "next/server";
import { processStoryAutoValidations } from "@/lib/story-generation/story-auto-validation";

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

  const validated = await processStoryAutoValidations();
  return NextResponse.json({ ok: true, validated });
}
