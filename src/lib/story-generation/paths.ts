import path from "node:path";
import { userPhotoDirKey } from "@/lib/characters/photo";

export const STORIES_DATA_DIR = path.join(process.cwd(), "data", "stories");

export const STORY_PROMPT_PATH = path.join(
  process.cwd(),
  "prompts",
  "story-generation-prompt.txt"
);

export function getClientStoriesDir(email: string): string {
  return path.join(STORIES_DATA_DIR, userPhotoDirKey(email));
}

export function getFilmStoryDir(email: string, filmId: string): string {
  return path.join(getClientStoriesDir(email), filmId);
}

export function formatSceneFileName(sceneIndex: number): string {
  return `scene-${String(sceneIndex).padStart(2, "0")}.txt`;
}
