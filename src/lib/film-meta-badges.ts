import {
  FILM_THEME_IDS,
  normalizeFilmStatus,
  normalizeFilmTheme,
  type FilmThemeId,
} from "@/lib/i18n/film-labels";
import { SURFACE_3D_STATUS } from "@/lib/ui/button-3d-classes";

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

/** Pastille durée sur affiche (accueil, catalogue) — coins arrondis, texte compact. */
export function filmDurationPosterBadgeClassName(): string {
  return "film-duration-surface absolute left-3 top-3 z-[1] rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide";
}

const STATUS_BADGE_BASE = "surface-3d--status";

/** Pastille statut film (Mon espace). */
export function filmStatusBadgeClassName(status: string): string {
  const id = normalizeFilmStatus(status) ?? "preparing";
  return `${SURFACE_3D_STATUS} ${STATUS_BADGE_BASE}--${id}`;
}
