import { isFreeTrialFilmDuration } from "@/lib/purchases/ticket-rules";
import type { UserFilm } from "./types";

export function isUserFreeTrialFilm(
  film: Pick<UserFilm, "durationSeconds" | "isFreeTrial">
): boolean {
  return (
    film.isFreeTrial === true ||
    isFreeTrialFilmDuration(film.durationSeconds ?? 0)
  );
}
