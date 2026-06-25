import { ensureSchema, getSql, isDatabaseEnabled } from "@/lib/db/client";
import { normalizeEmail } from "@/lib/db/normalize-email";
import type { StoryWorkspaceManifest } from "./types";

type StoryWorkspaceRow = {
  manifest: StoryWorkspaceManifest;
  title: string;
  resume: string;
  tagline: string;
};

export type { StoryWorkspaceRow };

export async function listStoryWorkspacesDb(
  email: string,
  filmIds?: string[]
): Promise<Map<string, StoryWorkspaceRow>> {
  await ensureSchema();
  const db = getSql();
  const userEmail = normalizeEmail(email);
  const result = new Map<string, StoryWorkspaceRow>();

  if (filmIds != null && filmIds.length === 0) {
    return result;
  }

  const rows =
    filmIds != null && filmIds.length > 0
      ? await db<
          {
            film_id: string;
            manifest: StoryWorkspaceManifest;
            title: string;
            resume: string;
            tagline: string;
          }[]
        >`
          SELECT film_id, manifest, title, resume, tagline
          FROM story_workspaces
          WHERE user_email = ${userEmail}
            AND film_id = ANY(${filmIds})
        `
      : await db<
          {
            film_id: string;
            manifest: StoryWorkspaceManifest;
            title: string;
            resume: string;
            tagline: string;
          }[]
        >`
          SELECT film_id, manifest, title, resume, tagline
          FROM story_workspaces
          WHERE user_email = ${userEmail}
        `;

  for (const row of rows) {
    result.set(row.film_id, {
      manifest: row.manifest,
      title: row.title,
      resume: row.resume,
      tagline: row.tagline,
    });
  }

  return result;
}

export async function readStoryWorkspaceDb(
  email: string,
  filmId: string
): Promise<StoryWorkspaceRow | null> {
  await ensureSchema();
  const db = getSql();
  const userEmail = normalizeEmail(email);
  const rows = await db<
    {
      manifest: StoryWorkspaceManifest;
      title: string;
      resume: string;
      tagline: string;
    }[]
  >`
    SELECT manifest, title, resume, tagline
    FROM story_workspaces
    WHERE user_email = ${userEmail} AND film_id = ${filmId}
    LIMIT 1
  `;
  const row = rows[0];
  if (!row) return null;
  return {
    manifest: row.manifest,
    title: row.title,
    resume: row.resume,
    tagline: row.tagline,
  };
}

export async function writeStoryWorkspaceDb(
  email: string,
  filmId: string,
  data: StoryWorkspaceRow & { manifest: StoryWorkspaceManifest }
): Promise<void> {
  await ensureSchema();
  const db = getSql();
  const userEmail = normalizeEmail(email);
  await db`
    INSERT INTO story_workspaces (user_email, film_id, manifest, title, resume, tagline)
    VALUES (
      ${userEmail},
      ${filmId},
      ${db.json(data.manifest)},
      ${data.title},
      ${data.resume},
      ${data.tagline}
    )
    ON CONFLICT (user_email, film_id)
    DO UPDATE SET
      manifest = EXCLUDED.manifest,
      title = EXCLUDED.title,
      resume = EXCLUDED.resume,
      tagline = EXCLUDED.tagline
  `;
}

export async function patchStoryWorkspaceTextDb(
  email: string,
  filmId: string,
  patch: { title?: string; resume?: string; tagline?: string }
): Promise<void> {
  const current = await readStoryWorkspaceDb(email, filmId);
  if (!current) return;
  await writeStoryWorkspaceDb(email, filmId, {
    manifest: current.manifest,
    title: patch.title ?? current.title,
    resume: patch.resume ?? current.resume,
    tagline: patch.tagline ?? current.tagline,
  });
}

export async function writeStoryScenesDb(
  email: string,
  filmId: string,
  scenes: { sceneNumber: number; content: string }[]
): Promise<void> {
  await ensureSchema();
  const db = getSql();
  const userEmail = normalizeEmail(email);

  for (const scene of scenes) {
    await db`
      INSERT INTO story_scenes (user_email, film_id, scene_number, content)
      VALUES (${userEmail}, ${filmId}, ${scene.sceneNumber}, ${scene.content})
      ON CONFLICT (user_email, film_id, scene_number)
      DO UPDATE SET content = ${scene.content}
    `;
  }
}

export async function provisionStoryScenesDb(
  email: string,
  filmId: string,
  sceneCount: number
): Promise<void> {
  const scenes = Array.from({ length: sceneCount }, (_, index) => ({
    sceneNumber: index + 1,
    content: "",
  }));
  await writeStoryScenesDb(email, filmId, scenes);
}

export function useStoryDatabase(): boolean {
  return isDatabaseEnabled();
}

export type StoryWorkspaceAwaitingReminder = {
  userEmail: string;
  filmId: string;
  manifest: StoryWorkspaceManifest;
};

export async function listStoryWorkspacesWithActiveValidationReminder(
  email?: string
): Promise<StoryWorkspaceAwaitingReminder[]> {
  if (!isDatabaseEnabled()) return [];

  await ensureSchema();
  const db = getSql();

  if (email) {
    const userEmail = normalizeEmail(email);
    const rows = await db<
      {
        user_email: string;
        film_id: string;
        manifest: StoryWorkspaceManifest;
        resume: string;
      }[]
    >`
      SELECT user_email, film_id, manifest, resume
      FROM story_workspaces
      WHERE user_email = ${userEmail}
        AND (manifest->>'storyValidatedAt') IS NULL
    `;

    return rows.map((row) => ({
      userEmail: row.user_email,
      filmId: row.film_id,
      manifest: row.manifest,
    }));
  }

  const rows = await db<
    {
      user_email: string;
      film_id: string;
      manifest: StoryWorkspaceManifest;
      resume: string;
    }[]
  >`
    SELECT user_email, film_id, manifest, resume
    FROM story_workspaces
    WHERE (manifest->>'storyValidatedAt') IS NULL
  `;

  return rows.map((row) => ({
    userEmail: row.user_email,
    filmId: row.film_id,
    manifest: row.manifest,
  }));
}

/** @deprecated Utiliser listStoryWorkspacesWithActiveValidationReminder */
export async function listStoryWorkspacesAwaitingValidationReminder(
  _olderThanMs: number
): Promise<StoryWorkspaceAwaitingReminder[]> {
  return listStoryWorkspacesWithActiveValidationReminder();
}

/** @deprecated Utiliser listStoryWorkspacesWithActiveValidationReminder */
export async function listStoryWorkspacesAwaitingValidationReminderForUser(
  email: string,
  _olderThanMs: number
): Promise<StoryWorkspaceAwaitingReminder[]> {
  return listStoryWorkspacesWithActiveValidationReminder(email);
}

/** @deprecated Utiliser listStoryWorkspacesWithActiveValidationReminder */
export async function listStoryWorkspacesAwaitingClientValidation(
  email: string
): Promise<StoryWorkspaceAwaitingReminder[]> {
  return listStoryWorkspacesWithActiveValidationReminder(email);
}
