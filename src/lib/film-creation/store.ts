import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
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

async function readFilms(email: string): Promise<UserFilm[]> {
  try {
    const raw = await readFile(userFilePath(email), "utf8");
    const parsed = JSON.parse(raw) as UserFilm[];
    return Array.isArray(parsed) ? parsed.map(normalizeFilm) : [];
  } catch {
    return [];
  }
}

async function writeFilms(email: string, films: UserFilm[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(userFilePath(email), JSON.stringify(films, null, 2), "utf8");
}

export async function listUserFilms(email: string): Promise<UserFilm[]> {
  const films = await readFilms(email);
  return films.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function addUserFilm(email: string, film: UserFilm): Promise<UserFilm[]> {
  const films = await readFilms(email);
  films.push(film);
  await writeFilms(email, films);
  return listUserFilms(email);
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
  const films = await readFilms(email);
  const index = films.findIndex((film) => film.id === filmId);
  if (index < 0) return null;

  const nextThemes = patch.themes
    ? patch.themes
        .map((theme) => normalizeFilmTheme(String(theme)))
        .filter((theme): theme is FilmThemeId => theme != null)
    : undefined;

  films[index] = {
    ...films[index],
    ...patch,
    ...(nextThemes && nextThemes.length > 0 ? { themes: nextThemes } : {}),
  };
  await writeFilms(email, films);
  return films[index];
}
