/** Sans clé OpenAI : génération locale de démonstration (aucun compte requis). */
export function isMockStoryGenerationEnabled(): boolean {
  const mode = process.env.STORY_GENERATION_MODE?.trim().toLowerCase();
  if (mode === "openai") return false;
  if (mode === "mock") return true;
  return !process.env.OPENAI_API_KEY?.trim();
}

export type StoryGenerationMode = "openai" | "mock";

export function getStoryGenerationMode(): StoryGenerationMode {
  return isMockStoryGenerationEnabled() ? "mock" : "openai";
}
