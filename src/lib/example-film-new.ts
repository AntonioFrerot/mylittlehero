import { normalizeExampleSlug } from "@/lib/example-film-audio-locale";

const NEW_EXAMPLE_FILM_SLUGS = new Set(["super-leo", "leo-lost-plane"]);

export function isExampleFilmNew(slugOrId: string): boolean {
  return NEW_EXAMPLE_FILM_SLUGS.has(normalizeExampleSlug(slugOrId));
}