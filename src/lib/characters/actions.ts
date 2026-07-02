"use server";

import { getSession } from "@/lib/auth/get-session";
import { getServerTranslator } from "@/lib/i18n/server";
import {
  databaseRequiredError,
  isDatabaseEnabled,
  isHostedProduction,
} from "@/lib/db/client";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import {
  deleteCharacterAudioFile,
  isValidCharacterAudioDuration,
  saveCharacterAudio,
} from "./audio";
import {
  deleteCharacterPhotoFile,
  saveCharacterPhoto,
} from "./photo";
import { deleteCharacter, listCharacters, listCharactersForUser, saveCharacter } from "./store";
import { formatCharacterAge } from "./format";
import type { Character } from "./types";

export type CharacterFormState = {
  error?: string;
  success?: string;
  character?: Character;
  mode?: "created" | "updated";
};

function optionalText(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function parseAge(
  value: unknown,
  t: ReturnType<typeof import("@/lib/i18n/translator").createTranslator>
): { age: string } | { error: string } {
  if (typeof value !== "string" || !value.trim()) {
    return { error: t("characters.errors.ageRequired") };
  }

  const formatted = formatCharacterAge(value);
  if (!formatted) {
    return { error: t("characters.errors.ageRequired") };
  }

  return { age: formatted };
}

const MIN_TAILLE_CM = 10;
const MAX_TAILLE_CM = 300;

function parseTailleCm(
  value: unknown,
  t: ReturnType<typeof import("@/lib/i18n/translator").createTranslator>
): { taille: string } | { error: string } {
  if (typeof value !== "string" || !value.trim()) {
    return { error: t("characters.errors.tailleRequired") };
  }

  const digits = value.trim();
  if (!/^\d+$/.test(digits)) {
    return { error: t("characters.errors.tailleInteger") };
  }

  const cm = Number(digits);
  if (cm < MIN_TAILLE_CM) {
    return { error: t("characters.errors.tailleMin", { min: MIN_TAILLE_CM }) };
  }
  if (cm > MAX_TAILLE_CM) {
    return { error: t("characters.errors.tailleMax", { max: MAX_TAILLE_CM }) };
  }

  return { taille: String(cm) };
}

export async function getMyCharacters(): Promise<Character[]> {
  const session = await getSession();
  if (!session) return [];
  return listCharactersForUser(session.email);
}

export async function upsertCharacter(
  _prev: CharacterFormState,
  formData: FormData
): Promise<CharacterFormState> {
  const { t } = await getServerTranslator();

  try {
    const session = await getSession();
    if (!session) {
      return { error: t("characters.errors.loginRequired") };
    }

    if (isHostedProduction() && !isDatabaseEnabled()) {
      return { error: databaseRequiredError() };
    }

    const id = formData.get("id");
    const prenom = formData.get("prenom");
    const ageResult = parseAge(formData.get("age"), t);
    const tailleResult = parseTailleCm(formData.get("taille"), t);
    const additionalInfo = optionalText(formData.get("additionalInfo"));
    const photoInput = formData.get("photo");
    const audioInput = formData.get("audio");
    const audioDurationRaw = formData.get("audioDuration");

    if (typeof prenom !== "string" || !prenom.trim()) {
      return { error: t("characters.errors.prenomRequired") };
    }
    if ("error" in tailleResult) {
      return { error: tailleResult.error };
    }
    if ("error" in ageResult) {
      return { error: ageResult.error };
    }

    const now = new Date().toISOString();
    const characterId =
      typeof id === "string" && id.trim() ? id.trim() : randomUUID();

    const existing = await listCharacters(session.email);
    const previous = existing.find((c) => c.id === characterId);

    let photoSrc = previous?.photoSrc ?? "";

    if (photoInput instanceof File && photoInput.size > 0) {
      const saved = await saveCharacterPhoto(
        session.email,
        characterId,
        photoInput
      );
      if (!saved.ok) return { error: saved.error };

      if (previous?.photoSrc && previous.photoSrc !== saved.photoSrc) {
        await deleteCharacterPhotoFile(previous.photoSrc);
      }
      photoSrc = saved.photoSrc;
    } else if (!photoSrc) {
      return { error: t("characters.errors.photoRequired") };
    }

    let audioSrc = previous?.audioSrc;

    if (audioInput instanceof File && audioInput.size > 0) {
      const duration =
        typeof audioDurationRaw === "string" ? Number(audioDurationRaw) : Number.NaN;
      if (!isValidCharacterAudioDuration(duration)) {
        return { error: t("characters.errors.audioDuration") };
      }

      const savedAudio = await saveCharacterAudio(
        session.email,
        characterId,
        audioInput
      );
      if (!savedAudio.ok) return { error: savedAudio.error };

      if (previous?.audioSrc && previous.audioSrc !== savedAudio.audioSrc) {
        await deleteCharacterAudioFile(previous.audioSrc);
      }
      audioSrc = savedAudio.audioSrc;
    } else if (!audioSrc) {
      return { error: t("characters.errors.audioRequired") };
    }

    const character: Character = {
      id: characterId,
      prenom: prenom.trim(),
      photoSrc,
      ...(audioSrc ? { audioSrc } : {}),
      age: ageResult.age,
      taille: tailleResult.taille,
      ...(additionalInfo ? { additionalInfo } : {}),
      createdAt: previous?.createdAt ?? now,
      updatedAt: now,
    };

    await saveCharacter(session.email, character);
    revalidatePath("/mon-espace");
    revalidatePath("/creer-film");

    return {
      success: previous
        ? t("characters.successUpdated")
        : t("characters.successAdded"),
      character,
      mode: previous ? "updated" : "created",
    };
  } catch (error) {
    console.error("Character upsert failed", error);
    return { error: t("characters.errors.saveFailed") };
  }
}

export async function removeCharacter(
  characterId: string
): Promise<CharacterFormState> {
  const { t } = await getServerTranslator();

  try {
    const session = await getSession();
    if (!session) {
      return { error: t("characters.errors.loginRequired") };
    }

    if (isHostedProduction() && !isDatabaseEnabled()) {
      return { error: databaseRequiredError() };
    }

    if (!characterId) return { error: t("characters.errors.notFound") };

    const existing = await listCharacters(session.email);
    const target = existing.find((c) => c.id === characterId);
    if (target?.photoSrc) {
      await deleteCharacterPhotoFile(target.photoSrc);
    }
    if (target?.audioSrc) {
      await deleteCharacterAudioFile(target.audioSrc);
    }

    await deleteCharacter(session.email, characterId);
    revalidatePath("/mon-espace");
    revalidatePath("/creer-film");
    return { success: t("characters.successDeleted") };
  } catch (error) {
    console.error("Character delete failed", error);
    return { error: t("characters.errors.saveFailed") };
  }
}
