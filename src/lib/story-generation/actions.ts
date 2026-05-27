"use server";

import { getSession } from "@/lib/auth/get-session";
import { getUserFilmById } from "@/lib/film-creation/store";
import { getServerTranslator } from "@/lib/i18n/server";
import { revalidatePath } from "next/cache";
import { readStoryManifest, patchStoryManifest } from "./manifest";
import { runStoryGeneration } from "./run-generation";
import { scheduleStoryGeneration } from "./schedule";

export type StoryRetryState = {
  error?: string;
  success?: string;
};

export async function retryStoryGeneration(
  _prev: StoryRetryState,
  formData: FormData
): Promise<StoryRetryState> {
  const { t } = await getServerTranslator();
  const session = await getSession();
  if (!session) {
    return { error: t("filmCreation.errors.loginRequired") };
  }

  const filmId = formData.get("filmId");
  if (typeof filmId !== "string" || !filmId.trim()) {
    return { error: t("space.storyRetry.filmNotFound") };
  }

  const film = await getUserFilmById(session.email, filmId.trim());
  if (!film) {
    return { error: t("space.storyRetry.filmNotFound") };
  }

  const id = filmId.trim();
  const manifest = await readStoryManifest(session.email, id);
  if (manifest?.status === "generating") {
    return { error: t("space.storyRetry.alreadyRunning") };
  }
  if (manifest?.status === "completed") {
    return { success: t("space.storyRetry.alreadyDone") };
  }

  if (manifest) {
    await patchStoryManifest(session.email, id, {
      status: "awaiting_generation",
      generationError: undefined,
    });
  }

  scheduleStoryGeneration(session.email, film);
  revalidatePath("/mon-espace");

  return { success: t("space.storyRetry.started") };
}

export async function retryStoryGenerationAndWait(
  filmId: string
): Promise<{ ok: boolean; error?: string }> {
  const session = await getSession();
  if (!session) {
    return { ok: false, error: "Non connecté" };
  }

  const manifest = await readStoryManifest(session.email, filmId);
  if (manifest?.status === "generating") {
    return { ok: false, error: "Génération déjà en cours" };
  }
  if (manifest?.status === "completed") {
    return { ok: true };
  }

  if (manifest) {
    await patchStoryManifest(session.email, filmId, {
      status: "awaiting_generation",
      generationError: undefined,
    });
  }

  const result = await runStoryGeneration(session.email, filmId);
  revalidatePath("/mon-espace");
  return result;
}
