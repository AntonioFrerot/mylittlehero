import type { UserFilmWithStory } from "@/lib/film-creation/types";
import { isUserFreeTrialFilm } from "@/lib/film-creation/is-free-trial-film";
import { isUserSampleFilm } from "@/lib/film-creation/is-sample-film";
import type { StoryGenerationStatus } from "@/lib/story-generation/types";

const ACTIVE_STORY_STATUSES = new Set<StoryGenerationStatus>([
  "awaiting_generation",
  "generating",
]);

export function filmNeedsStoryPoll(film: UserFilmWithStory): boolean {
  if (isUserFreeTrialFilm(film)) return false;

  const status = film.storyGeneration?.status;
  if (status === "failed" || status === "completed") return false;
  if (film.storyResume?.trim()) return false;

  return !status || ACTIVE_STORY_STATUSES.has(status);
}
