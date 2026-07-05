import { readFile } from "node:fs/promises";
import type { LocaleCode } from "@/lib/i18n/locales";
import type { UserFilm } from "@/lib/film-creation/types";
import { RESUME_TITRE_PROMPT_PATH, SAMPLE_RESUME_TITRE_PROMPT_PATH, STORY_PROMPT_PATH } from "./paths";
import { buildClientBrief, buildTitleResumeClientBrief } from "./build-client-brief";

export async function loadBaseStoryPrompt(): Promise<string> {
  return readFile(STORY_PROMPT_PATH, "utf8");
}

export async function loadResumeTitrePrompt(): Promise<string> {
  return readFile(RESUME_TITRE_PROMPT_PATH, "utf8");
}

export async function buildFullStorySystemPrompt(
  film: UserFilm,
  locale: LocaleCode = "fr"
): Promise<string> {
  const base = await loadBaseStoryPrompt();
  const clientBrief = buildClientBrief(film, locale);
  return `${base.trim()}\n\n---\n\n${clientBrief}`;
}

export async function loadSampleResumeTitrePrompt(): Promise<string> {
  return readFile(SAMPLE_RESUME_TITRE_PROMPT_PATH, "utf8");
}

export async function buildTitleResumeSystemPrompt(
  film: UserFilm,
  locale: LocaleCode = "fr"
): Promise<string> {
  const base = await loadResumeTitrePrompt();
  const clientBrief = buildTitleResumeClientBrief(film, locale);
  return `${base.trim()}\n\n---\n\n${clientBrief}`;
}

export async function buildSampleTitleResumeSystemPrompt(
  film: UserFilm,
  locale: LocaleCode = "fr"
): Promise<string> {
  const base = await loadSampleResumeTitrePrompt();
  const clientBrief = buildTitleResumeClientBrief(film, locale);
  return `${base.trim()}\n\n---\n\n${clientBrief}`;
}
