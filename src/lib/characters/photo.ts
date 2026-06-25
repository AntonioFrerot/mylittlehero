import { del, put } from "@vercel/blob";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { isHostedProduction } from "@/lib/db/client";
import { optimizeCharacterPhotoBuffer } from "@/lib/images/optimize-image";
import { isBlobStorageEnabled } from "@/lib/storage/blob";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

export function userPhotoDirKey(email: string): string {
  return email.toLowerCase().replace(/[^a-z0-9]+/g, "_");
}

export function isAllowedPhotoType(type: string): boolean {
  return ALLOWED_TYPES.has(type);
}

export async function saveCharacterPhoto(
  email: string,
  characterId: string,
  file: File
): Promise<{ ok: true; photoSrc: string } | { ok: false; error: string }> {
  if (!isAllowedPhotoType(file.type)) {
    return {
      ok: false,
      error: "Format accepté : JPG, PNG ou WebP.",
    };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "La photo ne doit pas dépasser 5 Mo." };
  }
  if (file.size === 0) {
    return { ok: false, error: "Choisissez une photo du visage." };
  }

  const userKey = userPhotoDirKey(email);
  const filename = `${characterId}.jpg`;
  const rawBuffer = Buffer.from(await file.arrayBuffer());
  const buffer = await optimizeCharacterPhotoBuffer(rawBuffer);

  if (isBlobStorageEnabled()) {
    try {
      const blob = await put(`characters/${userKey}/${filename}`, buffer, {
        access: "public",
        contentType: "image/jpeg",
        addRandomSuffix: false,
      });
      return { ok: true, photoSrc: blob.url };
    } catch {
      return {
        ok: false,
        error:
          "Impossible d'enregistrer la photo pour le moment. Réessayez dans quelques instants.",
      };
    }
  }

  if (isHostedProduction()) {
    return {
      ok: false,
      error:
        "Le stockage des photos n'est pas configuré sur le site en ligne. Contactez le support.",
    };
  }

  const dir = path.join(process.cwd(), "public", "uploads", "characters", userKey);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);

  return {
    ok: true,
    photoSrc: `/uploads/characters/${userKey}/${filename}`,
  };
}

export async function deleteCharacterPhotoFile(
  photoSrc: string | undefined
): Promise<void> {
  if (!photoSrc) return;

  if (photoSrc.includes("blob.vercel-storage.com")) {
    try {
      await del(photoSrc);
    } catch {
      // fichier déjà absent
    }
    return;
  }

  if (!photoSrc.startsWith("/uploads/characters/")) return;

  const fullPath = path.join(process.cwd(), "public", photoSrc);
  try {
    await unlink(fullPath);
  } catch {
    // fichier déjà absent
  }
}
