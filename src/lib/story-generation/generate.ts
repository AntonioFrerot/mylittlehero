import { createChatCompletion } from "@/lib/openai/chat-completion";
import type { LocaleCode } from "@/lib/i18n/locales";
import type { UserFilm } from "@/lib/film-creation/types";
import { buildFullStorySystemPrompt } from "./build-prompt";
import { parseJsonFromModel } from "./parse-json";
import { getStorySceneCount, STORY_SCENE_DURATION_SECONDS } from "./scene-count";
import { getStyleScenePrefix } from "./style-scene-prefix";

export const STORY_SCENES_PER_BATCH = 2;
export const STORY_MIN_SCENE_CHARS = 1700;
export const STORY_MAX_SCENE_CHARS = 2000;

export type StoryPlan = {
  title: string;
  resume: string;
  sceneOutlines: string[];
};

export type GeneratedScene = {
  number: number;
  content: string;
};

export async function generateStoryPlan(
  film: UserFilm,
  locale: LocaleCode
): Promise<StoryPlan | null> {
  const sceneCount = getStorySceneCount(
    film.durationSeconds ??
      (film.durationMinutes != null ? film.durationMinutes * 60 : 0)
  );
  const systemPrompt = await buildFullStorySystemPrompt(film, locale);

  const userPrompt = `Étape 1 — plan narratif uniquement (pas encore les scènes détaillées).

Produis un JSON strict avec exactement ${sceneCount} entrées dans "sceneOutlines" (une par scène de 15 secondes), dans l'ordre chronologique.

{
  "title": "titre court du film",
  "resume": "résumé de l'histoire en 4 à 8 phrases",
  "sceneOutlines": ["résumé scène 1 en 1-3 phrases", "..."]
}

Le titre et le résumé sont en ${locale === "en" ? "anglais" : "français"}. Les outlines peuvent être en français pour faciliter l'étape suivante.`;

  const raw = await createChatCompletion(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    { jsonMode: true, maxTokens: 4096, temperature: 0.75 }
  );

  if (!raw) return null;

  const parsed = parseJsonFromModel<StoryPlan>(raw);
  if (!parsed?.title?.trim() || !parsed.resume?.trim()) return null;

  const outlines = Array.isArray(parsed.sceneOutlines)
    ? parsed.sceneOutlines.map((s) => String(s).trim()).filter(Boolean)
    : [];

  if (outlines.length !== sceneCount) {
    console.warn("Story plan scene count mismatch", {
      expected: sceneCount,
      received: outlines.length,
    });
  }

  return {
    title: parsed.title.trim(),
    resume: parsed.resume.trim(),
    sceneOutlines: outlines.slice(0, sceneCount),
  };
}

export async function generateSceneBatch(
  film: UserFilm,
  locale: LocaleCode,
  plan: StoryPlan,
  fromScene: number,
  toScene: number
): Promise<GeneratedScene[] | null> {
  const systemPrompt = await buildFullStorySystemPrompt(film, locale);
  const stylePrefix = getStyleScenePrefix(film.style);
  const outlines = plan.sceneOutlines.slice(fromScene - 1, toScene);

  const sceneList = outlines
    .map((outline, i) => `Scène ${fromScene + i} : ${outline}`)
    .join("\n");

  const userPrompt = `Étape 2 — rédaction des scènes ${fromScene} à ${toScene}.

Contexte :
Titre : ${plan.title}
Résumé : ${plan.resume}

Pour CHAQUE scène ci-dessous, rédige le texte final en ANGLAIS uniquement, entre ${STORY_MIN_SCENE_CHARS} et ${STORY_MAX_SCENE_CHARS} caractères (espaces compris).

Rappels obligatoires au début de chaque "content" :
1. No visible text or writing anywhere in the frame (bad for AI video).
2. The Runway reference image is the main character of the story.
3. Perfect lip-sync: only the speaking character moves lips when their face is visible; if the speaker is off-screen, do not animate lips on visible faces.
4. Copy this visual style line exactly at the start: "${stylePrefix}"

${film.style === "animation" ? "Do NOT use the Lightyear movie as story inspiration, only visual style." : ""}

Plans des scènes :
${sceneList}

Réponds en JSON strict :
{
  "scenes": [
    { "number": ${fromScene}, "content": "..." }
  ]
}`;

  const raw = await createChatCompletion(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    {
      jsonMode: true,
      maxTokens: 12000,
      temperature: 0.7,
      model: process.env.OPENAI_STORY_MODEL?.trim(),
    }
  );

  if (!raw) return null;

  const parsed = parseJsonFromModel<{ scenes?: GeneratedScene[] }>(raw);
  const scenes = parsed?.scenes;
  if (!Array.isArray(scenes) || scenes.length === 0) return null;

  return scenes
    .map((scene) => ({
      number: Number(scene.number),
      content: String(scene.content ?? "").trim(),
    }))
    .filter((scene) => scene.number >= fromScene && scene.number <= toScene && scene.content);
}

export function normalizeSceneContent(content: string): string {
  const trimmed = content.trim();
  if (trimmed.length >= STORY_MIN_SCENE_CHARS) return trimmed;
  return trimmed;
}

export { STORY_SCENE_DURATION_SECONDS };
