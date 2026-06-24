"use server";

import { getSession } from "@/lib/auth/get-session";
import { getUserFilmById, updateUserFilm } from "@/lib/film-creation/store";
import { isUserFreeTrialFilm } from "@/lib/film-creation/free-film";
import { buildLocalizedFilmTitle } from "@/lib/i18n/film-labels";
import { getServerTranslator } from "@/lib/i18n/server";
import { revalidatePath } from "next/cache";
import {
  readStoryManifest,
  patchStoryManifest,
  writeStoryResume,
  writeStoryTagline,
  writeStoryTitle,
} from "./manifest";
import { runStoryGeneration } from "./run-generation";
import { scheduleStoryGeneration } from "./schedule";

export type StoryRetryState = {
  error?: string;
  success?: string;
};

export type StoryActionState = {
  error?: string;
  success?: string;
};

async function resolveOwnedFilm(
  filmId: string
): Promise<
  | { ok: false; error: string }
  | { ok: true; email: string; film: NonNullable<Awaited<ReturnType<typeof getUserFilmById>>> }
> {
  const { t } = await getServerTranslator();
  const session = await getSession();
  if (!session) {
    return { ok: false, error: t("filmCreation.errors.loginRequired") };
  }

  const film = await getUserFilmById(session.email, filmId);
  if (!film) {
    return { ok: false, error: t("space.storyRetry.filmNotFound") };
  }

  if (isUserFreeTrialFilm(film)) {
    return { ok: false, error: t("space.storyRetry.freeTrialNotAvailable") };
  }

  return { ok: true, email: session.email, film };
}

export async function validateStoryForFilm(
  _prev: StoryActionState,
  formData: FormData
): Promise<StoryActionState> {
  const { t } = await getServerTranslator();
  const filmId = formData.get("filmId");
  if (typeof filmId !== "string" || !filmId.trim()) {
    return { error: t("space.storyRetry.filmNotFound") };
  }

  const resolved = await resolveOwnedFilm(filmId.trim());
  if (!resolved.ok) return { error: resolved.error };

  const { email, film } = resolved;
  const manifest = await readStoryManifest(email, film.id);
  if (!manifest || manifest.status !== "completed") {
    return { error: t("space.storyActions.storyNotReady") };
  }
  if (manifest.storyValidatedAt) {
    return { error: t("space.storyActions.alreadyValidated") };
  }

  await patchStoryManifest(email, film.id, {
    storyValidatedAt: new Date().toISOString(),
  });
  await updateUserFilm(email, film.id, { status: "generating" });

  revalidatePath("/mon-espace");
  revalidatePath(`/mon-espace/films/${film.id}`);

  return { success: t("space.storyActions.validateSuccess") };
}

export async function regenerateStoryForFilm(
  _prev: StoryActionState,
  formData: FormData
): Promise<StoryActionState> {
  const { t, locale } = await getServerTranslator();
  const filmId = formData.get("filmId");
  if (typeof filmId !== "string" || !filmId.trim()) {
    return { error: t("space.storyRetry.filmNotFound") };
  }

  const resolved = await resolveOwnedFilm(filmId.trim());
  if (!resolved.ok) return { error: resolved.error };

  const { email, film } = resolved;
  const manifest = await readStoryManifest(email, film.id);
  if (!manifest || manifest.status !== "completed") {
    return { error: t("space.storyActions.storyNotReady") };
  }
  if (manifest.storyValidatedAt) {
    return { error: t("space.storyActions.alreadyValidated") };
  }
  if (manifest.regenerationUsed) {
    return { error: t("space.storyActions.regenerationUsed") };
  }

  const provisionalTitle = buildLocalizedFilmTitle(film.themes, locale);
  const validatedAt = new Date().toISOString();

  await patchStoryManifest(email, film.id, {
    status: "awaiting_generation",
    regenerationUsed: true,
    storyValidatedAt: validatedAt,
    generatedTitle: undefined,
    generationError: undefined,
    generationCompletedAt: undefined,
  });
  await writeStoryResume(email, film.id, "");
  await writeStoryTagline(email, film.id, "");
  await writeStoryTitle(email, film.id, provisionalTitle);
  await updateUserFilm(email, film.id, {
    title: provisionalTitle,
    status: "generating",
    tagline: "",
  });

  scheduleStoryGeneration(email, film);

  revalidatePath("/mon-espace");
  revalidatePath(`/mon-espace/films/${film.id}`);

  return { success: t("space.storyActions.regenerateSuccess") };
}

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

  if (isUserFreeTrialFilm(film)) {
    return { error: t("space.storyRetry.freeTrialNotAvailable") };
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
