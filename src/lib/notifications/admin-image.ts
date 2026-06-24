import { put } from "@vercel/blob";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { isAllowedPhotoType } from "@/lib/characters/photo";
import { isHostedProduction } from "@/lib/db/client";
import { isBlobStorageEnabled } from "@/lib/storage/blob";

const MAX_BYTES = 5 * 1024 * 1024;

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export async function saveNotificationImage(
  file: File
): Promise<{ ok: true; imageSrc: string } | { ok: false; error: string }> {
  if (!isAllowedPhotoType(file.type)) {
    return {
      ok: false,
      error: "Format accepté : JPG, PNG ou WebP.",
    };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "L'image ne doit pas dépasser 5 Mo." };
  }
  if (file.size === 0) {
    return { ok: false, error: "Choisissez une image." };
  }

  const ext = EXT_BY_MIME[file.type] ?? ".jpg";
  const filename = `${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  if (isBlobStorageEnabled()) {
    try {
      const blob = await put(`notifications/${filename}`, buffer, {
        access: "public",
        contentType: file.type,
        addRandomSuffix: false,
      });
      return { ok: true, imageSrc: blob.url };
    } catch {
      return {
        ok: false,
        error: "Impossible d'enregistrer l'image pour le moment.",
      };
    }
  }

  if (isHostedProduction()) {
    return {
      ok: false,
      error: "Le stockage des images n'est pas configuré sur le site en ligne.",
    };
  }

  const dir = path.join(process.cwd(), "public", "uploads", "notifications");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);

  return {
    ok: true,
    imageSrc: `/uploads/notifications/${filename}`,
  };
}
