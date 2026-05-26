import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

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

  const ext = EXT_BY_MIME[file.type] ?? ".jpg";
  const userKey = userPhotoDirKey(email);
  const dir = path.join(process.cwd(), "public", "uploads", "characters", userKey);
  await mkdir(dir, { recursive: true });

  const filename = `${characterId}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  return {
    ok: true,
    photoSrc: `/uploads/characters/${userKey}/${filename}`,
  };
}

export async function deleteCharacterPhotoFile(
  photoSrc: string | undefined
): Promise<void> {
  if (!photoSrc?.startsWith("/uploads/characters/")) return;

  const fullPath = path.join(process.cwd(), "public", photoSrc);
  try {
    await unlink(fullPath);
  } catch {
    // fichier déjà absent
  }
}
