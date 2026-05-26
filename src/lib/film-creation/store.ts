import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { UserFilm } from "./types";

const DATA_DIR = path.join(process.cwd(), "data", "films");

function userFilePath(email: string): string {
  const safe = email.toLowerCase().replace(/[^a-z0-9]+/g, "_");
  return path.join(DATA_DIR, `${safe}.json`);
}

function normalizeFilm(raw: UserFilm & { characters?: UserFilm["characters"] }): UserFilm {
  return {
    ...raw,
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
