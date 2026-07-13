import { revalidatePath } from "next/cache";
import { isDatabaseEnabled } from "@/lib/db/client";
import { getUserFilmById, listUserFilms } from "@/lib/film-creation/store";
import { isUserFreeTrialFilm } from "@/lib/film-creation/is-free-trial-film";
import { readStoryManifest, readStoryResume } from "@/lib/story-generation/manifest";
import type { StoryWorkspaceManifest } from "@/lib/story-generation/types";
import {
  listStoryWorkspacesWithActiveValidationReminder,
  type StoryWorkspaceAwaitingReminder,
} from "@/lib/story-generation/story-db";
import { markStoryValidated } from "@/lib/story-generation/mark-story-validated";

export const STORY_AUTO_VALIDATION_DELAY_MS = 5 * 60 * 1000;

export function getAutoValidationStartedAt(
  manifest: StoryWorkspaceManifest
): string | undefined {
  return manifest.validationReminderStartedAt?.trim() || manifest.createdAt?.trim();
}

export function getAutoValidationDueAt(
  manifest: StoryWorkspaceManifest
): number | null {
  const startedAt = getAutoValidationStartedAt(manifest);
  if (!startedAt) return null;

  const startedMs = new Date(startedAt).getTime();
  if (Number.isNaN(startedMs)) return null;

  return startedMs + STORY_AUTO_VALIDATION_DELAY_MS;
}

export function isAutoValidationDue(manifest: StoryWorkspaceManifest): boolean {
  const dueAt = getAutoValidationDueAt(manifest);
  if (dueAt == null) return false;
  return Date.now() >= dueAt;
}

export async function filmStillAwaitingClientValidation(
  email: string,
  filmId: string
): Promise<{ awaiting: boolean; timerStartedAt?: string }> {
  const manifest = await readStoryManifest(email, filmId);
  if (!manifest || manifest.storyValidatedAt) {
    return { awaiting: false };
  }

  const timerStartedAt = getAutoValidationStartedAt(manifest);
  if (!timerStartedAt) {
    return { awaiting: false };
  }

  if (manifest.status !== "completed") {
    return { awaiting: false, timerStartedAt };
  }

  const resume = await readStoryResume(email, filmId);
  if (!resume?.trim()) {
    return { awaiting: false, timerStartedAt };
  }

  return { awaiting: true, timerStartedAt };
}

export async function listStoryWorkspacesAwaitingAutoValidation(
  email?: string
): Promise<StoryWorkspaceAwaitingReminder[]> {
  if (isDatabaseEnabled()) {
    return listStoryWorkspacesWithActiveValidationReminder(email);
  }

  if (!email) return [];

  const films = await listUserFilms(email);
  const workspaces: StoryWorkspaceAwaitingReminder[] = [];

  for (const film of films) {
    const manifest = await readStoryManifest(email, film.id);
    if (manifest && !manifest.storyValidatedAt) {
      workspaces.push({
        userEmail: email,
        filmId: film.id,
        manifest,
      });
    }
  }

  return workspaces;
}

async function revalidateFilmPaths(filmId: string): Promise<void> {
  try {
    revalidatePath("/mon-espace");
    revalidatePath(`/mon-espace/films/${filmId}`);
    revalidatePath("/admin");
  } catch {
    // Hors contexte Next.js
  }
}

export async function tryAutoValidateStoryForFilm(
  email: string,
  filmId: string
): Promise<boolean> {
  const film = await getUserFilmById(email, filmId);
  if (!film || isUserFreeTrialFilm(film)) return false;

  const manifest = await readStoryManifest(email, filmId);
  if (!manifest || manifest.storyValidatedAt) return false;
  if (!isAutoValidationDue(manifest)) return false;

  const { awaiting } = await filmStillAwaitingClientValidation(email, filmId);
  if (!awaiting) return false;

  await markStoryValidated(email, film);
  await revalidateFilmPaths(filmId);
  return true;
}

export async function processStoryAutoValidationsForUser(
  email: string
): Promise<number> {
  const workspaces = await listStoryWorkspacesAwaitingAutoValidation(email);

  let validated = 0;
  for (const workspace of workspaces) {
    const done = await tryAutoValidateStoryForFilm(
      workspace.userEmail,
      workspace.filmId
    );
    if (done) validated += 1;
  }

  return validated;
}

export async function processStoryAutoValidations(): Promise<number> {
  const workspaces = await listStoryWorkspacesAwaitingAutoValidation();

  let validated = 0;
  for (const workspace of workspaces) {
    const done = await tryAutoValidateStoryForFilm(
      workspace.userEmail,
      workspace.filmId
    );
    if (done) validated += 1;
  }

  return validated;
}
