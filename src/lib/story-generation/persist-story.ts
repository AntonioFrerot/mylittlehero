import { writeFile } from "node:fs/promises";
import path from "node:path";
import { updateUserFilm } from "@/lib/film-creation/store";
import { formatSceneFileName, getFilmStoryDir } from "./paths";
import type { GeneratedScene, StoryPlan } from "./generate";
import { patchStoryManifest } from "./manifest";

export async function persistStoryPlan(
  email: string,
  filmId: string,
  plan: StoryPlan
): Promise<void> {
  const filmDir = getFilmStoryDir(email, filmId);
  await writeFile(path.join(filmDir, "titre.txt"), `${plan.title}\n`, "utf8");
  await writeFile(path.join(filmDir, "resume.txt"), `${plan.resume}\n`, "utf8");
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
  const filmDir = getFilmStoryDir(email, filmId);
  for (const scene of scenes) {
    await writeFile(
      path.join(filmDir, formatSceneFileName(scene.number)),
      `${scene.content}\n`,
      "utf8"
    );
  }
}
