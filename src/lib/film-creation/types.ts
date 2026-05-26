export {
  FILM_STYLE_IDS,
  FILM_THEME_IDS,
  FILM_STATUS_IDS,
  type FilmStyleId,
  type FilmThemeId,
  type FilmStatusId,
  isFilmStyleId,
  isFilmThemeId,
  normalizeFilmStyle,
  normalizeFilmTheme,
  normalizeFilmStatus,
  translateFilmStyle,
  translateFilmTheme,
  translateFilmStatus,
  buildLocalizedFilmTitle,
} from "@/lib/i18n/film-labels";

import type { FilmLanguageCode } from "@/lib/film-languages";
import type { FilmStyleId, FilmThemeId, FilmStatusId } from "@/lib/i18n/film-labels";

export const FILM_STYLES = ["animation", "realistic", "manga"] as const;
export type FilmStyle = FilmStyleId;

export const FILM_THEMES = [
  "aventure",
  "comedie",
  "fantastique",
  "scifi",
  "educatif",
  "morale",
  "mystere",
  "musical",
  "enquete",
] as const;
export type FilmTheme = FilmThemeId;

export { formatFilmDurationSeconds as formatFilmDuration } from "./duration";
export {
  FILM_DURATION_OPTIONS,
  FILM_DURATION_MIN_SECONDS,
  FILM_DURATION_MAX_SECONDS,
  getFilmDurationSeconds,
  isValidFilmDurationSeconds,
} from "./duration";

export const FILM_STATUSES = ["preparing", "generating", "ready"] as const;
export type FilmStatus = FilmStatusId;

export type FilmCharacterRef = {
  id: string;
  prenom: string;
  photoSrc?: string;
  age?: string;
  taille?: string;
  isMain?: boolean;
};

export type UserFilm = {
  id: string;
  title: string;
  style: FilmStyle | string;
  themes: (FilmTheme | string)[];
  durationSeconds?: number;
  /** @deprecated Ancien champ en minutes entières */
  durationMinutes?: number;
  characters: FilmCharacterRef[];
  language?: FilmLanguageCode;
  avoid: string;
  additionalInfo?: string;
  status: FilmStatus | string;
  createdAt: string;
};

export { buildLocalizedFilmTitle as buildFilmTitle } from "@/lib/i18n/film-labels";
