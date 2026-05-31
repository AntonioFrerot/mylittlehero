import { getSession } from "@/lib/auth/get-session";
import { readStoryManifest } from "@/lib/story-generation/manifest";
import { listUserFilms } from "./store";
import type { UserFilm, UserFilmWithStory } from "./types";

export async function attachStoryToFilms(
  email: string,
  films: UserFilm[]
): Promise<UserFilmWithStory[]> {
  return Promise.all(
    films.map(async (film) => {
      const manifest = await readStoryManifest(email, film.id);
      if (!manifest) return film;
      return {
        ...film,
        storyGeneration: {
          status: manifest.status,
          ...(manifest.generationMode
            ? { mode: manifest.generationMode }
            : {}),
          ...(manifest.generationError
            ? { error: manifest.generationError }
            : {}),
        },
      };
    })
  );
}

/** Films du compte connecté, pour le catalogue par thème. */
export async function getCatalogFilmsForSession(): Promise<UserFilmWithStory[]> {
  const session = await getSession();
  if (!session) return [];

  const films = await listUserFilms(session.email);
  return attachStoryToFilms(session.email, films);
}
