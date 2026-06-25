import { cache } from "react";
import { isDatabaseEnabled } from "@/lib/db/client";
import {
  listStoryWorkspacesDb,
  type StoryWorkspaceRow,
} from "@/lib/story-generation/story-db";
import {
  readStoryManifest,
  readStoryResume,
  readStoryTagline,
} from "@/lib/story-generation/manifest";
import type { FilmStoryStatusSnapshot } from "@/lib/story-generation/story-status";

export async function readStoryStatusSnapshots(
  email: string,
  filmIds: string[]
): Promise<FilmStoryStatusSnapshot[]> {
  if (filmIds.length === 0) return [];

  if (isDatabaseEnabled()) {
    const workspaces = await listStoryWorkspacesDb(email, filmIds);
    return filmIds.map((filmId) => {
      const workspace = workspaces.get(filmId);
      const resume = workspace?.resume.trim() ?? "";
      return {
        filmId,
        status: workspace?.manifest.status ?? null,
        hasResume: resume.length > 0,
      };
    });
  }

  return Promise.all(
    filmIds.map(async (filmId) => {
      const [manifest, resume] = await Promise.all([
        readStoryManifest(email, filmId),
        readStoryResume(email, filmId),
      ]);
      return {
        filmId,
        status: manifest?.status ?? null,
        hasResume: Boolean(resume?.trim()),
      };
    })
  );
}

export type StoryWorkspaceBatchEntry = {
  manifest: StoryWorkspaceRow["manifest"] | null;
  resume: string | null;
  tagline: string | null;
};

export async function readStoryWorkspacesBatch(
  email: string,
  filmIds: string[]
): Promise<Map<string, StoryWorkspaceBatchEntry>> {
  const result = new Map<string, StoryWorkspaceBatchEntry>();

  if (filmIds.length === 0) return result;

  if (isDatabaseEnabled()) {
    const workspaces = await listStoryWorkspacesDb(email, filmIds);
    for (const filmId of filmIds) {
      const workspace = workspaces.get(filmId);
      if (!workspace) {
        result.set(filmId, { manifest: null, resume: null, tagline: null });
        continue;
      }
      const resume = workspace.resume.trim();
      const tagline = workspace.tagline.trim();
      result.set(filmId, {
        manifest: workspace.manifest,
        resume: resume.length > 0 ? resume : null,
        tagline: tagline.length > 0 ? tagline : null,
      });
    }
    return result;
  }

  await Promise.all(
    filmIds.map(async (filmId) => {
      const [manifest, resume, tagline] = await Promise.all([
        readStoryManifest(email, filmId),
        readStoryResume(email, filmId),
        readStoryTagline(email, filmId),
      ]);
      result.set(filmId, { manifest, resume, tagline });
    })
  );

  return result;
}
