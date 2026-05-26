"use client";

import { Button } from "@/components/ui/Button";
import { useLocale } from "@/components/LocaleProvider";
import {
  getFilmDurationSeconds,
  formatFilmDurationSeconds,
} from "@/lib/film-creation/duration";
import type { UserFilm } from "@/lib/film-creation/types";
import {
  filmDurationBadgeClassName,
  filmStyleBadgeClassName,
  filmThemeBadgeClassName,
} from "@/lib/film-meta-badges";
import {
  normalizeFilmStatus,
  translateFilmStatus,
  translateFilmStyle,
  translateFilmTheme,
  type FilmStatusId,
} from "@/lib/i18n/film-labels";
import type { LocaleCode } from "@/lib/i18n/locales";

const statusStyles: Record<FilmStatusId, string> = {
  preparing: "border-amber-500/30 bg-amber-950/30 text-amber-200",
  generating: "border-sky-500/30 bg-sky-950/30 text-sky-200",
  ready: "border-emerald-500/30 bg-emerald-950/30 text-emerald-200",
};

const dateLocale: Record<LocaleCode, string> = {
  fr: "fr-FR",
  en: "en-GB",
  es: "es-ES",
  de: "de-DE",
  it: "it-IT",
  pt: "pt-PT",
};

function formatDate(iso: string, locale: LocaleCode): string {
  return new Intl.DateTimeFormat(dateLocale[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function getStatusStyle(status: string): string {
  const id = normalizeFilmStatus(status) ?? "preparing";
  return statusStyles[id];
}

type MesFilmsListProps = {
  films: UserFilm[];
};

export function MesFilmsList({ films }: MesFilmsListProps) {
  const { locale, t } = useLocale();

  if (films.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-cinema-night/40 p-10 text-center">
        <p className="font-display text-lg text-cream/70">{t("space.noFilms")}</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-cream/50">
          {t("space.noFilmsHint")}
        </p>
        <div className="mt-8">
          <Button href="/creer-film" variant="primary" className="!text-sm">
            {t("space.createFilm")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {films.map((film) => (
        <li
          key={film.id}
          className="rounded-2xl border border-white/10 bg-cinema-surface/80 p-5 transition-colors hover:border-white/15 md:p-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-lg font-semibold text-cream md:text-xl">
                  {film.title}
                </h3>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${getStatusStyle(film.status)}`}
                >
                  {translateFilmStatus(film.status, locale)}
                </span>
              </div>
              <p className="mt-2 text-xs text-cream/45">
                {t("space.createdOn", { date: formatDate(film.createdAt, locale) })}
              </p>
              {film.characters && film.characters.length > 0 && (
                <p className="mt-2 text-sm text-cream/60">
                  {t("space.charactersLabel")}{" "}
                  <span className="text-cream/80">
                    {film.characters
                      .map((c) =>
                        c.isMain
                          ? `${c.prenom} (${t("filmCreation.form.mainCharacterBadge")})`
                          : c.prenom
                      )
                      .join(", ")}
                  </span>
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <span
                  className={`${filmStyleBadgeClassName(film.style)} film-badge--compact`}
                >
                  {translateFilmStyle(film.style, locale)}
                </span>
                {film.themes.map((theme) => (
                  <span
                    key={theme}
                    className={`${filmThemeBadgeClassName(theme)} film-badge--compact`}
                  >
                    {translateFilmTheme(theme, locale)}
                  </span>
                ))}
                {(() => {
                  const durationSec = getFilmDurationSeconds(film);
                  if (durationSec == null) return null;
                  const displayLocale = locale === "fr" ? "fr" : "en";
                  return (
                    <span
                      className={`${filmDurationBadgeClassName()} film-badge--compact`}
                    >
                      {formatFilmDurationSeconds(durationSec, displayLocale)}
                    </span>
                  );
                })()}
              </div>
              {film.additionalInfo && (
                <p className="mt-3 line-clamp-2 text-sm text-cream/55">
                  {film.additionalInfo}
                </p>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
