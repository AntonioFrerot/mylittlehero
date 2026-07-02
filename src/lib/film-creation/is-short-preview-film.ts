import { isUserFreeTrialFilm } from "@/lib/film-creation/is-free-trial-film";
import { isUserSampleFilm } from "@/lib/film-creation/is-sample-film";
import type { UserFilm } from "@/lib/film-creation/types";

export function isUserShortPreviewFilm(
  film: Pick<UserFilm, "durationSeconds" | "isFreeTrial" | "isSample">
): boolean {
  return isUserFreeTrialFilm(film) || isUserSampleFilm(film);
}
