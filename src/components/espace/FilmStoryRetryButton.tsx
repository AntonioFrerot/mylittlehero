"use client";

import { useActionState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import {
  retryStoryGeneration,
  type StoryRetryState,
} from "@/lib/story-generation/actions";
import type { StoryGenerationStatus } from "@/lib/story-generation/types";
import { BTN_3D_SOFT } from "@/lib/ui/button-3d-classes";

type FilmStoryRetryButtonProps = {
  filmId: string;
  storyStatus?: StoryGenerationStatus;
};

const initialState: StoryRetryState = {};

export function FilmStoryRetryButton({
  filmId,
  storyStatus,
}: FilmStoryRetryButtonProps) {
  const { t } = useLocale();
  const [state, formAction, pending] = useActionState(
    retryStoryGeneration,
    initialState
  );

  if (
    storyStatus === "completed" ||
    storyStatus === "generating" ||
    storyStatus === "awaiting_generation"
  ) {
    return null;
  }

  const label =
    storyStatus === "failed"
      ? t("space.storyRetry.retryButton")
      : t("space.storyRetry.button");

  return (
    <form action={formAction} className="mt-4 flex flex-col gap-2">
      <input type="hidden" name="filmId" value={filmId} />
      <button
        type="submit"
        disabled={pending}
        className={BTN_3D_SOFT}
      >
        {pending ? t("space.storyRetry.pending") : label}
      </button>
      {state.error && (
        <p className="text-sm text-red-300/90" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="text-sm text-emerald-300/90" role="status">
          {state.success}
        </p>
      )}
    </form>
  );
}
