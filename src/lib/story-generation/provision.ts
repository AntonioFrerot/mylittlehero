import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { isDatabaseEnabled } from "@/lib/db/client";
import type { UserFilm } from "@/lib/film-creation/types";
import {
  formatSceneFileName,
  getFilmStoryDir,
  RESUME_TITRE_PROMPT_PATH,
} from "./paths";
import { getStorySceneCount } from "./scene-count";
import { provisionStoryScenesDb, writeStoryWorkspaceDb } from "./story-db";
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
    promptPath: path.relative(process.cwd(), RESUME_TITRE_PROMPT_PATH),
    status: "awaiting_generation",
    validationReminderStartedAt: film.createdAt,
  };

  if (isDatabaseEnabled()) {
    await writeStoryWorkspaceDb(email, film.id, {
      manifest,
      title: film.title,
      resume: "",
      tagline: "",
    });
    await provisionStoryScenesDb(email, film.id, sceneCount);
    return `db:story:${film.id}`;
  }

  const filmDir = getFilmStoryDir(email, film.id);
  await mkdir(filmDir, { recursive: true });

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
