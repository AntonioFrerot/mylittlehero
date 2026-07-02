import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Character } from "@/lib/characters/types";
import { ensureSchema, getSql, isDatabaseEnabled } from "@/lib/db/client";
import { normalizeEmail } from "@/lib/db/normalize-email";
import {
  normalizeFilmStatus,
  normalizeFilmTheme,
  type FilmThemeId,
} from "@/lib/i18n/film-labels";
import type { UserFilm } from "@/lib/film-creation/types";
import type { StoryWorkspaceManifest } from "@/lib/story-generation/types";

export type StoryWorkspaceSnapshot = {
  manifest: StoryWorkspaceManifest;
  resume: string;
  tagline: string;
};

function normalizeFilm(raw: UserFilm): UserFilm {
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

const FILMS_DIR = path.join(process.cwd(), "data", "films");
const CHARACTERS_DIR = path.join(process.cwd(), "data", "characters");
const USERS_FILE = path.join(process.cwd(), "data", "users.json");

function userFileStem(email: string): string {
  return email.toLowerCase().replace(/[^a-z0-9]+/g, "_");
}

async function listUserEmailsFromFile(): Promise<string[]> {
  try {
    const raw = await readFile(USERS_FILE, "utf8");
    const parsed = JSON.parse(raw) as { email: string }[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((user) => normalizeEmail(user.email));
  } catch {
    return [];
  }
}

async function readFilmsFile(email: string): Promise<UserFilm[]> {
  try {
    const raw = await readFile(
      path.join(FILMS_DIR, `${userFileStem(email)}.json`),
      "utf8"
    );
    const parsed = JSON.parse(raw) as UserFilm[];
    return Array.isArray(parsed) ? parsed.map(normalizeFilm) : [];
  } catch {
    return [];
  }
}

async function readCharactersFile(email: string): Promise<Character[]> {
  try {
    const raw = await readFile(
      path.join(CHARACTERS_DIR, `${userFileStem(email)}.json`),
      "utf8"
    );
    const parsed = JSON.parse(raw) as Character[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function sortFilms(films: UserFilm[]): UserFilm[] {
  return films.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function loadAllFilmsByEmail(): Promise<Map<string, UserFilm[]>> {
  const map = new Map<string, UserFilm[]>();

  if (isDatabaseEnabled()) {
    await ensureSchema();
    const db = getSql();
    const rows = await db<{ user_email: string; data: UserFilm }[]>`
      SELECT user_email, data FROM films
    `;
    for (const row of rows) {
      const email = normalizeEmail(row.user_email);
      const films = map.get(email) ?? [];
      films.push(normalizeFilm(row.data));
      map.set(email, films);
    }
    for (const [email, films] of map) {
      map.set(email, sortFilms(films));
    }
    return map;
  }

  const emails = await listUserEmailsFromFile();
  await Promise.all(
    emails.map(async (email) => {
      const films = sortFilms(await readFilmsFile(email));
      if (films.length > 0) {
        map.set(email, films);
      }
    })
  );

  return map;
}

export async function loadAllCharactersByEmail(): Promise<
  Map<string, Character[]>
> {
  const map = new Map<string, Character[]>();

  if (isDatabaseEnabled()) {
    await ensureSchema();
    const db = getSql();
    const rows = await db<{ user_email: string; data: Character }[]>`
      SELECT user_email, data FROM characters
    `;
    for (const row of rows) {
      const email = normalizeEmail(row.user_email);
      const characters = map.get(email) ?? [];
      characters.push(row.data);
      map.set(email, characters);
    }
    return map;
  }

  const emails = await listUserEmailsFromFile();
  await Promise.all(
    emails.map(async (email) => {
      const characters = await readCharactersFile(email);
      if (characters.length > 0) {
        map.set(email, characters);
      }
    })
  );

  return map;
}

export async function loadAllStoryWorkspacesByEmail(): Promise<
  Map<string, Map<string, StoryWorkspaceSnapshot>>
> {
  const map = new Map<string, Map<string, StoryWorkspaceSnapshot>>();

  if (!isDatabaseEnabled()) {
    return map;
  }

  await ensureSchema();
  const db = getSql();
  const rows = await db<
    {
      user_email: string;
      film_id: string;
      manifest: StoryWorkspaceManifest;
      resume: string;
      tagline: string;
    }[]
  >`
    SELECT user_email, film_id, manifest, resume, tagline
    FROM story_workspaces
  `;

  for (const row of rows) {
    const email = normalizeEmail(row.user_email);
    const byFilm = map.get(email) ?? new Map<string, StoryWorkspaceSnapshot>();
    byFilm.set(row.film_id, {
      manifest: row.manifest,
      resume: row.resume,
      tagline: row.tagline,
    });
    map.set(email, byFilm);
  }

  return map;
}

export async function loadTicketBalancesByEmail(): Promise<Map<string, number>> {
  const map = new Map<string, number>();

  if (isDatabaseEnabled()) {
    await ensureSchema();
    const db = getSql();
    const rows = await db<{ user_email: string; balance: number }[]>`
      SELECT user_email, COALESCE(SUM(delta), 0)::int AS balance
      FROM film_ticket_ledger
      GROUP BY user_email
    `;
    for (const row of rows) {
      map.set(normalizeEmail(row.user_email), row.balance);
    }
    return map;
  }

  try {
    const raw = await readFile(
      path.join(process.cwd(), "data", "film-ticket-ledger.json"),
      "utf8"
    );
    const parsed = JSON.parse(raw) as {
      userEmail: string;
      delta: number;
    }[];
    if (!Array.isArray(parsed)) return map;
    for (const entry of parsed) {
      const email = normalizeEmail(entry.userEmail);
      map.set(email, (map.get(email) ?? 0) + entry.delta);
    }
  } catch {
    // empty
  }

  return map;
}

export async function loadJetonBalancesByEmail(): Promise<Map<string, number>> {
  const map = new Map<string, number>();

  if (isDatabaseEnabled()) {
    await ensureSchema();
    const db = getSql();
    const rows = await db<{ user_email: string; balance: number }[]>`
      SELECT user_email, COALESCE(SUM(delta), 0)::int AS balance
      FROM film_jeton_ledger
      GROUP BY user_email
    `;
    for (const row of rows) {
      map.set(normalizeEmail(row.user_email), row.balance);
    }
    return map;
  }

  try {
    const raw = await readFile(
      path.join(process.cwd(), "data", "film-jeton-ledger.json"),
      "utf8"
    );
    const parsed = JSON.parse(raw) as {
      userEmail: string;
      delta: number;
    }[];
    if (!Array.isArray(parsed)) return map;
    for (const entry of parsed) {
      const email = normalizeEmail(entry.userEmail);
      map.set(email, (map.get(email) ?? 0) + entry.delta);
    }
  } catch {
    // empty
  }

  return map;
}

export async function loadPurchasedEmails(): Promise<Set<string>> {
  const purchased = new Set<string>();

  if (isDatabaseEnabled()) {
    await ensureSchema();
    const db = getSql();

    const subscribed = await db<{ email: string }[]>`
      SELECT email FROM users
      WHERE subscription_plan_id IS NOT NULL AND subscription_plan_id <> ''
    `;
    for (const row of subscribed) {
      purchased.add(normalizeEmail(row.email));
    }

    const checkout = await db<{ user_email: string }[]>`
      SELECT DISTINCT user_email FROM stripe_checkout_sessions
    `;
    for (const row of checkout) {
      purchased.add(normalizeEmail(row.user_email));
    }

    const ticketPurchases = await db<{ user_email: string }[]>`
      SELECT DISTINCT user_email FROM film_ticket_ledger
      WHERE kind = 'purchase' AND reference_id LIKE 'purchase:%'
    `;
    for (const row of ticketPurchases) {
      purchased.add(normalizeEmail(row.user_email));
    }

    const jetonPurchases = await db<{ user_email: string }[]>`
      SELECT DISTINCT user_email FROM film_jeton_ledger
      WHERE kind = 'purchase' AND reference_id LIKE 'purchase:%'
    `;
    for (const row of jetonPurchases) {
      purchased.add(normalizeEmail(row.user_email));
    }

    const credits = await db<{ user_email: string }[]>`
      SELECT DISTINCT user_email FROM film_credits
    `;
    for (const row of credits) {
      purchased.add(normalizeEmail(row.user_email));
    }

    return purchased;
  }

  try {
    const usersRaw = await readFile(
      path.join(process.cwd(), "data", "users.json"),
      "utf8"
    );
    const users = JSON.parse(usersRaw) as { email: string; subscriptionPlanId?: string }[];
    if (Array.isArray(users)) {
      for (const user of users) {
        if (user.subscriptionPlanId) {
          purchased.add(normalizeEmail(user.email));
        }
      }
    }
  } catch {
    // empty
  }

  const markFromLedger = async (fileName: string) => {
    try {
      const raw = await readFile(path.join(process.cwd(), "data", fileName), "utf8");
      const parsed = JSON.parse(raw) as {
        userEmail: string;
        kind?: string;
        referenceId?: string | null;
      }[];
      if (!Array.isArray(parsed)) return;
      for (const entry of parsed) {
        if (entry.kind === "purchase" && entry.referenceId?.startsWith("purchase:")) {
          purchased.add(normalizeEmail(entry.userEmail));
        }
      }
    } catch {
      // empty
    }
  };

  await Promise.all([
    markFromLedger("film-ticket-ledger.json"),
    markFromLedger("film-jeton-ledger.json"),
  ]);

  try {
    const raw = await readFile(
      path.join(process.cwd(), "data", "film-credits.json"),
      "utf8"
    );
    const parsed = JSON.parse(raw) as { userEmail: string }[];
    if (Array.isArray(parsed)) {
      for (const entry of parsed) {
        purchased.add(normalizeEmail(entry.userEmail));
      }
    }
  } catch {
    // empty
  }

  return purchased;
}
