import "server-only";

import type { StoryWorkspaceBatchEntry } from "@/lib/story-generation/read-story-status-snapshots";
import type { Character } from "@/lib/characters/types";
import {
  loadAllCharactersByEmail,
  loadAllFilmsByEmail,
  loadAllStoryWorkspacesByEmail,
  type StoryWorkspaceSnapshot,
} from "@/lib/admin/batch-loaders";
import { normalizeEmail } from "@/lib/db/normalize-email";
import { attachStoryToFilms } from "./catalog-films";
import { isUserShortPreviewFilm } from "./is-short-preview-film";
import type { FilmCharacterRef, UserFilm, UserFilmWithStory } from "./types";
import { normalizeFilmStatus } from "@/lib/i18n/film-labels";

export type AdminFilmEntry = UserFilmWithStory & {
  ownerEmail: string;
};

export type AdminFilmsByStatus = {
  awaiting: AdminFilmEntry[];
  completed: AdminFilmEntry[];
};

function isFilmAwaitingCreation(film: UserFilmWithStory): boolean {
  if (normalizeFilmStatus(film.status) === "ready") return false;
  if (isUserShortPreviewFilm(film)) return true;
  return Boolean(film.storyValidatedAt?.trim());
}

function isFilmCompleted(film: UserFilmWithStory): boolean {
  return normalizeFilmStatus(film.status) === "ready";
}

function sortByValidatedDesc(films: AdminFilmEntry[]): AdminFilmEntry[] {
  return films.sort(
    (a, b) =>
      new Date(b.storyValidatedAt ?? b.createdAt).getTime() -
      new Date(a.storyValidatedAt ?? a.createdAt).getTime()
  );
}

function sortCompletedDesc(films: AdminFilmEntry[]): AdminFilmEntry[] {
  return films.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function enrichFilmCharacters(
  characters: FilmCharacterRef[],
  liveCharacters: Character[]
): FilmCharacterRef[] {
  const byId = new Map(liveCharacters.map((character) => [character.id, character]));

  return characters.map((ref) => {
    const live = byId.get(ref.id);
    if (!live) return ref;

    return {
      ...ref,
      ...(!ref.photoSrc && live.photoSrc ? { photoSrc: live.photoSrc } : {}),
      ...(!ref.audioSrc && live.audioSrc ? { audioSrc: live.audioSrc } : {}),
    };
  });
}

function workspaceToBatchEntry(
  workspace: StoryWorkspaceSnapshot | undefined
): StoryWorkspaceBatchEntry {
  if (!workspace) {
    return { manifest: null, resume: null, tagline: null };
  }

  const resume = workspace.resume.trim();
  const tagline = workspace.tagline.trim();

  return {
    manifest: workspace.manifest,
    resume: resume.length > 0 ? resume : null,
    tagline: tagline.length > 0 ? tagline : null,
  };
}

function mergeFilmWithWorkspace(
  film: UserFilm,
  workspace: StoryWorkspaceSnapshot | undefined
): UserFilmWithStory {
  const entry = workspaceToBatchEntry(workspace);
  if (!entry.manifest && !entry.resume) {
    return film;
  }

  const { manifest, resume } = entry;

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

async function listAdminFilmsByStatusBatch(): Promise<AdminFilmsByStatus> {
  const [filmsByEmail, charactersByEmail, workspacesByEmail] = await Promise.all([
    loadAllFilmsByEmail(),
    loadAllCharactersByEmail(),
    loadAllStoryWorkspacesByEmail(),
  ]);

  const awaiting: AdminFilmEntry[] = [];
  const completed: AdminFilmEntry[] = [];

  for (const [email, films] of filmsByEmail) {
    if (films.length === 0) continue;

    const liveCharacters = charactersByEmail.get(email) ?? [];
    const workspaces = workspacesByEmail.get(email) ?? new Map();

    for (const film of films) {
      const withStory = mergeFilmWithWorkspace(film, workspaces.get(film.id));
      const enrichedFilm = {
        ...withStory,
        characters: enrichFilmCharacters(withStory.characters, liveCharacters),
      };

      if (isFilmAwaitingCreation(enrichedFilm)) {
        awaiting.push({ ...enrichedFilm, ownerEmail: email });
      } else if (isFilmCompleted(enrichedFilm)) {
        completed.push({ ...enrichedFilm, ownerEmail: email });
      }
    }
  }

  return {
    awaiting: sortByValidatedDesc(awaiting),
    completed: sortCompletedDesc(completed),
  };
}

export async function countAdminFilmsAwaiting(): Promise<number> {
  const { isDatabaseEnabled } = await import("@/lib/db/client");

  if (isDatabaseEnabled()) {
    const [filmsByEmail, workspacesByEmail] = await Promise.all([
      loadAllFilmsByEmail(),
      loadAllStoryWorkspacesByEmail(),
    ]);

    let count = 0;
    for (const [email, films] of filmsByEmail) {
      const workspaces = workspacesByEmail.get(email) ?? new Map();
      for (const film of films) {
        const withStory = mergeFilmWithWorkspace(film, workspaces.get(film.id));
        if (isFilmAwaitingCreation(withStory)) {
          count += 1;
        }
      }
    }
    return count;
  }

  const { awaiting } = await listAdminFilmsByStatus();
  return awaiting.length;
}

export async function listAdminFilmsByStatus(): Promise<AdminFilmsByStatus> {
  const { isDatabaseEnabled } = await import("@/lib/db/client");
  if (isDatabaseEnabled()) {
    return listAdminFilmsByStatusBatch();
  }

  const filmsByEmail = await loadAllFilmsByEmail();
  const emails = [...filmsByEmail.keys()];
  const awaiting: AdminFilmEntry[] = [];
  const completed: AdminFilmEntry[] = [];

  const [charactersByEmail] = await Promise.all([loadAllCharactersByEmail()]);

  await Promise.all(
    emails.map(async (email) => {
      const films = filmsByEmail.get(email) ?? [];
      if (films.length === 0) return;

      const liveCharacters = charactersByEmail.get(email) ?? [];
      const withStory = await attachStoryToFilms(normalizeEmail(email), films);

      for (const film of withStory) {
        const enrichedFilm = {
          ...film,
          characters: enrichFilmCharacters(film.characters, liveCharacters),
        };

        if (isFilmAwaitingCreation(enrichedFilm)) {
          awaiting.push({ ...enrichedFilm, ownerEmail: email });
        } else if (isFilmCompleted(enrichedFilm)) {
          completed.push({ ...enrichedFilm, ownerEmail: email });
        }
      }
    })
  );

  return {
    awaiting: sortByValidatedDesc(awaiting),
    completed: sortCompletedDesc(completed),
  };
}

/** @deprecated Utiliser listAdminFilmsByStatus */
export async function listFilmsAwaitingCreationForAdmin(): Promise<AdminFilmEntry[]> {
  const { awaiting } = await listAdminFilmsByStatus();
  return awaiting;
}
