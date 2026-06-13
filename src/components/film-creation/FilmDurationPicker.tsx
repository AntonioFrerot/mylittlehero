"use client";

import Image from "next/image";
import { useLocale } from "@/components/LocaleProvider";
import { SITE_TICKET_SRC } from "@/lib/brand";
import { formatFilmDurationSeconds } from "@/lib/film-creation/duration";
import {
  FREE_FILM_DURATION_SECONDS,
  getTicketsRequiredForDuration,
  PAID_FILM_DURATION_SECONDS,
} from "@/lib/purchases/ticket-rules";

type FilmDurationPickerProps = {
  value: number | null;
  onChange: (seconds: number) => void;
  freeFilmAvailable?: boolean;
};

export function FilmDurationPicker({
  value,
  onChange,
  freeFilmAvailable = false,
}: FilmDurationPickerProps) {
  const { locale, t } = useLocale();
  const displayLocale = locale === "fr" ? "fr" : "en";

  function selectDuration(seconds: number) {
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

      <input type="hidden" name="duration" value={value ?? ""} />

      <div className="duration-options-wrap">
        <div className="duration-options">
          {PAID_FILM_DURATION_SECONDS.map((seconds) => {
            const isActive = value === seconds;
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

        {freeFilmAvailable ? (
          <label
            className={`duration-option duration-option--free ${
              value === FREE_FILM_DURATION_SECONDS ? "duration-option--active" : ""
            }`}
          >
            <input
              type="radio"
              name="durationChoice"
              value={FREE_FILM_DURATION_SECONDS}
              checked={value === FREE_FILM_DURATION_SECONDS}
              onChange={() => selectDuration(FREE_FILM_DURATION_SECONDS)}
              className="sr-only"
            />

            <div className="duration-option__main">
              <span className="duration-option__value">
                {formatFilmDurationSeconds(FREE_FILM_DURATION_SECONDS, displayLocale)}
              </span>
            </div>

            <p className="duration-option__free-note">
              {t("filmCreation.form.durationFreeOnce")}
            </p>

            <div className="duration-option__footer">
              <span className="duration-option__free-badge">
                {t("filmCreation.form.durationFreeBadge")}
              </span>
            </div>
          </label>
        ) : null}
      </div>
    </fieldset>
  );
}
