import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/get-session";
import { tryAutoValidateStoryForFilm } from "@/lib/story-generation/story-auto-validation";

type RunAutoValidationBody = {
  filmId?: string;
};

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let body: RunAutoValidationBody;
  try {
    body = (await request.json()) as RunAutoValidationBody;
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  const filmId = body.filmId?.trim();
  if (!filmId) {
    return NextResponse.json({ error: "filmId requis" }, { status: 400 });
  }

  const validated = await tryAutoValidateStoryForFilm(session.email, filmId);
  return NextResponse.json({ ok: true, validated });
}
