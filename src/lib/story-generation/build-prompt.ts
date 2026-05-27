import { readFile } from "node:fs/promises";
import type { LocaleCode } from "@/lib/i18n/locales";
import type { UserFilm } from "@/lib/film-creation/types";
import { STORY_PROMPT_PATH } from "./paths";
import { buildClientBrief } from "./build-client-brief";

export async function loadBaseStoryPrompt(): Promise<string> {
  return readFile(STORY_PROMPT_PATH, "utf8");
}

export async function buildFullStorySystemPrompt(
  film: UserFilm,
  locale: LocaleCode = "fr"
): Promise<string> {
  const base = await loadBaseStoryPrompt();
  const clientBrief = buildClientBrief(film, locale);
  return `${base.trim()}\n\n---\n\n${clientBrief}`;
}
