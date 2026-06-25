import { getUserLocale } from "@/lib/auth/users-store";
import { getUserFilmById } from "@/lib/film-creation/store";
import type { UserFilm } from "@/lib/film-creation/types";
import { getFilmDisplayTitle } from "@/lib/film-creation/user-film-page";
import { createTranslator } from "@/lib/i18n/translator";
import type { LocaleCode } from "@/lib/i18n/locales";
import { readStoryManifest, readStoryResume } from "@/lib/story-generation/manifest";
import {
  listStoryWorkspacesAwaitingValidationReminder,
  listStoryWorkspacesAwaitingValidationReminderForUser,
} from "@/lib/story-generation/story-db";
import { getSiteUrl } from "@/lib/site-url";
import { createNotification } from "./store";

export const STORY_VALIDATION_REMINDER_DELAY_MS = 5 * 60 * 1000;

function getMainCharacterPhoto(film: UserFilm): string | undefined {
  const main =
    film.characters.find((character) => character.isMain) ?? film.characters[0];
  return main?.photoSrc;
}

function reminderReferenceId(filmId: string, generationCompletedAt: string): string {
  return `validate_reminder:${filmId}:${generationCompletedAt}`;
}

export async function filmStillAwaitingClientValidation(
  email: string,
  filmId: string
): Promise<{ awaiting: boolean; generationCompletedAt?: string }> {
  const manifest = await readStoryManifest(email, filmId);
  if (!manifest || manifest.status !== "completed") {
    return { awaiting: false };
  }
  if (manifest.storyValidatedAt) {
    return { awaiting: false };
  }
  if (!manifest.generationCompletedAt) {
    return { awaiting: false };
  }

  const resume = await readStoryResume(email, filmId);
  if (!resume?.trim()) {
    return { awaiting: false };
  }

  return {
    awaiting: true,
    generationCompletedAt: manifest.generationCompletedAt,
  };
}

function isReminderDue(generationCompletedAt: string): boolean {
  const completedAt = new Date(generationCompletedAt).getTime();
  if (Number.isNaN(completedAt)) return false;
  return Date.now() - completedAt >= STORY_VALIDATION_REMINDER_DELAY_MS;
}

export async function createStoryValidationReminderNotification(
  email: string,
  filmId: string,
  generationCompletedAt: string
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
    referenceId: reminderReferenceId(filmId, generationCompletedAt),
  });

  return notification != null;
}

async function trySendReminderForFilm(
  email: string,
  filmId: string
): Promise<boolean> {
  const { awaiting, generationCompletedAt } =
    await filmStillAwaitingClientValidation(email, filmId);
  if (!awaiting || !generationCompletedAt) return false;
  if (!isReminderDue(generationCompletedAt)) return false;

  return createStoryValidationReminderNotification(
    email,
    filmId,
    generationCompletedAt
  );
}

export async function processStoryValidationRemindersForUser(
  email: string
): Promise<number> {
  const workspaces = await listStoryWorkspacesAwaitingValidationReminderForUser(
    email,
    STORY_VALIDATION_REMINDER_DELAY_MS
  );

  let sent = 0;
  for (const workspace of workspaces) {
    const created = await trySendReminderForFilm(
      workspace.userEmail,
      workspace.filmId
    );
    if (created) sent += 1;
  }

  return sent;
}

export async function processStoryValidationReminders(): Promise<number> {
  const workspaces = await listStoryWorkspacesAwaitingValidationReminder(
    STORY_VALIDATION_REMINDER_DELAY_MS
  );

  let sent = 0;
  for (const workspace of workspaces) {
    const created = await trySendReminderForFilm(
      workspace.userEmail,
      workspace.filmId
    );
    if (created) sent += 1;
  }

  return sent;
}

/** Planifie un rappel serveur (QStash) si configuré ; sinon le poll client prend le relais. */
export function scheduleStoryValidationReminder(
  email: string,
  filmId: string
): void {
  void scheduleStoryValidationReminderOnServer(email, filmId);
}

async function scheduleStoryValidationReminderOnServer(
  email: string,
  filmId: string
): Promise<void> {
  const qstashToken = process.env.QSTASH_TOKEN?.trim();
  const secret = process.env.STORY_GENERATION_SECRET?.trim();
  if (!qstashToken || !secret) return;

  const targetUrl = `${getSiteUrl()}/api/story-validation-reminder`;
  const publishUrl = `https://qstash.upstash.io/v2/publish/${encodeURIComponent(targetUrl)}`;

  try {
    const response = await fetch(publishUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${qstashToken}`,
        "Content-Type": "application/json",
        "Upstash-Delay": "5m",
        "Upstash-Forward-x-story-generation-secret": secret,
      },
      body: JSON.stringify({ email, filmId }),
    });

    if (!response.ok) {
      console.error("QStash story validation reminder failed", {
        email,
        filmId,
        status: response.status,
        body: await response.text().catch(() => ""),
      });
    }
  } catch (error) {
    console.error("QStash story validation reminder error", {
      email,
      filmId,
      error,
    });
  }
}

export async function runStoryValidationReminderAfterDelay(
  email: string,
  filmId: string
): Promise<boolean> {
  return trySendReminderForFilm(email, filmId);
}
