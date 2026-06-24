import type { UserFilmWithStory } from "@/lib/film-creation/types";
import { isUserFreeTrialFilm } from "@/lib/film-creation/is-free-trial-film";
import {
  normalizeFilmStatus,
  type FilmStatusId,
} from "@/lib/i18n/film-labels";
import type { LocaleCode } from "@/lib/i18n/locales";
import { createTranslator } from "@/lib/i18n/translator";

export type FilmDisplayStatusId = FilmStatusId | "awaiting_validation";

export function resolveFilmDisplayStatus(
  film: UserFilmWithStory
): FilmDisplayStatusId {
  if (isUserFreeTrialFilm(film)) {
    return normalizeFilmStatus(film.status) ?? "preparing";
  }

  const filmStatus = normalizeFilmStatus(film.status) ?? "preparing";
  const storyStatus = film.storyGeneration?.status;

  if (filmStatus === "ready") {
    return "ready";
  }

  if (film.storyValidatedAt) {
    return "preparing";
  }

  if (
    storyStatus === "generating" ||
    storyStatus === "awaiting_generation"
  ) {
    return "preparing";
  }

  if (storyStatus === "completed" && Boolean(film.storyResume?.trim())) {
    return "awaiting_validation";
  }

  return filmStatus === "generating" ? "preparing" : filmStatus;
}

export function translateFilmDisplayStatus(
  displayStatus: FilmDisplayStatusId,
  locale: LocaleCode
): string {
  const t = createTranslator(locale);
  if (displayStatus === "awaiting_validation") {
    return t("filmCreation.status.awaiting_validation");
  }
  return t(`filmCreation.status.${displayStatus}`);
}
