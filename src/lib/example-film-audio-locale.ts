export type ExampleFilmAudioLocale = "fr" | "en";

const SLUG_ALIASES: Record<string, string> = {
  "leo-pirates": "leo-carte-pirates",
};

export function normalizeExampleSlug(slugOrId: string): string {
  const trimmed = slugOrId.trim();
  return SLUG_ALIASES[trimmed] ?? trimmed;
}

/** Langue audio affichée sur les films d'exemple (pastille drapeau). */
export function getExampleFilmAudioLocale(slugOrId: string): ExampleFilmAudioLocale {
  const slug = normalizeExampleSlug(slugOrId);
  return slug === "super-leo" ? "fr" : "en";
}