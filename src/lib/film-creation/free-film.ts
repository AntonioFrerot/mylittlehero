import type { UserFilm } from "./types";
import {
  FREE_FILM_DURATION_SECONDS,
  isFreeTrialFilmDuration,
} from "@/lib/purchases/ticket-rules";

export function hasUserUsedFreeFilm(
  films: Pick<UserFilm, "durationSeconds" | "isFreeTrial">[]
): boolean {
  return films.some(
    (film) =>
      film.isFreeTrial === true ||
      film.durationSeconds === FREE_FILM_DURATION_SECONDS
  );
}

export function isFreeFilmDuration(durationSeconds: number): boolean {
  return isFreeTrialFilmDuration(durationSeconds);
}
