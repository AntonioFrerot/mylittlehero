import { ensureSchema, getSql, isDatabaseEnabled } from "@/lib/db/client";
import { normalizeEmail } from "@/lib/db/normalize-email";
import { listCharacters } from "@/lib/characters/store";
import type { Character } from "@/lib/characters/types";
import { attachStoryToFilms } from "./catalog-films";
import { isUserShortPreviewFilm } from "./is-short-preview-film";
import { listUserFilms } from "./store";
import type { FilmCharacterRef, UserFilmWithStory } from "./types";
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

async function listAllOwnerEmails(): Promise<string[]> {
  if (isDatabaseEnabled()) {
    await ensureSchema();
    const db = getSql();
    const rows = await db<{ user_email: string }[]>`
      SELECT DISTINCT user_email FROM films
    `;
    return rows.map((row) => normalizeEmail(row.user_email));
  }

  const { readFile } = await import("node:fs/promises");
  const path = await import("node:path");
  try {
    const raw = await readFile(
      path.join(process.cwd(), "data", "users.json"),
      "utf8"
    );
    const parsed = JSON.parse(raw) as { email: string }[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((user) => normalizeEmail(user.email));
  } catch {
    return [];
  }
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

export async function listAdminFilmsByStatus(): Promise<AdminFilmsByStatus> {
  const emails = await listAllOwnerEmails();
  const awaiting: AdminFilmEntry[] = [];
  const completed: AdminFilmEntry[] = [];

  for (const email of emails) {
    const films = await listUserFilms(email);
    if (films.length === 0) continue;

    const liveCharacters = await listCharacters(email);
    const withStory = await attachStoryToFilms(email, films);
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
  }

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
