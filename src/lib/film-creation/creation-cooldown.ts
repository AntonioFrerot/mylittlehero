import type { UserFilm } from "./types";

export const FILM_CREATION_COOLDOWN_MS = 24 * 60 * 60 * 1000;

export type FilmCreationCooldownState = {
  active: boolean;
  endsAt: string | null;
  remainingMs: number;
};

export function getLatestFilmCreatedAt(
  films: Pick<UserFilm, "createdAt">[]
): Date | null {
  if (films.length === 0) return null;

  let latestMs = 0;
  for (const film of films) {
    const ms = new Date(film.createdAt).getTime();
    if (Number.isFinite(ms) && ms > latestMs) {
      latestMs = ms;
    }
  }

  return latestMs > 0 ? new Date(latestMs) : null;
}

export function getFilmCreationCooldownState(
  lastCreatedAt: Date | null,
  now: Date = new Date()
): FilmCreationCooldownState {
  if (!lastCreatedAt) {
    return { active: false, endsAt: null, remainingMs: 0 };
  }

  const endsAtMs = lastCreatedAt.getTime() + FILM_CREATION_COOLDOWN_MS;
  const remainingMs = endsAtMs - now.getTime();

  if (remainingMs <= 0) {
    return { active: false, endsAt: null, remainingMs: 0 };
  }

  return {
    active: true,
    endsAt: new Date(endsAtMs).toISOString(),
    remainingMs,
  };
}

export function formatCooldownRemaining(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}
