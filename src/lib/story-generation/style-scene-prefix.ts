import type { FilmStyleId } from "@/lib/i18n/film-labels";

const REALISTIC_PREFIX =
  'Visual style 100% similar to a high-budget Hollywood live-action family sci-fi movie shot with real cameras, ultra photorealistic and indistinguishable from real life.';

const ANIMATION_PREFIX =
  "Visual style 100% similar to the movie Lightyear by Pixar: high-quality 3D animation, cinematic lighting, detailed environments, realistic textures, expressive characters, polished Pixar-style rendering and proportions.";

const MANGA_PREFIX =
  "Visual style 100% similar to a high-quality cinematic anime feature film: detailed 2D/2.5D manga-inspired character design, expressive eyes, dynamic compositions, rich painted backgrounds, dramatic lighting, polished Japanese animation aesthetics.";

export function getStyleScenePrefix(style: string): string {
  const id = style as FilmStyleId;
  switch (id) {
    case "realistic":
      return REALISTIC_PREFIX;
    case "animation":
      return ANIMATION_PREFIX;
    case "manga":
      return MANGA_PREFIX;
    default:
      return ANIMATION_PREFIX;
  }
}
