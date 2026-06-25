import "server-only";

import {
  CHARACTER_PHOTO_JPEG_QUALITY,
  CHARACTER_PHOTO_MAX_EDGE,
  FILM_POSTER_JPEG_QUALITY,
  FILM_POSTER_MAX_HEIGHT,
  FILM_POSTER_MAX_WIDTH,
} from "@/lib/images/image-quality";

async function loadSharp(): Promise<((input: Buffer) => ReturnType<typeof import("sharp")>) | null> {
  try {
    const mod = await import("sharp");
    const factory = mod.default ?? mod;
    return factory as (input: Buffer) => ReturnType<typeof import("sharp")>;
  } catch (error) {
    console.warn("sharp unavailable — saving image without optimization", error);
    return null;
  }
}

/** Redimensionne et compresse une photo personnage (visage). */
export async function optimizeCharacterPhotoBuffer(
  input: Buffer
): Promise<Buffer> {
  const sharp = await loadSharp();
  if (!sharp) return input;

  return sharp(input)
    .rotate()
    .resize(CHARACTER_PHOTO_MAX_EDGE, CHARACTER_PHOTO_MAX_EDGE, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: CHARACTER_PHOTO_JPEG_QUALITY, mozjpeg: true })
    .toBuffer();
}

/** Redimensionne une affiche film livrée par l'admin. */
export async function optimizeFilmPosterBuffer(
  input: Buffer
): Promise<Buffer> {
  const sharp = await loadSharp();
  if (!sharp) return input;

  return sharp(input)
    .rotate()
    .resize(FILM_POSTER_MAX_WIDTH, FILM_POSTER_MAX_HEIGHT, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: FILM_POSTER_JPEG_QUALITY, mozjpeg: true })
    .toBuffer();
}
