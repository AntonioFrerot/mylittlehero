"use client";

import { Button } from "@/components/ui/Button";
import { useLocale } from "@/components/LocaleProvider";
import {
  getFilmDurationSeconds,
  formatFilmDurationSeconds,
} from "@/lib/film-creation/duration";
import type { UserFilmWithStory } from "@/lib/film-creation/actions";
import { formatFilmSynopsisText, getFilmDisplayTitle } from "@/lib/film-creation/user-film-page";
import {
  resolveFilmDisplayStatus,
  translateFilmDisplayStatus,
} from "@/lib/film-creation/film-display-status";
import { isUserFreeTrialFilm } from "@/lib/film-creation/is-free-trial-film";
import { FilmStoryApprovalButtons } from "@/components/espace/FilmStoryApprovalButtons";
import { FilmStoryGenerationPoll } from "@/components/espace/FilmStoryGenerationPoll";
import { FilmStoryRetryButton } from "@/components/espace/FilmStoryRetryButton";
import { filmNeedsStoryPoll } from "@/lib/film-creation/story-poll";
import {
  filmDurationBadgeClassName,
  filmStatusBadgeClassName,
  filmThemeBadgeClassName,
} from "@/lib/film-meta-badges";
import {
  normalizeFilmStatus,
  translateFilmTheme,
} from "@/lib/i18n/film-labels";
import type { LocaleCode } from "@/lib/i18n/locales";
import { ShareFilmButton } from "@/components/espace/ShareFilmButton";
import { getYouTubeWatchUrl } from "@/lib/youtube";
import { SURFACE_3D_PANEL_LG } from "@/lib/ui/button-3d-classes";
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

function getFilmListSynopsis(
  film: UserFilmWithStory,
  t: ReturnType<typeof useLocale>["t"]
): { heading?: string; text: string; pending?: boolean } | null {
  if (isUserFreeTrialFilm(film)) {
    return null;
  }

  if (film.storyResume?.trim()) {
    return {
      heading: t("space.filmSynopsisHeading"),
      text: formatFilmSynopsisText(film.storyResume),
    };
  }

  const status = film.storyGeneration?.status;
  if (status === "generating") {
    return { text: t("space.storyStatusGenerating"), pending: true };
  }
  if (status === "awaiting_generation") {
    return { text: t("space.storyStatusAwaiting"), pending: true };
  }
  if (status === "failed") {
    return { text: t("space.storyStatusFailed"), pending: true };
  }

  return null;
}

type MesFilmsListProps = {
  films: UserFilmWithStory[];
  createFilmHref: string;
};

export function MesFilmsList({ films, createFilmHref }: MesFilmsListProps) {
  const { locale, t } = useLocale();
  const pollFilmIds = films.filter(filmNeedsStoryPoll).map((film) => film.id);

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
    <>
      <FilmStoryGenerationPoll filmIds={pollFilmIds} />
      <ul className="flex flex-col gap-[0.9rem]">
      {films.map((film) => {
        const isReady = normalizeFilmStatus(film.status) === "ready";
        const filmHref = `/mon-espace/films/${film.id}`;
        const isFreeTrial = isUserFreeTrialFilm(film);
        const displayTitle = getFilmDisplayTitle(
          film,
          locale,
          film.storyGeneratedTitle
        );
        const displayStatus = resolveFilmDisplayStatus(film);
        const synopsis = getFilmListSynopsis(film, t);

        return (
          <li key={film.id} className={`${SURFACE_3D_PANEL_LG} p-[1.125rem] md:p-[1.35rem]`}>
            <div className="flex flex-col">
              <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {!isFreeTrial ? (
                      <h3 className="font-display text-lg font-semibold text-cream md:text-xl">
                        <Link
                          href={filmHref}
                          className="transition-colors hover:text-gold-light"
                        >
                          {displayTitle}
                        </Link>
                      </h3>
                    ) : (
                      <Link
                        href={filmHref}
                        className="text-sm font-medium text-gold-light transition-colors hover:text-gold"
                      >
                        {t("space.freeTrialViewFilm")}
                      </Link>
                    )}
                    <span className={getStatusStyle(displayStatus)}>
                      {translateFilmDisplayStatus(displayStatus, locale)}
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
                  {synopsis ? (
                    <>
                      <div className="mt-[0.675rem] rounded-xl border border-gold/20 bg-gradient-to-br from-gold/10 via-cinema-night/30 to-cinema-night/10 px-3 py-2.5 sm:px-4">
                        {synopsis.heading ? (
                          <p className="text-xs font-semibold text-cream sm:text-sm">
                            {synopsis.heading}
                          </p>
                        ) : null}
                        <p
                          className={`${synopsis.heading ? "mt-1.5" : ""} line-clamp-4 text-sm leading-relaxed italic ${
                            synopsis.pending ? "text-cream/50" : "text-cream/65"
                          }`}
                        >
                          {synopsis.text}
                        </p>
                        {!synopsis.pending && film.storyResume?.trim() ? (
                          <p className="mt-2 text-sm">
                            <Link
                              href={filmHref}
                              className="font-medium text-gold-light underline-offset-2 transition-colors hover:text-gold hover:underline"
                            >
                              {t("space.readSynopsisMore")}
                            </Link>
                          </p>
                        ) : null}
                      </div>
                      {!synopsis.pending && !isReady ? (
                        <FilmStoryApprovalButtons
                          filmHref={filmHref}
                          filmId={film.id}
                          storyStatus={film.storyGeneration?.status}
                          storyValidatedAt={film.storyValidatedAt}
                          storyRegenerationUsed={film.storyRegenerationUsed}
                          hasResume={Boolean(film.storyResume?.trim())}
                        />
                      ) : null}
                    </>
                  ) : null}
                  {!isFreeTrial ? (
                    <FilmStoryRetryButton
                      filmId={film.id}
                      storyStatus={film.storyGeneration?.status}
                    />
                  ) : null}
                  {isReady && film.videoSrc ? (
                    <div className="mt-[0.9rem] flex flex-row flex-wrap items-center gap-[0.675rem]">
                      <Button href={filmHref} variant="primary" className="!text-sm">
                        {t("space.watchFilm")}
                      </Button>
                      <ShareFilmButton
                        url={getYouTubeWatchUrl(film.videoSrc) ?? film.videoSrc}
                        title={displayTitle || film.title}
                      />
                    </div>
                  ) : null}
                </div>
            </div>
          </li>
        );
      })}
    </ul>
    </>
  );
}
