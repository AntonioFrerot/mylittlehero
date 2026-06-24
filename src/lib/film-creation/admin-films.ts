import { ensureSchema, getSql, isDatabaseEnabled } from "@/lib/db/client";
import { normalizeEmail } from "@/lib/db/normalize-email";
import { attachStoryToFilms } from "./catalog-films";
import { isUserFreeTrialFilm } from "./is-free-trial-film";
import { listUserFilms } from "./store";
import type { UserFilmWithStory } from "./types";
import { normalizeFilmStatus } from "@/lib/i18n/film-labels";

export type AdminFilmEntry = UserFilmWithStory & {
  ownerEmail: string;
};

export type AdminFilmsByStatus = {
  awaiting: AdminFilmEntry[];
  completed: AdminFilmEntry[];
};

function isFilmAwaitingCreation(film: UserFilmWithStory): boolean {
  if (isUserFreeTrialFilm(film)) return false;
  if (normalizeFilmStatus(film.status) === "ready") return false;
  return Boolean(film.storyValidatedAt?.trim());
}

function isFilmCompleted(film: UserFilmWithStory): boolean {
  if (isUserFreeTrialFilm(film)) return false;
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

export async function listAdminFilmsByStatus(): Promise<AdminFilmsByStatus> {
  const emails = await listAllOwnerEmails();
  const awaiting: AdminFilmEntry[] = [];
  const completed: AdminFilmEntry[] = [];

  for (const email of emails) {
    const films = await listUserFilms(email);
    if (films.length === 0) continue;

    const withStory = await attachStoryToFilms(email, films);
    for (const film of withStory) {
      if (isFilmAwaitingCreation(film)) {
        awaiting.push({ ...film, ownerEmail: email });
      } else if (isFilmCompleted(film)) {
        completed.push({ ...film, ownerEmail: email });
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
