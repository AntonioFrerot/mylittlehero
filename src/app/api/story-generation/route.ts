import { NextResponse } from "next/server";
import { runStoryGeneration } from "@/lib/story-generation/run-generation";

export const maxDuration = 300;

type StoryGenerationBody = {
  email?: string;
  filmId?: string;
};

export async function POST(request: Request) {
  const secret = process.env.STORY_GENERATION_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { error: "STORY_GENERATION_SECRET non configuré" },
      { status: 503 }
    );
  }

  const header = request.headers.get("x-story-generation-secret");
  if (header !== secret) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let body: StoryGenerationBody;
  try {
    body = (await request.json()) as StoryGenerationBody;
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  const email = body.email?.trim();
  const filmId = body.filmId?.trim();
  if (!email || !filmId) {
    return NextResponse.json(
      { error: "email et filmId requis" },
      { status: 400 }
    );
  }

  const result = await runStoryGeneration(email, filmId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? "Échec" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
