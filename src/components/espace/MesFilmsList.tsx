"use client";

import { Button } from "@/components/ui/Button";
import { useLocale } from "@/components/LocaleProvider";
import {
  getFilmDurationSeconds,
  formatFilmDurationSeconds,
} from "@/lib/film-creation/duration";
import type { UserFilmWithStory } from "@/lib/film-creation/actions";
import type { StoryGenerationStatus } from "@/lib/story-generation/types";
import { FilmStoryRetryButton } from "@/components/espace/FilmStoryRetryButton";
import {
  filmDurationBadgeClassName,
  filmThemeBadgeClassName,
} from "@/lib/film-meta-badges";
import {
  normalizeFilmStatus,
  translateFilmStatus,
  translateFilmTheme,
  type FilmStatusId,
} from "@/lib/i18n/film-labels";
import type { LocaleCode } from "@/lib/i18n/locales";
import type { TranslationKey } from "@/lib/i18n/translator";
import { POSTER_DIMENSIONS } from "@/lib/hero-posters";
import { ShareFilmButton } from "@/components/espace/ShareFilmButton";
import Image from "next/image";
import Link from "next/link";

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

function storyStatusLabel(
  status: StoryGenerationStatus,
  mode: "openai" | "mock" | undefined,
  t: (key: TranslationKey) => string
): string {
  switch (status) {
    case "generating":
      return t("space.storyStatusGenerating");
    case "completed":
      return mode === "mock"
        ? t("space.storyStatusCompletedMock")
        : t("space.storyStatusCompleted");
    case "failed":
      return t("space.storyStatusFailed");
    default:
      return t("space.storyStatusAwaiting");
  }
}

type MesFilmsListProps = {
  films: UserFilmWithStory[];
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
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href="/catalogue" variant="secondary" className="!text-sm">
            {t("space.browseCatalog")}
          </Button>
          <Button href="/creer-film" variant="primary" className="!text-sm">
            {t("space.createFilm")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {films.map((film) => {
        const isReady = normalizeFilmStatus(film.status) === "ready";
        const filmHref = `/mon-espace/films/${film.id}`;

        return (
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
              {film.storyGeneration && (
                <p
                  className={`mt-3 text-sm ${
                    film.storyGeneration.status === "failed"
                      ? "text-red-300/80"
                      : film.storyGeneration.status === "completed"
                        ? "text-emerald-300/80"
                        : "text-cream/55"
                  }`}
                >
                  {storyStatusLabel(
                    film.storyGeneration.status,
                    film.storyGeneration.mode,
                    t
                  )}
                  {film.storyGeneration.error && (
                    <span className="mt-1 block text-xs text-red-300/70">
                      {film.storyGeneration.error}
                    </span>
                  )}
                </p>
              )}
              <FilmStoryRetryButton
                filmId={film.id}
                storyStatus={film.storyGeneration?.status}
              />
              {isReady && film.posterSrc && (
                <div className="mt-4 flex flex-wrap items-center justify-start gap-3">
                  <Button href={filmHref} variant="primary" className="!text-sm">
                    {t("space.watchFilm")}
                  </Button>
                  <ShareFilmButton path={filmHref} title={film.title} />
                </div>
              )}
            </div>
            {film.posterSrc && isReady && (
              <Link
                href={filmHref}
                className="mx-auto shrink-0 sm:ml-4 sm:mr-0"
                aria-label={t("space.filmPosterAlt", { title: film.title })}
              >
                <div className="poster-card relative w-[7.5rem] overflow-hidden rounded-xl shadow-poster ring-1 ring-gold/30 transition-transform hover:-translate-y-0.5 sm:w-[8.5rem]">
                  <div className="relative aspect-[2/3] w-full">
                    <Image
                      src={film.posterSrc}
                      alt={t("space.filmPosterAlt", { title: film.title })}
                      width={POSTER_DIMENSIONS.width}
                      height={POSTER_DIMENSIONS.height}
                      sizes="136px"
                      className="object-cover object-center"
                    />
                  </div>
                </div>
              </Link>
            )}
          </div>
        </li>
        );
      })}
    </ul>
  );
}
