import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { UserFilm } from "@/lib/film-creation/types";
import {
  formatSceneFileName,
  getFilmStoryDir,
  STORY_PROMPT_PATH,
} from "./paths";
import { getStorySceneCount } from "./scene-count";
import type { StoryWorkspaceManifest } from "./types";

export type { StoryWorkspaceManifest } from "./types";

export async function provisionStoryWorkspace(
  email: string,
  film: UserFilm
): Promise<string> {
  const durationSeconds =
    film.durationSeconds ??
    (film.durationMinutes != null ? film.durationMinutes * 60 : 0);
  const sceneCount = getStorySceneCount(durationSeconds);
  const filmDir = getFilmStoryDir(email, film.id);

  await mkdir(filmDir, { recursive: true });

  const manifest: StoryWorkspaceManifest = {
    filmId: film.id,
    email,
    createdAt: film.createdAt,
    style: film.style,
    themes: film.themes,
    durationSeconds,
    sceneCount,
    language: film.language,
    avoid: film.avoid,
    ...(film.additionalInfo ? { additionalInfo: film.additionalInfo } : {}),
    characters: film.characters,
    provisionalTitle: film.title,
    promptPath: path.relative(process.cwd(), STORY_PROMPT_PATH),
    status: "awaiting_generation",
  };

  await writeFile(
    path.join(filmDir, "film.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8"
  );
  await writeFile(path.join(filmDir, "titre.txt"), `${film.title}\n`, "utf8");
  await writeFile(path.join(filmDir, "resume.txt"), "", "utf8");

  for (let scene = 1; scene <= sceneCount; scene++) {
    await writeFile(path.join(filmDir, formatSceneFileName(scene)), "", "utf8");
  }

  return filmDir;
}
