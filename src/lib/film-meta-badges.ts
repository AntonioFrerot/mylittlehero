import {
  FILM_THEME_IDS,
  normalizeFilmTheme,
  type FilmThemeId,
} from "@/lib/i18n/film-labels";

const BADGE_BASE = "film-badge";

/** Pastille thème — couleur propre à chaque univers. */
export function filmThemeBadgeClassName(theme?: FilmThemeId | string): string {
  const id = theme ? normalizeFilmTheme(String(theme)) : null;
  if (id && FILM_THEME_IDS.includes(id)) {
    return `${BADGE_BASE} ${BADGE_BASE}--theme ${BADGE_BASE}--theme-${id}`;
  }
  return `${BADGE_BASE} ${BADGE_BASE}--theme`;
}

/** Pastille durée — mêmes dimensions que les thèmes, couleurs noir/blanc. */
export function filmDurationBadgeClassName(): string {
  return `${BADGE_BASE} ${BADGE_BASE}--theme ${BADGE_BASE}--duration`;
}
