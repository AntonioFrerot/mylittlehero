import type { UserFilm } from "@/lib/film-creation/types";
import { isMockStoryGenerationEnabled } from "./mock-mode";
import { runStoryGeneration } from "./run-generation";

function resolveAppBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}

function runGenerationInBackground(email: string, filmId: string): void {
  void runStoryGeneration(email, filmId).catch((error) => {
    console.error("Background story generation failed", {
      email,
      filmId,
      error,
    });
  });
}

export function scheduleStoryGeneration(email: string, film: UserFilm): void {
  if (isMockStoryGenerationEnabled()) {
    runGenerationInBackground(email, film.id);
    return;
  }

  const secret = process.env.STORY_GENERATION_SECRET?.trim();

  if (!secret) {
    runGenerationInBackground(email, film.id);
    return;
  }

  const url = `${resolveAppBaseUrl()}/api/story-generation`;
  void fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-story-generation-secret": secret,
    },
    body: JSON.stringify({ email, filmId: film.id }),
  })
    .then(async (response) => {
      if (!response.ok) {
        const body = await response.text().catch(() => "");
        console.warn("Story generation API failed, fallback to direct run", {
          status: response.status,
          body,
          filmId: film.id,
        });
        runGenerationInBackground(email, film.id);
      }
    })
    .catch((error) => {
      console.error("Failed to schedule story generation request, fallback", {
        email,
        filmId: film.id,
        error,
      });
      runGenerationInBackground(email, film.id);
    });
}
