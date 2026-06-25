import type { UserFilm, UserFilmWithStory } from "@/lib/film-creation/types";
import { getSession } from "@/lib/auth/get-session";
import { listUserFilms } from "@/lib/film-creation/store";
import {
  readStoryWorkspacesBatch,
  type StoryWorkspaceBatchEntry,
} from "@/lib/story-generation/read-story-status-snapshots";
import type { StoryWorkspaceManifest } from "@/lib/story-generation/types";

function mergeFilmWithStoryWorkspace(
  film: UserFilm,
  workspace: StoryWorkspaceBatchEntry | undefined
): UserFilmWithStory {
  if (!workspace?.manifest && !workspace?.resume) {
    return film;
  }

  const { manifest, resume } = workspace;

  return {
    ...film,
    ...(resume ? { storyResume: resume } : {}),
    ...(manifest?.generatedTitle
      ? { storyGeneratedTitle: manifest.generatedTitle }
      : {}),
    ...(manifest?.storyValidatedAt
      ? { storyValidatedAt: manifest.storyValidatedAt }
      : {}),
    ...(manifest?.generationCompletedAt
      ? { storyGenerationCompletedAt: manifest.generationCompletedAt }
      : {}),
    ...(manifest?.regenerationUsed ? { storyRegenerationUsed: true } : {}),
    ...(manifest
      ? {
          storyGeneration: {
            status: manifest.status,
            ...(manifest.generationMode ? { mode: manifest.generationMode } : {}),
            ...(manifest.generationError
              ? { error: manifest.generationError }
              : {}),
          },
        }
      : {}),
  };
}

export async function attachStoryToFilms(
  email: string,
  films: UserFilm[]
): Promise<UserFilmWithStory[]> {
  if (films.length === 0) return [];

  const workspaces = await readStoryWorkspacesBatch(
    email,
    films.map((film) => film.id)
  );

  return films.map((film) =>
    mergeFilmWithStoryWorkspace(film, workspaces.get(film.id))
  );
}

/** Données histoire pour une page film (1 requête DB ou lectures parallèles). */
export async function attachStoryToFilm(
  email: string,
  film: UserFilm
): Promise<{
  filmWithStory: UserFilmWithStory;
  resume: string | null;
  tagline: string | null;
  manifest: StoryWorkspaceManifest | null;
}> {
  const workspaces = await readStoryWorkspacesBatch(email, [film.id]);
  const workspace = workspaces.get(film.id);
  const filmWithStory = mergeFilmWithStoryWorkspace(film, workspace);

  return {
    filmWithStory,
    resume: workspace?.resume ?? null,
    tagline: workspace?.tagline ?? null,
    manifest: workspace?.manifest ?? null,
  };
}

/** Films du compte connecté, pour le catalogue par thème. */
export async function getCatalogFilmsForSession(): Promise<UserFilmWithStory[]> {
  const session = await getSession();
  if (!session) return [];

  const films = await listUserFilms(session.email);
  return attachStoryToFilms(session.email, films);
}
