import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { isDatabaseEnabled } from "@/lib/db/client";
import { getFilmStoryDir } from "./paths";
import {
  patchStoryWorkspaceTextDb,
  readStoryWorkspaceDb,
  writeStoryWorkspaceDb,
} from "./story-db";
import type { StoryWorkspaceManifest } from "./types";

export type { StoryGenerationStatus, StoryWorkspaceManifest } from "./types";

export async function readStoryManifest(
  email: string,
  filmId: string
): Promise<StoryWorkspaceManifest | null> {
  if (isDatabaseEnabled()) {
    const workspace = await readStoryWorkspaceDb(email, filmId);
    return workspace?.manifest ?? null;
  }

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

export async function readStoryResume(
  email: string,
  filmId: string
): Promise<string | null> {
  if (isDatabaseEnabled()) {
    const workspace = await readStoryWorkspaceDb(email, filmId);
    const trimmed = workspace?.resume.trim() ?? "";
    return trimmed.length > 0 ? trimmed : null;
  }

  try {
    const raw = await readFile(
      path.join(getFilmStoryDir(email, filmId), "resume.txt"),
      "utf8"
    );
    const trimmed = raw.trim();
    return trimmed.length > 0 ? trimmed : null;
  } catch {
    return null;
  }
}

export async function readStoryTagline(
  email: string,
  filmId: string
): Promise<string | null> {
  if (isDatabaseEnabled()) {
    const workspace = await readStoryWorkspaceDb(email, filmId);
    const trimmed = workspace?.tagline.trim() ?? "";
    return trimmed.length > 0 ? trimmed : null;
  }

  try {
    const raw = await readFile(
      path.join(getFilmStoryDir(email, filmId), "tagline.txt"),
      "utf8"
    );
    const trimmed = raw.trim();
    return trimmed.length > 0 ? trimmed : null;
  } catch {
    return null;
  }
}

export async function writeStoryManifest(
  email: string,
  filmId: string,
  manifest: StoryWorkspaceManifest
): Promise<void> {
  if (isDatabaseEnabled()) {
    const current = await readStoryWorkspaceDb(email, filmId);
    await writeStoryWorkspaceDb(email, filmId, {
      manifest,
      title: current?.title ?? "",
      resume: current?.resume ?? "",
      tagline: current?.tagline ?? "",
    });
    return;
  }

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

export async function writeStoryTitle(
  email: string,
  filmId: string,
  title: string
): Promise<void> {
  if (isDatabaseEnabled()) {
    await patchStoryWorkspaceTextDb(email, filmId, { title });
    return;
  }

  await writeFile(
    path.join(getFilmStoryDir(email, filmId), "titre.txt"),
    `${title}\n`,
    "utf8"
  );
}

export async function writeStoryResume(
  email: string,
  filmId: string,
  resume: string
): Promise<void> {
  if (isDatabaseEnabled()) {
    await patchStoryWorkspaceTextDb(email, filmId, { resume });
    return;
  }

  await writeFile(
    path.join(getFilmStoryDir(email, filmId), "resume.txt"),
    `${resume}\n`,
    "utf8"
  );
}

export async function writeStoryTagline(
  email: string,
  filmId: string,
  tagline: string
): Promise<void> {
  if (isDatabaseEnabled()) {
    await patchStoryWorkspaceTextDb(email, filmId, { tagline });
    return;
  }

  await writeFile(
    path.join(getFilmStoryDir(email, filmId), "tagline.txt"),
    `${tagline}\n`,
    "utf8"
  );
}
