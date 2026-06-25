import { getUserLocale } from "@/lib/auth/users-store";
import { getUserFilmById } from "@/lib/film-creation/store";
import type { UserFilm } from "@/lib/film-creation/types";
import { getFilmDisplayTitle } from "@/lib/film-creation/user-film-page";
import { createTranslator } from "@/lib/i18n/translator";
import type { LocaleCode } from "@/lib/i18n/locales";
import { readStoryManifest, readStoryResume } from "@/lib/story-generation/manifest";
import type { StoryWorkspaceManifest } from "@/lib/story-generation/types";
import { listStoryWorkspacesWithActiveValidationReminder } from "@/lib/story-generation/story-db";
import { createNotification } from "./store";

export const STORY_VALIDATION_REMINDER_DELAY_MS = 5 * 60 * 1000;

function getMainCharacterPhoto(film: UserFilm): string | undefined {
  const main =
    film.characters.find((character) => character.isMain) ?? film.characters[0];
  return main?.photoSrc;
}

function reminderReferenceId(filmId: string, timerStartedAt: string): string {
  return `validate_reminder:${filmId}:${timerStartedAt}`;
}

export function getValidationReminderStartedAt(
  manifest: StoryWorkspaceManifest
): string | undefined {
  return manifest.validationReminderStartedAt?.trim() || manifest.createdAt?.trim();
}

export function getValidationReminderDueAt(
  manifest: StoryWorkspaceManifest
): number | null {
  const startedAt = getValidationReminderStartedAt(manifest);
  if (!startedAt) return null;

  const startedMs = new Date(startedAt).getTime();
  if (Number.isNaN(startedMs)) return null;

  return startedMs + STORY_VALIDATION_REMINDER_DELAY_MS;
}

export function isValidationReminderDue(
  manifest: StoryWorkspaceManifest
): boolean {
  const dueAt = getValidationReminderDueAt(manifest);
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

  const timerStartedAt = getValidationReminderStartedAt(manifest);
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

export async function createStoryValidationReminderNotification(
  email: string,
  filmId: string,
  timerStartedAt: string
): Promise<boolean> {
  const film = await getUserFilmById(email, filmId);
  if (!film) return false;

  const locale = (await getUserLocale(email)) as LocaleCode;
  const t = createTranslator(locale);
  const manifest = await readStoryManifest(email, filmId);
  const displayTitle = getFilmDisplayTitle(
    film,
    locale,
    manifest?.generatedTitle
  );

  const notification = await createNotification({
    userEmail: email,
    kind: "film_validate_reminder",
    title: t("notifications.filmValidateReminderTitle", { title: displayTitle }),
    body: t("notifications.filmValidateReminderBody"),
    imageSrc: getMainCharacterPhoto(film),
    href: "/mon-espace?section=films",
    referenceId: reminderReferenceId(filmId, timerStartedAt),
  });

  return notification != null;
}

export async function trySendValidationReminderForFilm(
  email: string,
  filmId: string
): Promise<boolean> {
  const manifest = await readStoryManifest(email, filmId);
  if (!manifest || manifest.storyValidatedAt) return false;
  if (!isValidationReminderDue(manifest)) return false;

  const { awaiting, timerStartedAt } = await filmStillAwaitingClientValidation(
    email,
    filmId
  );
  if (!awaiting || !timerStartedAt) return false;

  return createStoryValidationReminderNotification(
    email,
    filmId,
    timerStartedAt
  );
}

export async function processStoryValidationRemindersForUser(
  email: string
): Promise<number> {
  const workspaces = await listStoryWorkspacesWithActiveValidationReminder(email);

  let sent = 0;
  for (const workspace of workspaces) {
    const created = await trySendValidationReminderForFilm(
      workspace.userEmail,
      workspace.filmId
    );
    if (created) sent += 1;
  }

  return sent;
}

export async function processStoryValidationReminders(): Promise<number> {
  const workspaces =
    await listStoryWorkspacesWithActiveValidationReminder();

  let sent = 0;
  for (const workspace of workspaces) {
    const created = await trySendValidationReminderForFilm(
      workspace.userEmail,
      workspace.filmId
    );
    if (created) sent += 1;
  }

  return sent;
}
