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
  deleteCharacterPhotoFile,
  saveCharacterPhoto,
} from "./photo";
import { deleteCharacter, listCharacters, saveCharacter } from "./store";
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

function optionalAge(value: unknown): string | undefined {
  const raw = optionalText(value);
  if (!raw) return undefined;
  return formatCharacterAge(raw) ?? undefined;
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
  return listCharacters(session.email);
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
    const age = optionalAge(formData.get("age"));
    const tailleResult = parseTailleCm(formData.get("taille"), t);
    const additionalInfo = optionalText(formData.get("additionalInfo"));
    const photoInput = formData.get("photo");

    if (typeof prenom !== "string" || !prenom.trim()) {
      return { error: t("characters.errors.prenomRequired") };
    }
    if ("error" in tailleResult) {
      return { error: tailleResult.error };
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

    const character: Character = {
      id: characterId,
      prenom: prenom.trim(),
      photoSrc,
      ...(age ? { age } : {}),
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

    await deleteCharacter(session.email, characterId);
    revalidatePath("/mon-espace");
    revalidatePath("/creer-film");
    return { success: t("characters.successDeleted") };
  } catch (error) {
    console.error("Character delete failed", error);
    return { error: t("characters.errors.saveFailed") };
  }
}
