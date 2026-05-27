import { revalidatePath } from "next/cache";
import { getUserFilmById } from "@/lib/film-creation/store";
import { getUserLocale } from "@/lib/auth/users-store";
import type { LocaleCode } from "@/lib/i18n/locales";
import {
  generateSceneBatch,
  generateStoryPlan,
  STORY_SCENES_PER_BATCH,
} from "./generate";
import {
  generateMockSceneBatch,
  generateMockStoryPlan,
} from "./generate-mock";
import { getStoryGenerationMode, isMockStoryGenerationEnabled } from "./mock-mode";
import { getStorySceneCount } from "./scene-count";
import { patchStoryManifest, readStoryManifest } from "./manifest";
import { persistScenes, persistStoryPlan } from "./persist-story";
import { provisionStoryWorkspace } from "./provision";

export async function runStoryGeneration(
  email: string,
  filmId: string
): Promise<{ ok: boolean; error?: string }> {
  const useMock = isMockStoryGenerationEnabled();

  const film = await getUserFilmById(email, filmId);
  if (!film) {
    return { ok: false, error: "Film introuvable" };
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
  const durationSeconds =
    film.durationSeconds ??
    (film.durationMinutes != null ? film.durationMinutes * 60 : 0);
  const sceneCount = getStorySceneCount(durationSeconds);

  try {
    const plan = useMock
      ? generateMockStoryPlan(film, locale)
      : await generateStoryPlan(film, locale);

    if (!plan) {
      throw new Error("Échec génération du plan narratif");
    }

    if (plan.sceneOutlines.length < sceneCount) {
      while (plan.sceneOutlines.length < sceneCount) {
        plan.sceneOutlines.push(
          `Scène ${plan.sceneOutlines.length + 1} : la suite de l'aventure.`
        );
      }
    }

    await persistStoryPlan(email, filmId, plan);

    if (useMock) {
      const scenes = generateMockSceneBatch(film, plan, 1, sceneCount);
      await persistScenes(email, filmId, scenes);
    } else {
      for (let start = 1; start <= sceneCount; start += STORY_SCENES_PER_BATCH) {
        const end = Math.min(start + STORY_SCENES_PER_BATCH - 1, sceneCount);
        const scenes = await generateSceneBatch(film, locale, plan, start, end);
        if (!scenes?.length) {
          throw new Error(`Échec génération scènes ${start}-${end}`);
        }
        await persistScenes(email, filmId, scenes);
      }
    }

    await patchStoryManifest(email, filmId, {
      status: "completed",
      generationCompletedAt: new Date().toISOString(),
      generationError: undefined,
      generationMode: getStoryGenerationMode(),
    });

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
