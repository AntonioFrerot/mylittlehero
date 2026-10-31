import { FILM_THEMES } from "@/lib/film-creation/types";
import { isAllowedFilmDuration } from "@/lib/purchases/ticket-rules";

const DRAFT_VERSION = 1 as const;
const STORAGE_KEY_PREFIX = "mylittlehero-film-creation-draft:";

export type YesNoChoice = "yes" | "no";

export type FilmCreationFormDraftPayload = {
  themes: string[];
  characterIds: string[];
  durationSeconds: number | null;
  avoidChoice: YesNoChoice | null;
  avoid: string;
  storyChoice: YesNoChoice | null;
  additionalInfo: string;
};

export type FilmCreationFormDraft = FilmCreationFormDraftPayload & {
  v: typeof DRAFT_VERSION;
};

const VALID_THEME_SET = new Set<string>(FILM_THEMES);

export function filmCreationDraftStorageKey(accountEmail: string): string {
  return `${STORAGE_KEY_PREFIX}${accountEmail.trim().toLowerCase()}`;
}

function isYesNoChoice(value: unknown): value is YesNoChoice {
  return value === "yes" || value === "no";
}

function parseDraft(raw: unknown): FilmCreationFormDraft | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (o.v !== DRAFT_VERSION) return null;

  const themes = Array.isArray(o.themes)
    ? o.themes.filter((t): t is string => typeof t === "string" && VALID_THEME_SET.has(t))
    : [];

  const characterIds = Array.isArray(o.characterIds)
    ? o.characterIds.filter((id): id is string => typeof id === "string" && id.length > 0)
    : [];

  let durationSeconds: number | null = null;
  if (typeof o.durationSeconds === "number" && isAllowedFilmDuration(o.durationSeconds)) {
    durationSeconds = o.durationSeconds;
  }

  const avoidChoice = isYesNoChoice(o.avoidChoice) ? o.avoidChoice : null;
  const storyChoice = isYesNoChoice(o.storyChoice) ? o.storyChoice : null;
  const avoid = typeof o.avoid === "string" ? o.avoid : "";
  const additionalInfo = typeof o.additionalInfo === "string" ? o.additionalInfo : "";

  return {
    v: DRAFT_VERSION,
    themes,
    characterIds,
    durationSeconds,
    avoidChoice,
    avoid,
    storyChoice,
    additionalInfo,
  };
}

export function readFilmCreationDraft(storageKey: string): FilmCreationFormDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    return parseDraft(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

export function writeFilmCreationDraft(
  storageKey: string,
  draft: FilmCreationFormDraftPayload
): void {
  if (typeof window === "undefined") return;
  try {
    const payload: FilmCreationFormDraft = { v: DRAFT_VERSION, ...draft };
    window.localStorage.setItem(storageKey, JSON.stringify(payload));
  } catch {
    // quota / mode privé
  }
}

export function clearFilmCreationDraft(storageKey: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(storageKey);
  } catch {
    // silencieux
  }
}
