import { revalidatePath } from "next/cache";
import { getUserFilmById } from "@/lib/film-creation/store";
import { isUserFreeTrialFilm } from "@/lib/film-creation/free-film";
import { getUserLocale } from "@/lib/auth/users-store";
import type { LocaleCode } from "@/lib/i18n/locales";
import { generateTitleAndResume } from "./generate";
import { generateMockTitleAndResume } from "./generate-mock";
import { getStoryGenerationMode, isMockStoryGenerationEnabled } from "./mock-mode";
import { patchStoryManifest, readStoryManifest } from "./manifest";
import { persistTitleAndResume } from "./persist-story";
import { provisionStoryWorkspace } from "./provision";
import { scheduleStoryValidationReminder } from "@/lib/notifications/story-validation-reminder";

export async function runStoryGeneration(
  email: string,
  filmId: string
): Promise<{ ok: boolean; error?: string }> {
  const useMock = isMockStoryGenerationEnabled();

  const film = await getUserFilmById(email, filmId);
  if (!film) {
    return { ok: false, error: "Film introuvable" };
  }

  if (isUserFreeTrialFilm(film)) {
    return { ok: true };
  }

  let existing = await readStoryManifest(email, filmId);
  if (!existing) {
    await provisionStoryWorkspace(email, film);
    existing = await readStoryManifest(email, filmId);
  }

  if (existing?.status === "completed") {
    return { ok: true };
  }
  if (existing?.status === "generating") {
    return { ok: false, error: "Génération déjà en cours" };
  }

  await patchStoryManifest(email, filmId, {
    status: "generating",
    generationError: undefined,
    generationMode: getStoryGenerationMode(),
  });

  const locale = (await getUserLocale(email)) as LocaleCode;

  try {
    const result = useMock
      ? generateMockTitleAndResume(film, locale)
      : await generateTitleAndResume(film, locale);

    if (!result) {
      throw new Error("Échec génération du titre, du résumé et de l'accroche");
    }

    await persistTitleAndResume(email, filmId, result);

    await patchStoryManifest(email, filmId, {
      status: "completed",
      generationCompletedAt: new Date().toISOString(),
      generationError: undefined,
      generationMode: getStoryGenerationMode(),
    });

    scheduleStoryValidationReminder(email, filmId);

    try {
      revalidatePath("/mon-espace");
    } catch {
      // Hors contexte Next.js (ex. script CLI) : les fichiers sont déjà écrits.
    }

    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur inconnue";
    console.error("Story generation failed", { email, filmId, error });
    await patchStoryManifest(email, filmId, {
      status: "failed",
      generationError: message,
      generationMode: getStoryGenerationMode(),
    });
    return { ok: false, error: message };
  }
}
