export const STORY_SCENE_DURATION_SECONDS = 15;

export function getStorySceneCount(durationSeconds: number): number {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return 0;
  return Math.floor(durationSeconds / STORY_SCENE_DURATION_SECONDS);
}
