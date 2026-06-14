"use client";

import { Button } from "@/components/ui/Button";
import { useLocale } from "@/components/LocaleProvider";
import {
  getFilmDurationSeconds,
  formatFilmDurationSeconds,
} from "@/lib/film-creation/duration";
import type { UserFilmWithStory } from "@/lib/film-creation/actions";
import { FilmStoryRetryButton } from "@/components/espace/FilmStoryRetryButton";
import {
  filmDurationBadgeClassName,
  filmStatusBadgeClassName,
  filmThemeBadgeClassName,
} from "@/lib/film-meta-badges";
import {
  normalizeFilmStatus,
  translateFilmStatus,
  translateFilmTheme,
} from "@/lib/i18n/film-labels";
import type { LocaleCode } from "@/lib/i18n/locales";
import { ShareFilmButton } from "@/components/espace/ShareFilmButton";
import { SURFACE_3D_PANEL_LG } from "@/lib/ui/button-3d-classes";
import Image from "next/image";
import Link from "next/link";

function getStatusStyle(status: string): string {
  return filmStatusBadgeClassName(status);
}

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

function FilmPoster({
  href,
  src,
  alt,
  className = "",
}: {
  href: string;
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`block shrink-0 ${className}`.trim()}
      aria-label={alt}
    >
      <div className="poster-card relative w-full overflow-hidden rounded-xl shadow-poster ring-1 ring-gold/30 transition-transform hover:-translate-y-0.5">
        <div className="relative aspect-[2/3] w-full">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 640px) 145px, 145px"
            className="object-cover object-center"
          />
        </div>
      </div>
    </Link>
  );
}

type MesFilmsListProps = {
  films: UserFilmWithStory[];
  createFilmHref: string;
};

export function MesFilmsList({ films, createFilmHref }: MesFilmsListProps) {
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
          <Button href={createFilmHref} variant="primary" className="!text-sm">
            {t("space.createFilm")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-[0.9rem]">
      {films.map((film) => {
        const isReady = normalizeFilmStatus(film.status) === "ready";
        const filmHref = `/mon-espace/films/${film.id}`;
        const posterAlt = t("space.filmPosterAlt", { title: film.title });
        const hasPoster = isReady && Boolean(film.posterSrc);

        return (
          <li key={film.id} className={`${SURFACE_3D_PANEL_LG} p-[1.125rem] md:p-[1.35rem]`}>
            <div
              className={
                hasPoster
                  ? "flex flex-col gap-[0.675rem] sm:flex-row sm:items-center sm:gap-[0.9rem]"
                  : "flex flex-col"
              }
            >
              <div
                className={
                  hasPoster
                    ? "flex min-w-0 flex-1 flex-row items-start gap-[0.675rem] sm:contents"
                    : "min-w-0 flex-1"
                }
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg font-semibold text-cream md:text-xl">
                      {film.title}
                    </h3>
                    <span className={getStatusStyle(film.status)}>
                      {translateFilmStatus(film.status, locale)}
                    </span>
                  </div>
                  <p className="mt-[0.45rem] text-xs text-cream/45">
                    {t("space.createdOn", {
                      date: formatDate(film.createdAt, locale),
                    })}
                  </p>
                  {film.characters && film.characters.length > 0 && (
                    <p className="mt-[0.45rem] text-sm text-cream/60">
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
                  <div className="mt-[0.675rem] flex flex-wrap gap-2">
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
                    <p className="mt-[0.675rem] line-clamp-2 text-sm text-cream/55">
                      {film.additionalInfo}
                    </p>
                  )}
                  <FilmStoryRetryButton
                    filmId={film.id}
                    storyStatus={film.storyGeneration?.status}
                  />
                  {hasPoster && film.posterSrc && (
                    <div className="mt-[0.9rem] hidden flex-row flex-wrap items-center gap-[0.675rem] sm:flex">
                      <Button href={filmHref} variant="primary" className="!text-sm">
                        {t("space.watchFilm")}
                      </Button>
                      <ShareFilmButton path={filmHref} title={film.title} />
                    </div>
                  )}
                </div>
                {hasPoster && film.posterSrc && (
                  <FilmPoster
                    href={filmHref}
                    src={film.posterSrc}
                    alt={posterAlt}
                    className="w-[9.075rem] sm:hidden"
                  />
                )}
              </div>
              {hasPoster && film.posterSrc && (
                <>
                  <div className="flex w-full justify-center sm:hidden">
                    <div className="flex flex-row items-center justify-center gap-2">
                      <Button href={filmHref} variant="primary" className="!text-sm">
                        {t("space.watchFilm")}
                      </Button>
                      <ShareFilmButton path={filmHref} title={film.title} />
                    </div>
                  </div>
                  <FilmPoster
                    href={filmHref}
                    src={film.posterSrc}
                    alt={posterAlt}
                    className="hidden w-[9.0508rem] sm:ml-[0.9rem] sm:block"
                  />
                </>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
