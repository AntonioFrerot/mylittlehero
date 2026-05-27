"use server";

import { getSession } from "@/lib/auth/get-session";
import { getUserLocale } from "@/lib/auth/users-store";
import { listCharacters } from "@/lib/characters/store";
import { formatCharacterAge } from "@/lib/characters/format";
import type { Character } from "@/lib/characters/types";
import { getServerTranslator } from "@/lib/i18n/server";
import {
  isFilmStyleId,
  isFilmThemeId,
  buildLocalizedFilmTitle,
} from "@/lib/i18n/film-labels";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { provisionStoryWorkspace } from "@/lib/story-generation/provision";
import { scheduleStoryGeneration } from "@/lib/story-generation/schedule";
import { readStoryManifest } from "@/lib/story-generation/manifest";
import type { StoryGenerationStatus } from "@/lib/story-generation/types";
import { addUserFilm, listUserFilms } from "./store";
import type { FilmCharacterRef, FilmStyle, FilmTheme, UserFilm } from "./types";
import {
  isValidFilmDurationSeconds,
} from "./duration";

export type FilmCreationFormState = {
  error?: string;
  success?: string;
};

export type UserFilmWithStory = UserFilm & {
  storyGeneration?: {
    status: StoryGenerationStatus;
    mode?: "openai" | "mock";
    error?: string;
  };
};

function parseStyle(value: unknown): FilmStyle | null {
  if (typeof value !== "string") return null;
  return isFilmStyleId(value) ? value : null;
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
  if (!isValidFilmDurationSeconds(seconds)) return null;
  return seconds;
}

export async function getMyFilms(): Promise<UserFilm[]> {
  const session = await getSession();
  if (!session) return [];
  return listUserFilms(session.email);
}

export async function getMyFilmsWithStory(): Promise<UserFilmWithStory[]> {
  const session = await getSession();
  if (!session) return [];

  const films = await listUserFilms(session.email);
  return Promise.all(
    films.map(async (film) => {
      const manifest = await readStoryManifest(session.email, film.id);
      if (!manifest) return film;
      return {
        ...film,
        storyGeneration: {
          status: manifest.status,
          ...(manifest.generationMode
            ? { mode: manifest.generationMode }
            : {}),
          ...(manifest.generationError
            ? { error: manifest.generationError }
            : {}),
        },
      };
    })
  );
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

  const style = parseStyle(formData.get("style"));
  const durationSeconds = parseDuration(formData.get("duration"));
  const themes = parseThemes(formData);
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

  if (!style) {
    return { error: t("filmCreation.errors.styleRequired") };
  }
  if (themes.length === 0) {
    return { error: t("filmCreation.errors.themesRequired") };
  }
  if (!durationSeconds) {
    return { error: t("filmCreation.errors.durationRequired") };
  }

  const filmLanguage = await getUserLocale(session.email);

  const film: UserFilm = {
    id: randomUUID(),
    title: buildLocalizedFilmTitle(style, themes, locale),
    style,
    themes,
    durationSeconds,
    characters: selectedCharacters,
    language: filmLanguage,
    avoid,
    ...(additionalInfo ? { additionalInfo } : {}),
    status: "preparing",
    createdAt: new Date().toISOString(),
  };

  await addUserFilm(session.email, film);

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

  revalidatePath("/mon-espace");
  revalidatePath("/creer-film");

  return { success: t("filmCreation.success") };
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
