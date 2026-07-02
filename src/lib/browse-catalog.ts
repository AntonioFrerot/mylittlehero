import { themes } from "@/lib/data";
import { isUserShortPreviewFilm } from "@/lib/film-creation/is-short-preview-film";
import type { UserFilm } from "@/lib/film-creation/types";
import {
  normalizeFilmStatus,
  normalizeFilmTheme,
  type FilmThemeId,
} from "@/lib/i18n/film-labels";

export type BrowseThemeRow = {
  themeId: FilmThemeId;
  gradient: string;
};

export function getBrowseThemeRows(): BrowseThemeRow[] {
  return themes.map((theme) => ({
    themeId: theme.id as FilmThemeId,
    gradient: theme.gradient,
  }));
}

export function filmHasCatalogTheme(
  film: UserFilm,
  themeId: FilmThemeId
): boolean {
  return film.themes.some(
    (theme) => normalizeFilmTheme(String(theme)) === themeId
  );
}

export function getFilmDisplayPosterSrc(film: UserFilm): string | undefined {
  if (isUserShortPreviewFilm(film)) return undefined;
  if (film.posterSrc) return film.posterSrc;
  const main = film.characters.find((character) => character.isMain);
  return main?.photoSrc ?? film.characters[0]?.photoSrc;
}

export function isFilmVisibleInCatalog(film: UserFilm): boolean {
  if (isUserShortPreviewFilm(film)) return false;
  return (
    normalizeFilmStatus(String(film.status)) === "ready" &&
    Boolean(getFilmDisplayPosterSrc(film))
  );
}

export function getBrowseFilmsForTheme(
  films: UserFilm[],
  themeId: FilmThemeId
): UserFilm[] {
  return films.filter(
    (film) => filmHasCatalogTheme(film, themeId) && isFilmVisibleInCatalog(film)
  );
}
