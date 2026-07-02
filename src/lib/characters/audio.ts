import { del, put } from "@vercel/blob";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { isHostedProduction } from "@/lib/db/client";
import { isBlobStorageEnabled } from "@/lib/storage/blob";
import { userPhotoDirKey } from "@/lib/characters/photo";

export {
  MAX_CHARACTER_AUDIO_SECONDS,
  MIN_CHARACTER_AUDIO_SECONDS,
  isValidCharacterAudioDuration,
} from "@/lib/characters/audio-constants";

const MAX_BYTES = 2 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "audio/webm",
  "audio/mp4",
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "audio/x-wav",
]);

const EXTENSION_BY_TYPE: Record<string, string> = {
  "audio/webm": "webm",
  "audio/mp4": "m4a",
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/ogg": "ogg",
};

export function isAllowedAudioType(type: string): boolean {
  const baseType = type.split(";")[0]?.trim().toLowerCase() ?? "";
  return ALLOWED_TYPES.has(baseType);
}

function audioExtension(type: string): string {
  const baseType = type.split(";")[0]?.trim().toLowerCase() ?? type;
  return EXTENSION_BY_TYPE[baseType] ?? "webm";
}

export async function saveCharacterAudio(
  email: string,
  characterId: string,
  file: File
): Promise<{ ok: true; audioSrc: string } | { ok: false; error: string }> {
  if (!isAllowedAudioType(file.type)) {
    return {
      ok: false,
      error: "Format accepté : WebM, MP3, MP4, WAV ou OGG.",
    };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "L'audio ne doit pas dépasser 2 Mo." };
  }
  if (file.size === 0) {
    return { ok: false, error: "Choisissez un fichier audio ou enregistrez la voix." };
  }

  const userKey = userPhotoDirKey(email);
  const filename = `${characterId}.${audioExtension(file.type)}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  if (isBlobStorageEnabled()) {
    try {
      const blob = await put(`characters/${userKey}/${filename}`, buffer, {
        access: "public",
        contentType: file.type,
        addRandomSuffix: false,
      });
      return { ok: true, audioSrc: blob.url };
    } catch {
      return {
        ok: false,
        error:
          "Impossible d'enregistrer l'audio pour le moment. Réessayez dans quelques instants.",
      };
    }
  }

  if (isHostedProduction()) {
    return {
      ok: false,
      error:
        "Le stockage audio n'est pas configuré sur le site en ligne. Contactez le support.",
    };
  }

  const dir = path.join(process.cwd(), "public", "uploads", "characters", userKey);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);

  return {
    ok: true,
    audioSrc: `/uploads/characters/${userKey}/${filename}`,
  };
}

export async function deleteCharacterAudioFile(
  audioSrc: string | undefined
): Promise<void> {
  if (!audioSrc) return;

  if (audioSrc.includes("blob.vercel-storage.com")) {
    try {
      await del(audioSrc);
    } catch {
      // fichier déjà absent
    }
    return;
  }

  if (!audioSrc.startsWith("/uploads/characters/")) return;

  const fullPath = path.join(process.cwd(), "public", audioSrc);
  try {
    await unlink(fullPath);
  } catch {
    // fichier déjà absent
  }
}
