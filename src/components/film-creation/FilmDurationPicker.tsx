"use client";

import { useId, useMemo, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import {
  FILM_DURATION_OPTIONS,
  formatFilmDurationSeconds,
} from "@/lib/film-creation/duration";

export function FilmDurationPicker() {
  const { locale, t } = useLocale();
  const sliderId = useId();
  const [index, setIndex] = useState(0);

  const options = useMemo(() => FILM_DURATION_OPTIONS, []);
  const selectedSeconds = options[index] ?? options[0];
  const displayLocale = locale === "fr" ? "fr" : "en";

  const minLabel = formatFilmDurationSeconds(options[0], displayLocale);
  const maxLabel = formatFilmDurationSeconds(
    options[options.length - 1],
    displayLocale
  );

  return (
    <fieldset className="space-y-4">
      <legend className="font-display text-lg font-semibold text-cream md:text-xl">
        {t("filmCreation.form.durationLegend")}
      </legend>
      <p className="text-sm text-cream/50">{t("filmCreation.form.durationHint")}</p>

      <input type="hidden" name="duration" value={selectedSeconds} />

      <div className="rounded-xl border border-white/10 bg-cinema-night/60 px-3 py-3 sm:px-4">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold/75">
            {t("filmCreation.form.durationLabel")}
          </span>
          <span className="font-display text-lg font-semibold tabular-nums text-gold-light">
            {formatFilmDurationSeconds(selectedSeconds, displayLocale)}
          </span>
        </div>

        <div className="mt-3">
          <input
            id={sliderId}
            type="range"
            min={0}
            max={options.length - 1}
            step={1}
            value={index}
            onChange={(event) => setIndex(Number(event.target.value))}
            aria-valuemin={0}
            aria-valuemax={options.length - 1}
            aria-valuenow={index}
            aria-valuetext={formatFilmDurationSeconds(
              selectedSeconds,
              displayLocale
            )}
            className="duration-slider w-full cursor-pointer appearance-none bg-transparent"
          />
          <div className="mt-1.5 flex justify-between text-[11px] text-cream/45">
            <span>{minLabel}</span>
            <span>{maxLabel}</span>
          </div>
        </div>
      </div>
    </fieldset>
  );
}
