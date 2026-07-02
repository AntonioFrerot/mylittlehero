"use client";

import { Suspense } from "react";
import { FilmDurationPicker } from "@/components/film-creation/FilmDurationPicker";
import { useFreeTrialIntent } from "@/hooks/use-free-trial-intent";

type FilmDurationPickerWithIntentProps = {
  value: number | null;
  onChange: (seconds: number) => void;
  freeFilmAvailable: boolean;
  jetonBalance?: number;
};

function FilmDurationPickerInner(props: FilmDurationPickerWithIntentProps) {
  const freeTrialIntent = useFreeTrialIntent();
  return <FilmDurationPicker {...props} freeTrialIntent={freeTrialIntent} />;
}

export function FilmDurationPickerWithIntent(
  props: FilmDurationPickerWithIntentProps
) {
  return (
    <Suspense
      fallback={
        <FilmDurationPicker {...props} freeTrialIntent={false} />
      }
    >
      <FilmDurationPickerInner {...props} />
    </Suspense>
  );
}
