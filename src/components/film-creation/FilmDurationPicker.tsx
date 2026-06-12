"use client";

import Image from "next/image";
import { useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { SITE_TICKET_SRC } from "@/lib/brand";
import { formatFilmDurationSeconds } from "@/lib/film-creation/duration";
import {
  getTicketsRequiredForDuration,
  PAID_FILM_DURATION_SECONDS,
} from "@/lib/purchases/ticket-rules";

type FilmDurationPickerProps = {
  value: number;
  onChange: (seconds: number) => void;
};

export function FilmDurationPicker({ value, onChange }: FilmDurationPickerProps) {
  const { locale, t } = useLocale();
  const displayLocale = locale === "fr" ? "fr" : "en";
  const [selected, setSelected] = useState(value);

  function selectDuration(seconds: number) {
    setSelected(seconds);
    onChange(seconds);
  }

  function ticketLabel(count: number): string {
    return count === 1
      ? t("filmCreation.form.oneTicket")
      : t("filmCreation.form.ticketsCount", { count });
  }

  return (
    <fieldset className="space-y-4">
      <legend className="font-display text-lg font-semibold text-cream md:text-xl">
        {t("filmCreation.form.durationLegend")}
      </legend>
      <p className="text-sm text-cream/50">{t("filmCreation.form.durationHint")}</p>

      <input type="hidden" name="duration" value={selected} />

      <div className="duration-options">
        {PAID_FILM_DURATION_SECONDS.map((seconds) => {
          const isActive = selected === seconds;
          const tickets = getTicketsRequiredForDuration(seconds);

          return (
            <label
              key={seconds}
              className={`duration-option ${isActive ? "duration-option--active" : ""}`}
            >
              <input
                type="radio"
                name="durationChoice"
                value={seconds}
                checked={isActive}
                onChange={() => selectDuration(seconds)}
                className="sr-only"
              />

              <div className="duration-option__main">
                <span className="duration-option__value">
                  {formatFilmDurationSeconds(seconds, displayLocale)}
                </span>
              </div>

              <div className="duration-option__footer">
                <Image
                  src={SITE_TICKET_SRC}
                  alt=""
                  width={120}
                  height={48}
                  className="duration-option__ticket"
                  unoptimized
                />
                <span className="duration-option__cost">{ticketLabel(tickets)}</span>
              </div>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
