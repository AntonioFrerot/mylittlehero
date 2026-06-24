import { writeFile } from "node:fs/promises";
import path from "node:path";
import { isDatabaseEnabled } from "@/lib/db/client";
import { updateUserFilm } from "@/lib/film-creation/store";
import type { GeneratedScene, StoryPlan, StoryTitleResume } from "./generate";
import { formatSceneFileName, getFilmStoryDir } from "./paths";
import { patchStoryManifest, writeStoryResume, writeStoryTagline, writeStoryTitle } from "./manifest";
import { writeStoryScenesDb } from "./story-db";

export async function persistTitleAndResume(
  email: string,
  filmId: string,
  result: StoryTitleResume
): Promise<void> {
  const tagline = result.tagline.trim();

  await writeStoryTitle(email, filmId, result.title);
  await writeStoryResume(email, filmId, result.resume);
  await writeStoryTagline(email, filmId, tagline);
  await updateUserFilm(email, filmId, {
    title: result.title,
    ...(tagline ? { tagline } : {}),
  });
  await patchStoryManifest(email, filmId, {
    generatedTitle: result.title,
    provisionalTitle: result.title,
  });
}

export async function persistStoryPlan(
  email: string,
  filmId: string,
  plan: StoryPlan
): Promise<void> {
  await persistTitleAndResume(email, filmId, plan);
}

export async function persistScenes(
  email: string,
  filmId: string,
  scenes: GeneratedScene[]
): Promise<void> {
  if (isDatabaseEnabled()) {
    await writeStoryScenesDb(
      email,
      filmId,
      scenes.map((scene) => ({
        sceneNumber: scene.number,
        content: `${scene.content}\n`,
      }))
    );
    return;
  }

  const filmDir = getFilmStoryDir(email, filmId);
  for (const scene of scenes) {
    await writeFile(
      path.join(filmDir, formatSceneFileName(scene.number)),
      `${scene.content}\n`,
      "utf8"
    );
  }
}
