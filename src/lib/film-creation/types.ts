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

import type { StoryGenerationStatus } from "@/lib/story-generation/types";
import type { FilmLanguageCode } from "@/lib/film-languages";
import type { FilmStyleId, FilmThemeId, FilmStatusId } from "@/lib/i18n/film-labels";

export const FILM_STYLES = ["animation", "realistic", "manga"] as const;
export type FilmStyle = FilmStyleId;

export const FILM_THEMES = [
  "aventure",
  "comedie",
  "fantastique",
  "scifi",
  "animation",
  "educatif",
  "musical",
  "morale",
  "mystere",
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
  audioSrc?: string;
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
  /** Film gratuit unique (15 s). */
  isFreeTrial?: boolean;
  /** Échantillon payant (30 s, 1 jeton). */
  isSample?: boolean;
  /** @deprecated Ancien champ en minutes entières */
  durationMinutes?: number;
  characters: FilmCharacterRef[];
  language?: FilmLanguageCode;
  avoid: string;
  additionalInfo?: string;
  status: FilmStatus | string;
  createdAt: string;
  /** Affiche 2:3 (Mon espace, catalogue) */
  posterSrc?: string;
  /** Miniature 16:9 avant lecture */
  videoPosterSrc?: string;
  /** URL vidéo ou YouTube */
  videoSrc?: string;
  /** Accroche courte sous le titre (page visionnage) */
  tagline?: string;
  /** Date de programmation YYYY-MM-DD */
  scheduledDate?: string;
  /** Film programmé via droit abonnement (0 ticket au moment de la création). */
  scheduledViaSubscriptionGrant?: boolean;
};

export type UserFilmWithStory = UserFilm & {
  storyResume?: string | null;
  storyGeneratedTitle?: string | null;
  storyValidatedAt?: string | null;
  storyGenerationCompletedAt?: string | null;
  storyRegenerationUsed?: boolean;
  storyGeneration?: {
    status: StoryGenerationStatus;
    mode?: "openai" | "mock";
    error?: string;
  };
};

export type UserFilmUpdatePatch = Partial<
  Pick<
    UserFilm,
    | "title"
    | "status"
    | "themes"
    | "posterSrc"
    | "videoPosterSrc"
    | "videoSrc"
    | "tagline"
  >
>;

export { buildLocalizedFilmTitle as buildFilmTitle } from "@/lib/i18n/film-labels";
