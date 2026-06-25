import { cache } from "react";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { ensureSchema, getSql, isDatabaseEnabled } from "@/lib/db/client";
import { normalizeEmail } from "@/lib/db/normalize-email";
import {
  normalizeFilmStatus,
  normalizeFilmTheme,
  type FilmThemeId,
} from "@/lib/i18n/film-labels";
import type { UserFilm, UserFilmUpdatePatch } from "./types";

const DATA_DIR = path.join(process.cwd(), "data", "films");

function userFilePath(email: string): string {
  const safe = email.toLowerCase().replace(/[^a-z0-9]+/g, "_");
  return path.join(DATA_DIR, `${safe}.json`);
}

function normalizeFilm(raw: UserFilm & { characters?: UserFilm["characters"] }): UserFilm {
  const themes = (Array.isArray(raw.themes) ? raw.themes : [])
    .map((theme) => normalizeFilmTheme(String(theme)))
    .filter((theme): theme is FilmThemeId => theme != null);
  const uniqueThemes = [...new Set(themes)];

  return {
    ...raw,
    themes: uniqueThemes.length > 0 ? uniqueThemes : raw.themes,
    status: normalizeFilmStatus(String(raw.status)) ?? raw.status,
    characters: Array.isArray(raw.characters) ? raw.characters : [],
  };
}

async function readFilmsFile(email: string): Promise<UserFilm[]> {
  try {
    const raw = await readFile(userFilePath(email), "utf8");
    const parsed = JSON.parse(raw) as UserFilm[];
    return Array.isArray(parsed) ? parsed.map(normalizeFilm) : [];
  } catch {
    return [];
  }
}

async function writeFilmsFile(email: string, films: UserFilm[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(userFilePath(email), JSON.stringify(films, null, 2), "utf8");
}

async function readFilmsDb(email: string): Promise<UserFilm[]> {
  await ensureSchema();
  const db = getSql();
  const rows = await db<{ data: UserFilm }[]>`
    SELECT data FROM films WHERE user_email = ${email}
  `;
  return rows.map((row) => normalizeFilm(row.data));
}

async function upsertFilmDb(email: string, film: UserFilm): Promise<void> {
  await ensureSchema();
  const db = getSql();
  await db`
    INSERT INTO films (user_email, id, data, created_at)
    VALUES (${email}, ${film.id}, ${db.json(film)}, ${film.createdAt})
    ON CONFLICT (user_email, id)
    DO UPDATE SET data = ${db.json(film)}
  `;
}

async function readFilms(email: string): Promise<UserFilm[]> {
  const normalized = normalizeEmail(email);
  if (isDatabaseEnabled()) {
    return readFilmsDb(normalized);
  }
  return readFilmsFile(normalized);
}

function sortFilms(films: UserFilm[]): UserFilm[] {
  return films.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function listUserFilms(email: string): Promise<UserFilm[]> {
  return sortFilms(await readFilms(email));
}

/** Dédupliqué par requête RSC (Mon espace, création film, etc.). */
export const listUserFilmsForUser = cache(listUserFilms);

export async function addUserFilm(email: string, film: UserFilm): Promise<UserFilm[]> {
  const normalized = normalizeEmail(email);

  if (isDatabaseEnabled()) {
    await upsertFilmDb(normalized, film);
    return listUserFilms(normalized);
  }

  const films = await readFilmsFile(normalized);
  films.push(film);
  await writeFilmsFile(normalized, films);
  return listUserFilms(normalized);
}

export async function getUserFilmById(
  email: string,
  filmId: string
): Promise<UserFilm | null> {
  const films = await readFilms(email);
  return films.find((film) => film.id === filmId) ?? null;
}

export async function updateUserFilm(
  email: string,
  filmId: string,
  patch: UserFilmUpdatePatch
): Promise<UserFilm | null> {
  const normalized = normalizeEmail(email);
  const films = await readFilms(normalized);
  const index = films.findIndex((film) => film.id === filmId);
  if (index < 0) return null;

  const nextThemes = patch.themes
    ? patch.themes
        .map((theme) => normalizeFilmTheme(String(theme)))
        .filter((theme): theme is FilmThemeId => theme != null)
    : undefined;

  const updated: UserFilm = {
    ...films[index]!,
    ...patch,
    ...(nextThemes && nextThemes.length > 0 ? { themes: nextThemes } : {}),
  };

  if (isDatabaseEnabled()) {
    await upsertFilmDb(normalized, updated);
    return updated;
  }

  films[index] = updated;
  await writeFilmsFile(normalized, films);
  return updated;
}
