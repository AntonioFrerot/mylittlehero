"use client";

import dynamic from "next/dynamic";

const FilmStoryGenerationPoll = dynamic(
  () =>
    import("@/components/espace/FilmStoryGenerationPoll").then(
      (module) => module.FilmStoryGenerationPoll
    ),
  { ssr: false }
);

type FilmStoryGenerationPollLazyProps = {
  filmIds: string[];
};

export function FilmStoryGenerationPollLazy({
  filmIds,
}: FilmStoryGenerationPollLazyProps) {
  if (filmIds.length === 0) return null;
  return <FilmStoryGenerationPoll filmIds={filmIds} />;
}
