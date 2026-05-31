import { createTranslator } from "./translator";
import type { LocaleCode } from "./locales";
import type { TranslationKey } from "./translator";
import type { ExampleFilmSlug } from "@/lib/example-films";
import type { FilmThemeId } from "@/lib/i18n/film-labels";

type FilmCopyKey =
  | "leoNala"
  | "leoTemple"
  | "leoPirates"
  | "leoLostPlane"
  | "leoEtoiles";

const SLUG_TO_COPY_KEY: Record<ExampleFilmSlug, FilmCopyKey> = {
  "leo-et-nala": "leoNala",
  "leo-temple-perdu": "leoTemple",
  "leo-carte-pirates": "leoPirates",
  "leo-lost-plane": "leoLostPlane",
  "leo-planete-etoiles": "leoEtoiles",
};

/** id affiche catalogue → slug page film */
export const POSTER_ID_TO_SLUG: Record<string, ExampleFilmSlug> = {
  "leo-nala": "leo-et-nala",
  "leo-temple": "leo-temple-perdu",
  "leo-pirates": "leo-carte-pirates",
  "leo-lost-plane": "leo-lost-plane",
  "leo-etoiles": "leo-planete-etoiles",
};

function filmKey(
  slug: string,
  field: "title" | "tagline" | "synopsis" | "intro" | "durationLabel"
): TranslationKey | undefined {
  const copy = SLUG_TO_COPY_KEY[slug as ExampleFilmSlug];
  if (!copy) return undefined;
  return `examples.films.${copy}.${field}` as TranslationKey;
}

function translateKey(
  locale: LocaleCode,
  key: TranslationKey | undefined,
  fallback: string
): string {
  if (!key) return fallback;
  const text = createTranslator(locale)(key);
  return text === key ? fallback : text;
}

const THEME_INTRO_FR: Partial<Record<FilmThemeId, string>> = {
  aventure: "Voici un exemple de film d'animation pour Léo :",
  comedie: "Voici un exemple de film de comédie pour Léo :",
  fantastique: "Voici un exemple de film fantastique pour Léo :",
  scifi: "Voici un exemple de film de science-fiction pour Léo :",
  educatif: "Voici un exemple de film éducatif pour Léo :",
  morale: "Voici un exemple de film pour Léo :",
  mystere: "Voici un exemple de film de mystère pour Léo :",
  musical: "Voici un exemple de film musical pour Léo :",
  animation: "Voici un exemple de film d'animation pour Léo :",
};

const THEME_INTRO_EN: Partial<Record<FilmThemeId, string>> = {
  aventure: "Here is an example of an animated film for Leo:",
  comedie: "Here is an example of a comedy film for Leo:",
  fantastique: "Here is an example of a fantasy film for Leo:",
  scifi: "Here is an example of a science-fiction film for Leo:",
  educatif: "Here is an example of an educational film for Leo:",
  morale: "Here is an example of a film for Leo:",
  mystere: "Here is an example of a mystery film for Leo:",
  musical: "Here is an example of a musical film for Leo:",
  animation: "Here is an example of an animated film for Leo:",
};

function translateExampleFilmIntroByTheme(
  theme: FilmThemeId,
  locale: LocaleCode
): string {
  const map = locale === "fr" ? THEME_INTRO_FR : THEME_INTRO_EN;
  return (
    map[theme] ??
    createTranslator(locale)("examples.leoExampleIntro")
  );
}

export function translateExamplePosterTitle(
  posterId: string,
  fallback: string,
  locale: LocaleCode
): string {
  const slug = POSTER_ID_TO_SLUG[posterId];
  return translateExampleFilmTitle(slug ?? posterId, fallback, locale);
}

export function translateExampleFilmTitle(
  slug: string,
  fallback: string,
  locale: LocaleCode
): string {
  return translateKey(locale, filmKey(slug, "title"), fallback);
}

export function translateExampleFilmTagline(
  slug: string,
  fallback: string,
  locale: LocaleCode
): string {
  return translateKey(locale, filmKey(slug, "tagline"), fallback);
}

export function translateExamplePosterDuration(
  posterId: string,
  fallback: string,
  locale: LocaleCode
): string {
  const slug = POSTER_ID_TO_SLUG[posterId];
  return translateExampleFilmDuration(slug ?? posterId, fallback, locale);
}

export function translateExampleFilmDuration(
  slug: string,
  fallback: string,
  locale: LocaleCode
): string {
  return translateKey(locale, filmKey(slug, "durationLabel"), fallback);
}

export function translateExampleFilmIntro(
  slug: string,
  theme: FilmThemeId,
  locale: LocaleCode
): string {
  const key = filmKey(slug, "intro");
  if (key) {
    const text = createTranslator(locale)(key);
    if (text !== key) return text;
  }
  return translateExampleFilmIntroByTheme(theme, locale);
}

export function translateExampleFilmLead(locale: LocaleCode): string {
  return createTranslator(locale)("examples.leoExampleLead");
}

export function translateExampleFilmSynopsis(
  slug: string,
  locale: LocaleCode
): string {
  return translateKey(locale, filmKey(slug, "synopsis"), "");
}

export function translateExampleFilmTheme(
  theme: FilmThemeId,
  locale: LocaleCode
): string {
  return createTranslator(locale)(
    `filmCreation.themes.${theme}` as TranslationKey
  );
}
