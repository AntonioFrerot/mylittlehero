import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getFilmStoryDir } from "./paths";
import type { StoryWorkspaceManifest } from "./types";

export type { StoryGenerationStatus, StoryWorkspaceManifest } from "./types";

export async function readStoryManifest(
  email: string,
  filmId: string
): Promise<StoryWorkspaceManifest | null> {
  try {
    const raw = await readFile(
      path.join(getFilmStoryDir(email, filmId), "film.json"),
      "utf8"
    );
    return JSON.parse(raw) as StoryWorkspaceManifest;
  } catch {
    return null;
  }
}

export async function writeStoryManifest(
  email: string,
  filmId: string,
  manifest: StoryWorkspaceManifest
): Promise<void> {
  await writeFile(
    path.join(getFilmStoryDir(email, filmId), "film.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8"
  );
}

export async function patchStoryManifest(
  email: string,
  filmId: string,
  patch: Partial<StoryWorkspaceManifest>
): Promise<void> {
  const current = await readStoryManifest(email, filmId);
  if (!current) return;
  await writeStoryManifest(email, filmId, { ...current, ...patch });
}
