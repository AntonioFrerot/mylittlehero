import { writeFile } from "node:fs/promises";
import path from "node:path";
import { isDatabaseEnabled } from "@/lib/db/client";
import { updateUserFilm } from "@/lib/film-creation/store";
import type { GeneratedScene, StoryPlan } from "./generate";
import { formatSceneFileName, getFilmStoryDir } from "./paths";
import { patchStoryManifest, writeStoryResume, writeStoryTitle } from "./manifest";
import { writeStoryScenesDb } from "./story-db";

export async function persistStoryPlan(
  email: string,
  filmId: string,
  plan: StoryPlan
): Promise<void> {
  await writeStoryTitle(email, filmId, plan.title);
  await writeStoryResume(email, filmId, plan.resume);
  await updateUserFilm(email, filmId, { title: plan.title });
  await patchStoryManifest(email, filmId, {
    generatedTitle: plan.title,
    provisionalTitle: plan.title,
  });
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
