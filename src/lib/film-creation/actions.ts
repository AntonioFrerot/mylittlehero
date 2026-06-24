"use server";

import { getSession } from "@/lib/auth/get-session";
import { getUserLocale } from "@/lib/auth/users-store";
import { listCharacters } from "@/lib/characters/store";
import { formatCharacterAge } from "@/lib/characters/format";
import type { Character } from "@/lib/characters/types";
import { getServerTranslator } from "@/lib/i18n/server";
import {
  isFilmThemeId,
  buildLocalizedFilmTitle,
  normalizeFilmTheme,
  type FilmThemeId,
} from "@/lib/i18n/film-labels";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { provisionStoryWorkspace } from "@/lib/story-generation/provision";
import { scheduleStoryGeneration } from "@/lib/story-generation/schedule";
import { attachStoryToFilms } from "@/lib/film-creation/catalog-films";
import { readStoryManifest, readStoryResume } from "@/lib/story-generation/manifest";
import { findUserByEmail } from "@/lib/auth/users-store";
import {
  getTicketsRequiredForDuration,
  isAllowedFilmDuration,
  isFreeTrialFilmDuration,
  isPaidFilmDuration,
} from "@/lib/purchases/ticket-rules";
import { spendTicketsForFilm } from "@/lib/purchases/tickets";
import { addUserFilm, getUserFilmById, listUserFilms, updateUserFilm } from "./store";
import { hasUserUsedFreeFilm, isUserFreeTrialFilm } from "./free-film";
import {
  getFilmCreationCooldownState,
  getLatestFilmCreatedAt,
} from "./creation-cooldown";
import type {
  FilmCharacterRef,
  FilmStyle,
  FilmTheme,
  UserFilm,
  UserFilmUpdatePatch,
  UserFilmWithStory,
} from "./types";
import {
  isValidFilmDurationSeconds,
} from "./duration";

export type { UserFilmWithStory } from "./types";

export type FilmCreationFormState = {
  error?: string;
  success?: string;
};

const DEFAULT_FILM_STYLE: FilmStyle = "realistic";

function normalizeSelectedThemes(themes: FilmTheme[]): FilmThemeId[] {
  return [
    ...new Set(
      themes
        .map((theme) => normalizeFilmTheme(String(theme)))
        .filter((theme): theme is FilmThemeId => theme != null)
    ),
  ];
}

function parseThemes(formData: FormData): FilmTheme[] {
  const selected = formData.getAll("themes");
  return selected.filter(
    (theme): theme is FilmTheme =>
      typeof theme === "string" && isFilmThemeId(theme)
  );
}

function parseYesNoText(
  formData: FormData,
  choiceKey: string,
  textKey: string
): string {
  if (formData.get(choiceKey) !== "yes") return "";
  const text = formData.get(textKey);
  return typeof text === "string" ? text.trim() : "";
}

function parseDuration(value: unknown): number | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const seconds = Number(value);
  if (!Number.isFinite(seconds)) return null;
  if (isFreeTrialFilmDuration(seconds)) return seconds;
  if (!isValidFilmDurationSeconds(seconds)) return null;
  return seconds;
}

export async function getMyFilms(): Promise<UserFilm[]> {
  const session = await getSession();
  if (!session) return [];
  return listUserFilms(session.email);
}

export async function getMyFilmCreationCooldown() {
  const session = await getSession();
  if (!session) {
    return { active: false, endsAt: null, remainingMs: 0 };
  }

  const films = await listUserFilms(session.email);
  return getFilmCreationCooldownState(getLatestFilmCreatedAt(films));
}

export async function getMyFilmsWithStory(): Promise<UserFilmWithStory[]> {
  const session = await getSession();
  if (!session) return [];

  const films = await listUserFilms(session.email);
  return attachStoryToFilms(session.email, films);
}

export async function getMyFilmById(filmId: string): Promise<UserFilmWithStory | null> {
  const session = await getSession();
  if (!session) return null;

  const film = await getUserFilmById(session.email, filmId);
  if (!film) return null;

  const [manifest, resume] = await Promise.all([
    readStoryManifest(session.email, film.id),
    readStoryResume(session.email, film.id),
  ]);
  if (!manifest && !resume) return film;

  return {
    ...film,
    ...(resume ? { storyResume: resume } : {}),
    ...(manifest?.generatedTitle
      ? { storyGeneratedTitle: manifest.generatedTitle }
      : {}),
    ...(manifest?.storyValidatedAt
      ? { storyValidatedAt: manifest.storyValidatedAt }
      : {}),
    ...(manifest?.regenerationUsed ? { storyRegenerationUsed: true } : {}),
    ...(manifest
      ? {
          storyGeneration: {
            status: manifest.status,
            ...(manifest.generationMode ? { mode: manifest.generationMode } : {}),
            ...(manifest.generationError
              ? { error: manifest.generationError }
              : {}),
          },
        }
      : {}),
  };
}

export async function saveFilmCreation(
  _prev: FilmCreationFormState,
  formData: FormData
): Promise<FilmCreationFormState> {
  const { locale, t } = await getServerTranslator();
  const session = await getSession();
  if (!session) {
    return { error: t("filmCreation.errors.loginRequired") };
  }

  const style = DEFAULT_FILM_STYLE;
  const durationSeconds = parseDuration(formData.get("duration"));
  const themes = normalizeSelectedThemes(parseThemes(formData));
  const characterIds = formData
    .getAll("characters")
    .filter((id): id is string => typeof id === "string" && id.length > 0);
  const mainCharacterRaw = formData.get("mainCharacter");
  const mainCharacterId =
    typeof mainCharacterRaw === "string" && mainCharacterRaw.length > 0
      ? mainCharacterRaw
      : null;
  const avoid = parseYesNoText(formData, "avoidChoice", "avoid");
  const additionalInfo = parseYesNoText(
    formData,
    "storyChoice",
    "additionalInfo"
  );

  const userCharacters = await listCharacters(session.email);
  const selectedCharacters = resolveFilmCharacters(
    characterIds,
    mainCharacterId,
    userCharacters
  );

  if (userCharacters.length === 0) {
    return { error: t("filmCreation.errors.noCharacters") };
  }
  if (selectedCharacters.length === 0) {
    return { error: t("filmCreation.errors.selectCharacter") };
  }

  const withoutPhoto = selectedCharacters.filter((c) => !c.photoSrc);
  if (withoutPhoto.length > 0) {
    return {
      error: t("filmCreation.errors.photoRequired", {
        names: withoutPhoto.map((c) => c.prenom).join(", "),
      }),
    };
  }

  if (themes.length === 0) {
    return { error: t("filmCreation.errors.themesRequired") };
  }
  if (!durationSeconds || !isAllowedFilmDuration(durationSeconds)) {
    return { error: t("filmCreation.errors.durationRequired") };
  }

  const existingFilms = await listUserFilms(session.email);
  const creationCooldown = getFilmCreationCooldownState(
    getLatestFilmCreatedAt(existingFilms)
  );
  if (creationCooldown.active) {
    return { error: t("filmCreation.errors.cooldownActive") };
  }

  const isFreeFilm = isFreeTrialFilmDuration(durationSeconds);

  if (isFreeFilm) {
    if (hasUserUsedFreeFilm(existingFilms)) {
      return { error: t("filmCreation.errors.freeFilmAlreadyUsed") };
    }
  }

  const [user, filmLanguage] = await Promise.all([
    findUserByEmail(session.email),
    getUserLocale(session.email),
  ]);
  const hasActiveSubscription = Boolean(user?.subscriptionPlanId);
  const ticketsRequired = getTicketsRequiredForDuration(durationSeconds);
  const filmId = randomUUID();

  if (!isFreeFilm) {
    if (!isPaidFilmDuration(durationSeconds)) {
      return { error: t("filmCreation.errors.durationRequired") };
    }

    if (!hasActiveSubscription) {
      const spendResult = await spendTicketsForFilm({
        userEmail: session.email,
        filmId,
        tickets: ticketsRequired,
      });

      if (!spendResult.ok) {
        return { error: t("filmCreation.errors.insufficientTickets") };
      }
    }
  }

  const film: UserFilm = {
    id: filmId,
    title: isFreeFilm ? "" : buildLocalizedFilmTitle(themes, locale),
    style,
    themes,
    durationSeconds,
    ...(isFreeFilm ? { isFreeTrial: true } : {}),
    characters: selectedCharacters,
    language: filmLanguage,
    avoid,
    ...(additionalInfo ? { additionalInfo } : {}),
    status: "preparing",
    createdAt: new Date().toISOString(),
  };

  await addUserFilm(session.email, film);

  if (!isFreeFilm) {
    try {
      await provisionStoryWorkspace(session.email, film);
      scheduleStoryGeneration(session.email, film);
    } catch (error) {
      console.error("Story workspace provisioning failed", {
        email: session.email,
        filmId: film.id,
        error,
      });
    }
  }

  revalidatePath("/mon-espace");
  revalidatePath("/creer-film");
  revalidatePath("/creer");
  revalidatePath("/achat");
  revalidatePath("/catalogue");

  return { success: t("filmCreation.success") };
}

/** Livraison d'un film terminé (affiche, vidéo, thèmes) → visible dans le catalogue. */
export async function deliverUserFilm(
  email: string,
  filmId: string,
  delivery: UserFilmUpdatePatch
): Promise<UserFilm | null> {
  const existing = await getUserFilmById(email, filmId);
  if (!existing) return null;

  const patch: UserFilmUpdatePatch = {
    ...delivery,
    status: "ready",
  };

  if (isUserFreeTrialFilm(existing)) {
    delete patch.posterSrc;
    delete patch.videoPosterSrc;
    delete patch.tagline;
    patch.title = "";
  }

  const film = await updateUserFilm(email, filmId, patch);
  if (!film) return null;

  revalidatePath("/catalogue");
  revalidatePath("/mon-espace");
  revalidatePath(`/mon-espace/films/${filmId}`);
  revalidatePath("/admin");

  return film;
}

function resolveFilmCharacters(
  ids: string[],
  mainCharacterId: string | null,
  userCharacters: Character[]
): FilmCharacterRef[] {
  const uniqueIds = [...new Set(ids)];
  const byId = new Map(userCharacters.map((c) => [c.id, c]));

  const orderedIds =
    mainCharacterId && uniqueIds.includes(mainCharacterId)
      ? [mainCharacterId, ...uniqueIds.filter((id) => id !== mainCharacterId)]
      : uniqueIds;

  return orderedIds
    .map((id) => byId.get(id))
    .filter((c): c is Character => !!c)
    .map((c) => ({
      id: c.id,
      prenom: c.prenom,
      ...(c.photoSrc ? { photoSrc: c.photoSrc } : {}),
      ...(c.age ? { age: formatCharacterAge(c.age) ?? c.age } : {}),
      ...(c.taille ? { taille: `${c.taille} cm` } : {}),
      ...(c.id === mainCharacterId ? { isMain: true } : {}),
    }));
}
