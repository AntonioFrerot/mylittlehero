"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AdminDeliverFilmForm } from "@/components/admin/AdminDeliverFilmForm";
import { AdminDeliveryCountdown } from "@/components/admin/AdminDeliveryCountdown";
import type { AdminFilmEntry } from "@/lib/film-creation/admin-films";
import { parseDayKey } from "@/lib/calendar/date-utils";
import { isUserFreeTrialFilm } from "@/lib/film-creation/is-free-trial-film";
import { formatFilmDuration } from "@/lib/film-creation/types";
import { getFilmDisplayTitle } from "@/lib/film-creation/user-film-page";
import {
  translateFilmTheme,
  type FilmThemeId,
} from "@/lib/i18n/film-labels";
import type { LocaleCode } from "@/lib/i18n/locales";
import { createTranslator } from "@/lib/i18n/translator";
import { POSTER_DIMENSIONS } from "@/lib/hero-posters";

type AdminFilmsTabId = "urgent" | "scheduled" | "completed";

type AdminFilmsListProps = {
  awaitingUrgent: AdminFilmEntry[];
  awaitingScheduled: AdminFilmEntry[];
  completed: AdminFilmEntry[];
  locale: LocaleCode;
};

function formatScheduledDate(dayKey: string, locale: LocaleCode): string {
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parseDayKey(dayKey));
}

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

function AdminCharacterMedia({
  character,
  locale,
  compact = false,
}: {
  character: AdminFilmEntry["characters"][number];
  locale: LocaleCode;
  compact?: boolean;
}) {
  const t = createTranslator(locale);

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      {character.photoSrc ? (
        <div
          className={
            compact
              ? "relative h-24 w-20 overflow-hidden rounded-lg border border-white/10 bg-black/40"
              : "relative h-44 w-36 overflow-hidden rounded-lg border border-white/10 bg-black/40 sm:h-52 sm:w-44"
          }
        >
          <Image
            src={character.photoSrc}
            alt={character.prenom}
            fill
            className="object-contain"
            sizes={compact ? "80px" : "(max-width: 640px) 144px, 176px"}
          />
        </div>
      ) : null}

      {character.audioSrc ? (
        <div className="space-y-2">
          {!compact ? (
            <p className="text-xs font-medium uppercase tracking-wide text-cream/45">
              {t("admin.mainCharacterAudio")}
            </p>
          ) : null}
          <audio
            controls
            src={character.audioSrc}
            className={compact ? "w-full max-w-[12rem]" : "w-full max-w-xs"}
            preload="metadata"
          />
          <a
            href={character.audioSrc}
            download
            className="inline-flex text-xs text-gold-light underline-offset-2 hover:underline"
          >
            {t("admin.downloadCharacterAudio")}
          </a>
        </div>
      ) : (
        <p className="text-xs text-amber-200/80">{t("admin.missingCharacterAudio")}</p>
      )}
    </div>
  );
}

function AdminFilmDetails({
  film,
  locale,
}: {
  film: AdminFilmEntry;
  locale: LocaleCode;
}) {
  const t = createTranslator(locale);
  const isFreeTrial = isUserFreeTrialFilm(film);
  const main =
    film.characters.find((character) => character.isMain) ??
    film.characters[0] ??
    null;
  const title =
    getFilmDisplayTitle(film, locale, film.storyGeneratedTitle ?? film.title) ||
    (isFreeTrial ? t("space.freeTrialFilmMetaTitle") : "");
  const resume = film.storyResume?.trim() ?? "";
  const themes = film.themes
    .map((theme) => translateFilmTheme(String(theme) as FilmThemeId, locale))
    .join(", ");
  const secondaryCharacters = film.characters.filter(
    (character) => character.id !== main?.id
  );

  return (
  <>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {main ? (
          <div className="shrink-0">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-cream/45">
              {t("admin.mainCharacterPhoto")}
            </p>
            <AdminCharacterMedia character={main} locale={locale} />
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
              {isFreeTrial ? (
                <span className="rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 text-gold-light">
                  {t("admin.freeTrialBadge")}
                </span>
              ) : null}
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
              <span>
                {t("admin.createdAt", {
                  date: formatDate(film.createdAt, locale),
                })}
              </span>
              {film.scheduledDate ? (
                <span className="text-gold-light/90">
                  {t("admin.scheduledForShort", {
                    date: formatScheduledDate(film.scheduledDate, locale),
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

          {secondaryCharacters.length > 0 ? (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-cream/45">
                {t("admin.allCharacters")}
              </h3>
              <ul className="mt-3 grid gap-4 sm:grid-cols-2">
                {secondaryCharacters.map((character) => (
                  <li
                    key={character.id}
                    className="rounded-xl border border-white/10 bg-black/20 p-4"
                  >
                    <p className="text-sm font-medium text-cream">
                      {character.prenom}
                      {character.isMain ? ` (${t("admin.mainCharacter")})` : ""}
                    </p>
                    {character.age ? (
                      <p className="mt-1 text-xs text-cream/55">
                        {t("admin.characterAge", { age: character.age })}
                      </p>
                    ) : null}
                    <div className="mt-3">
                      <AdminCharacterMedia
                        character={character}
                        locale={locale}
                        compact
                      />
                    </div>
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
  variant,
}: {
  film: AdminFilmEntry;
  locale: LocaleCode;
  variant: "urgent" | "scheduled";
}) {
  const t = createTranslator(locale);
  const isFreeTrial = isUserFreeTrialFilm(film);

  return (
    <article
      className={`admin-film-card rounded-2xl border bg-cinema-night/80 p-5 shadow-lg shadow-black/20 md:p-6 ${
        variant === "scheduled"
          ? "admin-film-card--scheduled border-gold/25"
          : "admin-film-card--urgent border-white/10"
      }`}
    >
      <div className="admin-film-card__priority">
        {variant === "urgent" ? (
          <AdminDeliveryCountdown createdAt={film.createdAt} />
        ) : film.scheduledDate ? (
          <div className="admin-film-card__scheduled-badge">
            <p className="admin-film-card__scheduled-label">
              {t("admin.scheduledFor")}
            </p>
            <p className="admin-film-card__scheduled-date">
              {formatScheduledDate(film.scheduledDate, locale)}
            </p>
          </div>
        ) : null}
      </div>

      <AdminFilmDetails film={film} locale={locale} />
      <div className="mt-6 border-t border-white/8 pt-6">
        <AdminDeliverFilmForm
          ownerEmail={film.ownerEmail}
          filmId={film.id}
          isFreeTrial={isFreeTrial}
        />
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
  const isFreeTrial = isUserFreeTrialFilm(film);
  const title =
    getFilmDisplayTitle(film, locale, film.storyGeneratedTitle ?? film.title) ||
    (isFreeTrial ? t("space.freeTrialFilmMetaTitle") : "");

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

function AdminFilmsTabPanel({
  lead,
  countLabel,
  emptyLabel,
  children,
}: {
  lead?: string;
  countLabel: string;
  emptyLabel: string;
  children: ReactNode;
}) {
  const isEmpty = !children;

  return (
    <div className="admin-films-tab-panel space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-white/8 pb-3">
        {lead ? <p className="text-sm text-cream/55">{lead}</p> : <span />}
        <p className="text-sm text-cream/45">{countLabel}</p>
      </div>
      {isEmpty ? (
        <p className="rounded-2xl border border-dashed border-white/15 bg-cinema-night/50 px-6 py-10 text-center text-sm text-cream/55">
          {emptyLabel}
        </p>
      ) : (
        <div className="space-y-6">{children}</div>
      )}
    </div>
  );
}

export function AdminFilmsList({
  awaitingUrgent,
  awaitingScheduled,
  completed,
  locale,
}: AdminFilmsListProps) {
  const t = createTranslator(locale);
  const [activeTab, setActiveTab] = useState<AdminFilmsTabId>("urgent");

  const tabs: {
    id: AdminFilmsTabId;
    label: string;
    count: number;
    accent?: boolean;
  }[] = [
    {
      id: "urgent",
      label: t("admin.filmsTabUrgent"),
      count: awaitingUrgent.length,
      accent: awaitingUrgent.length > 0,
    },
    {
      id: "scheduled",
      label: t("admin.filmsTabScheduled"),
      count: awaitingScheduled.length,
    },
    {
      id: "completed",
      label: t("admin.filmsTabCompleted"),
      count: completed.length,
    },
  ];

  return (
    <div className="admin-films-list space-y-5">
      <nav className="admin-films-tabs" aria-label={t("admin.filmsTabsLabel")}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`admin-films-tabs__item${
                isActive ? " admin-films-tabs__item--active" : ""
              }${tab.accent && !isActive ? " admin-films-tabs__item--accent" : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="admin-films-tabs__label">{tab.label}</span>
              <span className="admin-films-tabs__count">{tab.count}</span>
            </button>
          );
        })}
      </nav>

      {activeTab === "urgent" ? (
        <AdminFilmsTabPanel
          lead={t("admin.awaitingUrgentLead")}
          countLabel={t("admin.filmCount", { count: awaitingUrgent.length })}
          emptyLabel={t("admin.awaitingUrgentEmpty")}
        >
          {awaitingUrgent.length > 0
            ? awaitingUrgent.map((film) => (
                <AdminAwaitingFilmCard
                  key={`urgent-${film.ownerEmail}-${film.id}`}
                  film={film}
                  locale={locale}
                  variant="urgent"
                />
              ))
            : null}
        </AdminFilmsTabPanel>
      ) : null}

      {activeTab === "scheduled" ? (
        <AdminFilmsTabPanel
          lead={t("admin.awaitingScheduledLead")}
          countLabel={t("admin.filmCount", { count: awaitingScheduled.length })}
          emptyLabel={t("admin.awaitingScheduledEmpty")}
        >
          {awaitingScheduled.length > 0
            ? awaitingScheduled.map((film) => (
                <AdminAwaitingFilmCard
                  key={`scheduled-${film.ownerEmail}-${film.id}`}
                  film={film}
                  locale={locale}
                  variant="scheduled"
                />
              ))
            : null}
        </AdminFilmsTabPanel>
      ) : null}

      {activeTab === "completed" ? (
        <AdminFilmsTabPanel
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
        </AdminFilmsTabPanel>
      ) : null}
    </div>
  );
}
