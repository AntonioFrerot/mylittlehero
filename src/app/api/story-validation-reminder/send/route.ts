import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/get-session";
import { trySendValidationReminderForFilm } from "@/lib/notifications/story-validation-reminder";

type SendReminderBody = {
  filmId?: string;
};

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let body: SendReminderBody;
  try {
    body = (await request.json()) as SendReminderBody;
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  const filmId = body.filmId?.trim();
  if (!filmId) {
    return NextResponse.json({ error: "filmId requis" }, { status: 400 });
  }

  const sent = await trySendValidationReminderForFilm(session.email, filmId);
  return NextResponse.json({ ok: true, sent });
}
