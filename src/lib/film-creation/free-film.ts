import { cache } from "react";
import type { UserFilm } from "./types";
import { listUserFilmsForUser } from "./store";
import {
  FREE_FILM_DURATION_SECONDS,
  isFreeTrialFilmDuration,
} from "@/lib/purchases/ticket-rules";
import { isUserFreeTrialFilm } from "./is-free-trial-film";

export { isUserFreeTrialFilm } from "./is-free-trial-film";

export function hasUserUsedFreeFilm(
  films: Pick<UserFilm, "durationSeconds" | "isFreeTrial">[]
): boolean {
  return films.some(
    (film) =>
      film.isFreeTrial === true ||
      film.durationSeconds === FREE_FILM_DURATION_SECONDS
  );
}

async function isFreeFilmAvailable(email: string): Promise<boolean> {
  const films = await listUserFilmsForUser(email);
  return !hasUserUsedFreeFilm(films);
}

export const isFreeFilmAvailableForEmail = cache(isFreeFilmAvailable);

export function isFreeFilmDuration(durationSeconds: number): boolean {
  return isFreeTrialFilmDuration(durationSeconds);
}
