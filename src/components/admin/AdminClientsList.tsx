"use client";

import Image from "next/image";
import { useState } from "react";
import type {
  AdminClientDetails,
  AdminClientSummary,
} from "@/lib/admin/clients";
import { translateFilmStatus } from "@/lib/i18n/film-labels";
import type { LocaleCode } from "@/lib/i18n/locales";
import { useLocale } from "@/components/LocaleProvider";

type AdminClientsListProps = {
  clients: AdminClientSummary[];
  locale: LocaleCode;
  onSelectEmail?: (email: string) => void;
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

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-xs text-cream/70">
      <span className="text-cream/45">{label}</span>
      <span className="font-medium text-cream/85">{value}</span>
    </span>
  );
}

function ClientDetailsPanel({
  email,
  locale,
  characterCount,
  filmCount,
}: {
  email: string;
  locale: LocaleCode;
  characterCount: number;
  filmCount: number;
}) {
  const { t } = useLocale();
  const [details, setDetails] = useState<AdminClientDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const ensureDetails = async () => {
    if (details || loading) return;
    setLoading(true);
    setError(false);
    try {
      const response = await fetch(
        `/api/admin/clients?email=${encodeURIComponent(email)}`
      );
      if (!response.ok) throw new Error("fetch_failed");
      setDetails((await response.json()) as AdminClientDetails);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="divide-y divide-white/8">
      <details
        className="group"
        onToggle={(event) => {
          if ((event.currentTarget as HTMLDetailsElement).open) {
            void ensureDetails();
          }
        }}
      >
        <summary className="cursor-pointer list-none px-4 py-3 transition-colors hover:bg-white/[0.03] md:px-5 [&::-webkit-details-marker]:hidden">
          <span className="text-sm font-medium text-cream/85">
            {t("admin.clientsCharactersSection", { count: characterCount })}
          </span>
        </summary>

        <div className="space-y-4 border-t border-white/8 bg-cinema-black/30 px-4 py-4 md:px-5">
          {loading ? (
            <p className="text-sm text-cream/50">{t("admin.sectionLoading")}</p>
          ) : error ? (
            <p className="text-sm text-red-200/90">{t("admin.sectionLoadError")}</p>
          ) : !details || details.characters.length === 0 ? (
            <p className="text-sm text-cream/50">{t("admin.clientsNoCharacters")}</p>
          ) : (
            details.characters.map((character) => (
              <div
                key={character.id}
                className="flex flex-col gap-3 rounded-xl border border-white/8 bg-black/20 p-3 sm:flex-row sm:items-start"
              >
                {character.photoSrc ? (
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black/40">
                    <Image
                      src={character.photoSrc}
                      alt={character.prenom}
                      fill
                      className="object-contain"
                      sizes="80px"
                    />
                  </div>
                ) : null}

                <div className="min-w-0 flex-1 space-y-2">
                  <div>
                    <p className="font-medium text-cream">{character.prenom}</p>
                    <p className="text-xs text-cream/50">
                      {[
                        character.age
                          ? t("admin.characterAge", { age: character.age })
                          : null,
                        character.taille,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>

                  {character.audioSrc ? (
                    <audio
                      controls
                      src={character.audioSrc}
                      className="w-full max-w-xs"
                      preload="metadata"
                    />
                  ) : (
                    <p className="text-xs text-amber-200/80">
                      {t("admin.missingCharacterAudio")}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </details>

      <details
        className="group"
        onToggle={(event) => {
          if ((event.currentTarget as HTMLDetailsElement).open) {
            void ensureDetails();
          }
        }}
      >
        <summary className="cursor-pointer list-none px-4 py-3 transition-colors hover:bg-white/[0.03] md:px-5 [&::-webkit-details-marker]:hidden">
          <span className="text-sm font-medium text-cream/85">
            {t("admin.clientsFilmsSection", { count: filmCount })}
          </span>
        </summary>

        <div className="border-t border-white/8 bg-cinema-black/30 px-4 py-4 md:px-5">
          {loading ? (
            <p className="text-sm text-cream/50">{t("admin.sectionLoading")}</p>
          ) : error ? (
            <p className="text-sm text-red-200/90">{t("admin.sectionLoadError")}</p>
          ) : !details || details.films.length === 0 ? (
            <p className="text-sm text-cream/50">{t("admin.clientsNoFilms")}</p>
          ) : (
            <ul className="space-y-2">
              {details.films.map((film) => (
                <li
                  key={film.id}
                  className="rounded-xl border border-white/8 bg-black/20 px-3 py-2.5 text-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-cream/90">
                      {film.title.trim() || t("admin.clientsUntitledFilm")}
                    </span>
                    <span className="text-xs text-cream/45">
                      {formatDate(film.createdAt, locale)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-cream/55">
                    {translateFilmStatus(film.status, locale)}
                    {film.isFreeTrial ? ` · ${t("admin.freeTrialBadge")}` : ""}
                    {film.isSample ? ` · ${t("admin.clientsSampleFilm")}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </details>
    </div>
  );
}

export function AdminClientsList({
  clients,
  locale,
  onSelectEmail,
}: AdminClientsListProps) {
  const { t } = useLocale();

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-white/8 pb-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-cream md:text-2xl">
            {t("admin.clientsListTitle")}
          </h2>
          <p className="mt-1 text-sm text-cream/55">{t("admin.clientsListLead")}</p>
        </div>
        <p className="text-sm text-cream/45">
          {t("admin.clientsListCount", { count: clients.length })}
        </p>
      </div>

      {clients.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/15 bg-cinema-night/50 px-6 py-10 text-center text-sm text-cream/55">
          {t("admin.clientsListEmpty")}
        </p>
      ) : (
        <div className="space-y-4">
          {clients.map((client) => (
            <article
              key={client.email}
              className="overflow-hidden rounded-2xl border border-white/10 bg-cinema-night/50"
            >
              <header className="border-b border-white/8 bg-black/20 px-4 py-4 md:px-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-cream">{client.email}</p>
                    {client.name ? (
                      <p className="text-sm text-cream/55">{client.name}</p>
                    ) : null}
                    <p className="mt-1 text-xs text-cream/45">
                      {t("admin.clientsRegisteredAt", {
                        date: formatDate(client.createdAt, locale),
                      })}
                    </p>
                  </div>

                  {onSelectEmail ? (
                    <button
                      type="button"
                      onClick={() => onSelectEmail(client.email)}
                      className="shrink-0 rounded-xl border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs font-medium text-gold-light transition-colors hover:bg-gold/15"
                    >
                      {t("admin.clientsUseEmail")}
                    </button>
                  ) : null}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <StatPill
                    label={t("admin.clientsTickets")}
                    value={client.ticketBalance}
                  />
                  <StatPill
                    label={t("admin.clientsJetons")}
                    value={client.jetonBalance}
                  />
                  <StatPill
                    label={t("admin.clientsCharacters")}
                    value={client.characterCount}
                  />
                  <StatPill
                    label={t("admin.clientsFilms")}
                    value={client.filmCount}
                  />
                  {client.filmsReadyCount > 0 ? (
                    <StatPill
                      label={t("admin.clientsFilmsReady")}
                      value={client.filmsReadyCount}
                    />
                  ) : null}
                </div>

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-cream/50">
                  <span>
                    {t("admin.clientsLocale")}:{" "}
                    <span className="text-cream/75">{client.locale.toUpperCase()}</span>
                  </span>
                  <span>
                    {t("admin.clientsSubscription")}:{" "}
                    <span className="text-cream/75">
                      {client.subscriptionPlanName ?? t("admin.clientsNoSubscription")}
                    </span>
                  </span>
                  <span>
                    {t("admin.clientsPurchased")}:{" "}
                    <span className="text-cream/75">
                      {client.hasPurchased
                        ? t("admin.clientsYes")
                        : t("admin.clientsNo")}
                    </span>
                  </span>
                </div>
              </header>

              <ClientDetailsPanel
                email={client.email}
                locale={locale}
                characterCount={client.characterCount}
                filmCount={client.filmCount}
              />
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
