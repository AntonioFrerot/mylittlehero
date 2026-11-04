import type { UserFilm } from "./types";
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

/** Essai gratuit 15 s retiré — toujours indisponible pour les nouvelles créations. */
export async function isFreeFilmAvailableForEmail(_email: string): Promise<boolean> {
  return false;
}

export function isFreeFilmDuration(durationSeconds: number): boolean {
  return isFreeTrialFilmDuration(durationSeconds);
}
