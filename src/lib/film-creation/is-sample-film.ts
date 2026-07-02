import { isSampleFilmDuration } from "@/lib/purchases/ticket-rules";
import type { UserFilm } from "./types";

export function isUserSampleFilm(
  film: Pick<UserFilm, "durationSeconds" | "isSample">
): boolean {
  return (
    film.isSample === true ||
    isSampleFilmDuration(film.durationSeconds ?? 0)
  );
}
