import type { FilmStyleId } from "@/lib/i18n/film-labels";

export const FILM_CREATION_STYLES = ["realistic", "animation"] as const satisfies readonly FilmStyleId[];

export type FilmCreationStyle = (typeof FILM_CREATION_STYLES)[number];

export const DEFAULT_FILM_CREATION_STYLE: FilmCreationStyle = "realistic";

/** Remplacez ces fichiers dans `public/film-creation/` (même nom sans .svg ou en .jpg/.webp). */
export const FILM_STYLE_PREVIEW_SRC: Record<FilmCreationStyle, string> = {
  realistic: "/film-creation/style-realistic.jpg",
  animation: "/film-creation/style-animation.svg",
};

const STYLE_SET = new Set<string>(FILM_CREATION_STYLES);

export function isFilmCreationStyle(value: string): value is FilmCreationStyle {
  return STYLE_SET.has(value);
}