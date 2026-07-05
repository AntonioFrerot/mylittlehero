import { cache } from "react";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { ensureSchema, getSql, isDatabaseEnabled } from "@/lib/db/client";
import { normalizeEmail } from "@/lib/db/normalize-email";
import type { FilmScheduleEntry } from "./types";

const DATA_DIR = path.join(process.cwd(), "data", "film-schedules");

function userFilePath(email: string): string {
  const safe = email.toLowerCase().replace(/[^a-z0-9]+/g, "_");
  return path.join(DATA_DIR, `${safe}.json`);
}

function sortSchedules(entries: FilmScheduleEntry[]): FilmScheduleEntry[] {
  return entries.sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
}

async function readSchedulesFile(email: string): Promise<FilmScheduleEntry[]> {
  try {
    const raw = await readFile(userFilePath(email), "utf8");
    const parsed = JSON.parse(raw) as FilmScheduleEntry[];
    return Array.isArray(parsed) ? sortSchedules(parsed) : [];
  } catch {
    return [];
  }
}

async function writeSchedulesFile(
  email: string,
  entries: FilmScheduleEntry[]
): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(
    userFilePath(email),
    JSON.stringify(sortSchedules(entries), null, 2),
    "utf8"
  );
}

async function readSchedulesDb(email: string): Promise<FilmScheduleEntry[]> {
  await ensureSchema();
  const db = getSql();
  const rows = await db<
    {
      id: string;
      user_email: string;
      scheduled_date: string;
      film_id: string | null;
      created_at: string;
    }[]
  >`
    SELECT id, user_email, scheduled_date::text, film_id, created_at
    FROM film_schedules
    WHERE user_email = ${email}
    ORDER BY scheduled_date ASC
  `;

  return rows.map((row) => ({
    id: row.id,
    userEmail: row.user_email,
    scheduledDate: row.scheduled_date.slice(0, 10),
    filmId: row.film_id ?? undefined,
    createdAt: row.created_at,
  }));
}

async function readSchedules(email: string): Promise<FilmScheduleEntry[]> {
  const normalized = normalizeEmail(email);
  if (isDatabaseEnabled()) {
    return readSchedulesDb(normalized);
  }
  return readSchedulesFile(normalized);
}

export async function listUserFilmSchedules(
  email: string
): Promise<FilmScheduleEntry[]> {
  return readSchedules(email);
}

export const listUserFilmSchedulesForUser = cache(listUserFilmSchedules);

export async function addUserFilmSchedules(
  email: string,
  dates: string[]
): Promise<FilmScheduleEntry[]> {
  const normalized = normalizeEmail(email);
  const now = new Date().toISOString();
  const newEntries: FilmScheduleEntry[] = dates.map((scheduledDate) => ({
    id: randomUUID(),
    userEmail: normalized,
    scheduledDate,
    createdAt: now,
  }));

  if (isDatabaseEnabled()) {
    await ensureSchema();
    const db = getSql();
    for (const entry of newEntries) {
      await db`
        INSERT INTO film_schedules (id, user_email, scheduled_date, film_id, created_at)
        VALUES (
          ${entry.id},
          ${normalized},
          ${entry.scheduledDate},
          NULL,
          ${entry.createdAt}
        )
      `;
    }
    return listUserFilmSchedules(normalized);
  }

  const existing = await readSchedulesFile(normalized);
  await writeSchedulesFile(normalized, [...existing, ...newEntries]);
  return listUserFilmSchedules(normalized);
}

export async function addUserFilmScheduleForFilm(
  email: string,
  scheduledDate: string,
  filmId: string
): Promise<FilmScheduleEntry> {
  const normalized = normalizeEmail(email);
  const existing = await readSchedules(normalized);

  if (existing.some((entry) => entry.scheduledDate === scheduledDate)) {
    throw new Error("SCHEDULE_DATE_TAKEN");
  }

  const entry: FilmScheduleEntry = {
    id: randomUUID(),
    userEmail: normalized,
    scheduledDate,
    filmId,
    createdAt: new Date().toISOString(),
  };

  if (isDatabaseEnabled()) {
    await ensureSchema();
    const db = getSql();
    await db`
      INSERT INTO film_schedules (id, user_email, scheduled_date, film_id, created_at)
      VALUES (
        ${entry.id},
        ${normalized},
        ${entry.scheduledDate},
        ${filmId},
        ${entry.createdAt}
      )
    `;
    return entry;
  }

  await writeSchedulesFile(normalized, [...existing, entry]);
  return entry;
}

export async function removeUserFilmSchedule(
  email: string,
  scheduleId: string
): Promise<FilmScheduleEntry[]> {
  const normalized = normalizeEmail(email);

  if (isDatabaseEnabled()) {
    await ensureSchema();
    const db = getSql();
    await db`
      DELETE FROM film_schedules
      WHERE user_email = ${normalized} AND id = ${scheduleId}
    `;
    return listUserFilmSchedules(normalized);
  }

  const existing = await readSchedulesFile(normalized);
  await writeSchedulesFile(
    normalized,
    existing.filter((entry) => entry.id !== scheduleId)
  );
  return listUserFilmSchedules(normalized);
}
