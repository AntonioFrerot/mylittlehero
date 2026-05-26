import type { FilmStyleId, FilmThemeId } from "@/lib/i18n/film-labels";

const BADGE_BASE = "film-badge";

/** Pastille style graphique (animation, réaliste, manga) — même famille de couleur. */
export function filmStyleBadgeClassName(_style: FilmStyleId): string {
  return `${BADGE_BASE} ${BADGE_BASE}--style`;
}

/** Pastille thème — une seule couleur pour les 9 univers. */
export function filmThemeBadgeClassName(_theme?: FilmThemeId): string {
  return `${BADGE_BASE} ${BADGE_BASE}--theme`;
}

/** Pastille durée — couleur dédiée. */
export function filmDurationBadgeClassName(): string {
  return `${BADGE_BASE} ${BADGE_BASE}--duration`;
}
