import { ensureSchema, getSql, isDatabaseEnabled } from "@/lib/db/client";
import { normalizeEmail } from "@/lib/db/normalize-email";
import { listUserFilms } from "@/lib/film-creation/store";
import { isUserFreeTrialFilm } from "@/lib/film-creation/is-free-trial-film";
import { readStoryManifest } from "@/lib/story-generation/manifest";
import { normalizeFilmStatus } from "@/lib/i18n/film-labels";
import type { AdminNotificationTarget } from "./types";

function parseEmailList(raw: string): string[] {
  return [
    ...new Set(
      raw
        .split(/[\s,;]+/)
        .map((part) => normalizeEmail(part.trim()))
        .filter(Boolean)
    ),
  ];
}

async function listAllUserEmails(): Promise<string[]> {
  if (!isDatabaseEnabled()) return [];
  await ensureSchema();
  const db = getSql();
  const rows = await db<{ email: string }[]>`
    SELECT email FROM users ORDER BY email ASC
  `;
  return rows.map((row) => normalizeEmail(row.email));
}

async function listEmailsWithFilms(): Promise<string[]> {
  if (!isDatabaseEnabled()) return [];
  await ensureSchema();
  const db = getSql();
  const rows = await db<{ user_email: string }[]>`
    SELECT DISTINCT user_email FROM films ORDER BY user_email ASC
  `;
  return rows.map((row) => normalizeEmail(row.user_email));
}

async function listEmailsWithReadyFilms(): Promise<string[]> {
  const emails = await listEmailsWithFilms();
  const matched: string[] = [];

  for (const email of emails) {
    const films = await listUserFilms(email);
    if (films.some((film) => normalizeFilmStatus(film.status) === "ready")) {
      matched.push(email);
    }
  }

  return matched;
}

async function listEmailsWithFilmAwaitingDelivery(): Promise<string[]> {
  const emails = await listEmailsWithFilms();
  const matched: string[] = [];

  for (const email of emails) {
    const films = await listUserFilms(email);
    for (const film of films) {
      if (isUserFreeTrialFilm(film)) continue;
      if (normalizeFilmStatus(film.status) === "ready") continue;
      const manifest = await readStoryManifest(email, film.id);
      if (manifest?.storyValidatedAt) {
        matched.push(email);
        break;
      }
    }
  }

  return matched;
}

export async function resolveAdminNotificationTargets(input: {
  target: AdminNotificationTarget;
  emailsRaw?: string;
}): Promise<string[]> {
  switch (input.target) {
    case "all":
      return listAllUserEmails();
    case "emails":
      return parseEmailList(input.emailsRaw ?? "");
    case "has_films":
      return listEmailsWithFilms();
    case "has_ready_film":
      return listEmailsWithReadyFilms();
    case "has_film_awaiting_delivery":
      return listEmailsWithFilmAwaitingDelivery();
    default:
      return [];
  }
}
