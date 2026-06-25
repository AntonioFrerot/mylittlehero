import { put } from "@vercel/blob";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  isAllowedPhotoType,
  userPhotoDirKey,
} from "@/lib/characters/photo";
import { optimizeFilmPosterBuffer } from "@/lib/images/optimize-image";
import { isBlobStorageEnabled } from "@/lib/storage/blob";

const MAX_BYTES = 5 * 1024 * 1024;

export async function saveFilmPoster(
  ownerEmail: string,
  filmId: string,
  file: File
): Promise<{ ok: true; posterSrc: string } | { ok: false; error: string }> {
  if (!isAllowedPhotoType(file.type)) {
    return {
      ok: false,
      error: "Format accepté : JPG, PNG ou WebP.",
    };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "L'affiche ne doit pas dépasser 5 Mo." };
  }
  if (file.size === 0) {
    return { ok: false, error: "Choisissez une image d'affiche." };
  }

  const userKey = userPhotoDirKey(ownerEmail);
  const filename = `${filmId}.jpg`;
  const rawBuffer = Buffer.from(await file.arrayBuffer());
  const buffer = await optimizeFilmPosterBuffer(rawBuffer);

  if (isBlobStorageEnabled()) {
    const blob = await put(`films/${userKey}/${filename}`, buffer, {
      access: "public",
      contentType: "image/jpeg",
      addRandomSuffix: false,
    });
    return { ok: true, posterSrc: blob.url };
  }

  const dir = path.join(process.cwd(), "public", "uploads", "films", userKey);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);

  return {
    ok: true,
    posterSrc: `/uploads/films/${userKey}/${filename}`,
  };
}
