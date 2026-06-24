import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { AdminDeliverFilmForm } from "@/components/admin/AdminDeliverFilmForm";
import type { AdminFilmEntry } from "@/lib/film-creation/admin-films";
import { formatFilmDuration } from "@/lib/film-creation/types";
import { getFilmDisplayTitle } from "@/lib/film-creation/user-film-page";
import {
  translateFilmTheme,
  type FilmThemeId,
} from "@/lib/i18n/film-labels";
import type { LocaleCode } from "@/lib/i18n/locales";
import { createTranslator } from "@/lib/i18n/translator";
import { POSTER_DIMENSIONS } from "@/lib/hero-posters";

type AdminFilmsListProps = {
  awaiting: AdminFilmEntry[];
  completed: AdminFilmEntry[];
  locale: LocaleCode;
};

function formatDate(value: string, locale: LocaleCode): string {
  try {
    return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function AdminFilmDetails({
  film,
  locale,
}: {
  film: AdminFilmEntry;
  locale: LocaleCode;
}) {
  const t = createTranslator(locale);
  const main =
    film.characters.find((character) => character.isMain) ??
    film.characters[0] ??
    null;
  const title = getFilmDisplayTitle(
    film,
    locale,
    film.storyGeneratedTitle ?? film.title
  );
  const resume = film.storyResume?.trim() ?? "";
  const themes = film.themes
    .map((theme) => translateFilmTheme(String(theme) as FilmThemeId, locale))
    .join(", ");

  return (
  <>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {main?.photoSrc ? (
          <div className="shrink-0">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-cream/45">
              {t("admin.mainCharacterPhoto")}
            </p>
            <div className="relative h-44 w-36 overflow-hidden rounded-lg border border-white/10 bg-black/40 sm:h-52 sm:w-44">
              <Image
                src={main.photoSrc}
                alt={main.prenom}
                fill
                className="object-contain"
                sizes="(max-width: 640px) 144px, 176px"
              />
            </div>
            <p className="mt-2 text-sm font-medium text-cream">{main.prenom}</p>
            {main.age ? (
              <p className="text-xs text-cream/55">
                {t("admin.characterAge", { age: main.age })}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="min-w-0 flex-1 space-y-5">
          <header className="space-y-2 border-b border-white/8 pb-4">
            <p className="text-xs text-cream/50">{film.ownerEmail}</p>
            <h2 className="font-display text-xl font-semibold text-cream md:text-2xl">
              {title}
            </h2>
            {film.tagline?.trim() ? (
              <p className="text-sm italic text-gold-light/90">{film.tagline}</p>
            ) : null}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-cream/55">
              {themes ? <span>{themes}</span> : null}
              {film.durationSeconds ? (
                <span>{formatFilmDuration(film.durationSeconds)}</span>
              ) : null}
              {film.storyValidatedAt ? (
                <span>
                  {t("admin.validatedAt", {
                    date: formatDate(film.storyValidatedAt, locale),
                  })}
                </span>
              ) : null}
            </div>
          </header>

          {resume ? (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-cream/45">
                {t("admin.resume")}
              </h3>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-cream/80">
                {resume}
              </p>
            </section>
          ) : null}

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/8 bg-black/20 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-cream/45">
                {t("filmCreation.form.avoidQuestion")}
              </h3>
              <p className="mt-2 whitespace-pre-wrap text-sm text-cream/75">
                {film.avoid.trim() || t("admin.nothingSpecified")}
              </p>
            </div>
            <div className="rounded-xl border border-white/8 bg-black/20 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-cream/45">
                {t("filmCreation.form.storyQuestion")}
              </h3>
              <p className="mt-2 whitespace-pre-wrap text-sm text-cream/75">
                {film.additionalInfo?.trim() || t("admin.nothingSpecified")}
              </p>
            </div>
          </section>

          {film.characters.length > 1 ? (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-cream/45">
                {t("admin.allCharacters")}
              </h3>
              <ul className="mt-2 flex flex-wrap gap-2 text-sm text-cream/70">
                {film.characters.map((character) => (
                  <li
                    key={character.id}
                    className="rounded-full border border-white/10 px-3 py-1"
                  >
                    {character.prenom}
                    {character.isMain ? ` (${t("admin.mainCharacter")})` : ""}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>
  </>
  );
}

function AdminAwaitingFilmCard({
  film,
  locale,
}: {
  film: AdminFilmEntry;
  locale: LocaleCode;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-cinema-night/80 p-5 shadow-lg shadow-black/20 md:p-6">
      <AdminFilmDetails film={film} locale={locale} />
      <div className="mt-6 border-t border-white/8 pt-6">
        <AdminDeliverFilmForm ownerEmail={film.ownerEmail} filmId={film.id} />
      </div>
    </article>
  );
}

function AdminCompletedFilmCard({
  film,
  locale,
}: {
  film: AdminFilmEntry;
  locale: LocaleCode;
}) {
  const t = createTranslator(locale);
  const title = getFilmDisplayTitle(
    film,
    locale,
    film.storyGeneratedTitle ?? film.title
  );

  return (
    <article className="rounded-2xl border border-white/10 bg-cinema-night/60 p-5 md:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        {film.posterSrc ? (
          <div className="poster-aspect-box relative w-full max-w-[140px] shrink-0 overflow-hidden rounded-xl border border-white/10 ring-1 ring-gold/20">
            <Image
              src={film.posterSrc}
              alt={title}
              width={POSTER_DIMENSIONS.width}
              height={POSTER_DIMENSIONS.height}
              className="h-full w-full object-cover object-center"
            />
          </div>
        ) : null}

        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="text-xs text-cream/50">{film.ownerEmail}</p>
            <h2 className="font-display text-lg font-semibold text-cream md:text-xl">
              {title}
            </h2>
          </div>

          {film.videoSrc ? (
            <p className="text-sm text-cream/70">
              <span className="text-cream/45">{t("admin.deliveredVideo")} </span>
              <Link
                href={film.videoSrc}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-gold-light underline-offset-2 hover:underline"
              >
                {film.videoSrc}
              </Link>
            </p>
          ) : null}

          <p className="text-xs text-emerald-300/90">{t("admin.deliveredStatus")}</p>
        </div>
      </div>
    </article>
  );
}

function AdminSection({
  title,
  countLabel,
  emptyLabel,
  children,
}: {
  title: string;
  countLabel: string;
  emptyLabel: string;
  children: ReactNode;
}) {
  const isEmpty = !children;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-white/8 pb-3">
        <h2 className="font-display text-xl font-semibold text-cream md:text-2xl">
          {title}
        </h2>
        <p className="text-sm text-cream/45">{countLabel}</p>
      </div>
      {isEmpty ? (
        <p className="rounded-2xl border border-dashed border-white/15 bg-cinema-night/50 px-6 py-10 text-center text-sm text-cream/55">
          {emptyLabel}
        </p>
      ) : (
        <div className="space-y-6">{children}</div>
      )}
    </section>
  );
}

export function AdminFilmsList({
  awaiting,
  completed,
  locale,
}: AdminFilmsListProps) {
  const t = createTranslator(locale);

  return (
    <div className="space-y-12">
      <AdminSection
        title={t("admin.awaitingTitle")}
        countLabel={t("admin.filmCount", { count: awaiting.length })}
        emptyLabel={t("admin.awaitingEmpty")}
      >
        {awaiting.length > 0
          ? awaiting.map((film) => (
              <AdminAwaitingFilmCard
                key={`${film.ownerEmail}-${film.id}`}
                film={film}
                locale={locale}
              />
            ))
          : null}
      </AdminSection>

      <AdminSection
        title={t("admin.completedTitle")}
        countLabel={t("admin.filmCount", { count: completed.length })}
        emptyLabel={t("admin.completedEmpty")}
      >
        {completed.length > 0
          ? completed.map((film) => (
              <AdminCompletedFilmCard
                key={`${film.ownerEmail}-${film.id}`}
                film={film}
                locale={locale}
              />
            ))
          : null}
      </AdminSection>
    </div>
  );
}
