import { getSession } from "@/lib/auth/get-session";
import { listUserFilms } from "@/lib/film-creation/store";
import { filmNeedsStoryPoll } from "@/lib/film-creation/story-poll";
import type { UserFilmWithStory } from "@/lib/film-creation/types";
import { readStoryStatusSnapshots } from "@/lib/story-generation/read-story-status-snapshots";
import type { FilmStoryStatusSnapshot } from "@/lib/story-generation/story-status";
import { NextResponse } from "next/server";

function parseFilmIds(raw: string | null): string[] {
  if (!raw?.trim()) return [];
  return [...new Set(raw.split(",").map((id) => id.trim()).filter(Boolean))];
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const requestedIds = parseFilmIds(searchParams.get("filmIds"));

  if (requestedIds.length === 0) {
    return NextResponse.json({ films: [] satisfies FilmStoryStatusSnapshot[] });
  }

  const ownedFilms = await listUserFilms(session.email);
  const ownedById = new Map(ownedFilms.map((film) => [film.id, film]));

  const pollableIds = requestedIds.filter((filmId) => {
    const film = ownedById.get(filmId);
    if (!film) return false;
    return filmNeedsStoryPoll(film as UserFilmWithStory);
  });

  const films = await readStoryStatusSnapshots(session.email, pollableIds);

  return NextResponse.json(
    { films },
    {
      headers: {
        "Cache-Control": "private, no-store",
      },
    }
  );
}
