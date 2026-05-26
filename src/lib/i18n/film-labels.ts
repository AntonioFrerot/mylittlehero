import { createTranslator } from "./translator";
import type { LocaleCode } from "./locales";
import type { TranslationKey } from "./translator";

export const FILM_STYLE_IDS = ["animation", "realistic", "manga"] as const;
export type FilmStyleId = (typeof FILM_STYLE_IDS)[number];

export const FILM_THEME_IDS = [
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
export type FilmThemeId = (typeof FILM_THEME_IDS)[number];

export const FILM_STATUS_IDS = ["preparing", "generating", "ready"] as const;
export type FilmStatusId = (typeof FILM_STATUS_IDS)[number];

const LEGACY_STYLE_TO_ID: Record<string, FilmStyleId> = {
  Animation: "animation",
  Réaliste: "realistic",
  Realistic: "realistic",
  Manga: "manga",
  animation: "animation",
  realistic: "realistic",
  manga: "manga",
};

const LEGACY_THEME_TO_ID: Record<string, FilmThemeId> = {
  Aventure: "aventure",
  Comédie: "comedie",
  Comedy: "comedie",
  Fantastique: "fantastique",
  Fantasy: "fantastique",
  "Science-fiction": "scifi",
  "Science fiction": "scifi",
  Apprentissage: "educatif",
  Learning: "educatif",
  Éducatif: "educatif",
  Educatif: "educatif",
  Educative: "educatif",
  Musical: "musical",
  Enquête: "enquete",
  Enquete: "enquete",
  Enquêtes: "enquete",
  Enquetes: "enquete",
  Investigation: "enquete",
  Morale: "morale",
  Morals: "morale",
  Mystère: "mystere",
  Mystery: "mystere",
  aventure: "aventure",
  comedie: "comedie",
  fantastique: "fantastique",
  scifi: "scifi",
  apprentissage: "educatif",
  educatif: "educatif",
  morale: "morale",
  mystere: "mystere",
  musical: "musical",
  enquete: "enquete",
  enquetes: "enquete",
};

const LEGACY_STATUS_TO_ID: Record<string, FilmStatusId> = {
  "En préparation": "preparing",
  "In preparation": "preparing",
  "Génération en cours": "generating",
  Generating: "generating",
  Prêt: "ready",
  Ready: "ready",
  preparing: "preparing",
  generating: "generating",
  ready: "ready",
};

function styleKey(id: FilmStyleId): TranslationKey {
  return `filmCreation.styles.${id}` as TranslationKey;
}

function themeKey(id: FilmThemeId): TranslationKey {
  return `filmCreation.themes.${id}` as TranslationKey;
}

function statusKey(id: FilmStatusId): TranslationKey {
  return `filmCreation.status.${id}` as TranslationKey;
}

export function normalizeFilmStyle(value: string): FilmStyleId | null {
  return LEGACY_STYLE_TO_ID[value] ?? null;
}

export function normalizeFilmTheme(value: string): FilmThemeId | null {
  return LEGACY_THEME_TO_ID[value] ?? null;
}

export function normalizeFilmStatus(value: string): FilmStatusId | null {
  return LEGACY_STATUS_TO_ID[value] ?? null;
}

export function translateFilmStyle(value: string, locale: LocaleCode): string {
  const id = normalizeFilmStyle(value);
  const t = createTranslator(locale);
  return id ? t(styleKey(id)) : value;
}

export function translateFilmTheme(value: string, locale: LocaleCode): string {
  const id = normalizeFilmTheme(value);
  const t = createTranslator(locale);
  return id ? t(themeKey(id)) : value;
}

export function translateFilmStatus(value: string, locale: LocaleCode): string {
  const id = normalizeFilmStatus(value);
  const t = createTranslator(locale);
  return id ? t(statusKey(id)) : value;
}

export function buildLocalizedFilmTitle(
  style: string,
  themes: string[],
  locale: LocaleCode
): string {
  const styleLabel = translateFilmStyle(style, locale);
  const themeLabels = themes.map((theme) => translateFilmTheme(theme, locale));
  const themePart =
    themeLabels.length <= 2
      ? themeLabels.join(", ")
      : `${themeLabels.slice(0, 2).join(", ")} +${themeLabels.length - 2}`;
  return `${styleLabel} — ${themePart}`;
}

export function isFilmStyleId(value: string): value is FilmStyleId {
  return FILM_STYLE_IDS.includes(value as FilmStyleId);
}

export function isFilmThemeId(value: string): value is FilmThemeId {
  return FILM_THEME_IDS.includes(value as FilmThemeId);
}
