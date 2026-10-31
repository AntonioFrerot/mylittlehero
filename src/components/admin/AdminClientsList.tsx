"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type {
  AdminClientDetails,
  AdminClientSummary,
} from "@/lib/admin/clients";
import { AdminSubNav } from "@/components/admin/AdminSubNav";
import { translateFilmStatus } from "@/lib/i18n/film-labels";
import type { LocaleCode } from "@/lib/i18n/locales";
import { useLocale } from "@/components/LocaleProvider";
import { BTN_3D_COMPACT_SECONDARY } from "@/lib/ui/button-3d-classes";

type ClientsPanel = "inbox" | "trash";

type AdminClientsListProps = {
  clients: AdminClientSummary[];
  locale: LocaleCode;
  onSelectEmail?: (email: string) => void;
  onClientsChanged?: () => void;
};

async function fetchClientBox(box: ClientsPanel): Promise<AdminClientSummary[]> {
  const response = await fetch(`/api/admin/clients?box=${box}`, {
    cache: "no-store",
  });
  if (!response.ok) throw new Error("fetch_failed");
  return (await response.json()) as AdminClientSummary[];
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

function RestoreClientButton({
  email,
  onDone,
}: {
  email: string;
  onDone?: () => void;
}) {
  const { t } = useLocale();
  const [pending, setPending] = useState(false);

  async function handleRestore() {
    setPending(true);
    try {
      const response = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore", email }),
      });
      if (!response.ok) throw new Error("restore_failed");
      onDone?.();
    } catch {
      window.alert(t("admin.clientsRestoreError"));
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => void handleRestore()}
      className={BTN_3D_COMPACT_SECONDARY}
    >
      {pending ? t("admin.clientsRestorePending") : t("admin.clientsRestore")}
    </button>
  );
}

function TrashClientButton({
  email,
  onDone,
}: {
  email: string;
  onDone?: () => void;
}) {
  const { t } = useLocale();
  const [pending, setPending] = useState(false);

  async function handleTrash() {
    if (!window.confirm(t("admin.clientsTrashConfirm", { email }))) {
      return;
    }
    setPending(true);
    try {
      const response = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "trash", email }),
      });
      if (!response.ok) throw new Error("trash_failed");
      onDone?.();
    } catch {
      window.alert(t("admin.clientsTrashError"));
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => void handleTrash()}
      className={BTN_3D_COMPACT_SECONDARY}
    >
      {pending ? t("admin.clientsTrashPending") : t("admin.clientsMoveToTrash")}
    </button>
  );
}

function PurgeSuspiciousClientsButton({
  onDone,
}: {
  onDone?: () => void;
}) {
  const { t } = useLocale();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function run(apply: boolean) {
    setPending(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/purge-suspicious-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apply }),
      });
      const data = (await response.json()) as {
        suspiciousCount?: number;
        removed?: number;
        suspicious?: string[];
      };
      if (!response.ok) throw new Error("purge_failed");

      if (!apply) {
        const count = data.suspiciousCount ?? 0;
        if (count === 0) {
          setMessage(t("admin.clientsPurgeNone"));
          return;
        }
        const sample = (data.suspicious ?? []).slice(0, 5).join("\n");
        const extra =
          count > 5
            ? `\n… +${count - 5}`
            : "";
        const ok = window.confirm(
          `${t("admin.clientsPurgeConfirm", { count })}\n\n${sample}${extra}`
        );
        if (ok) await run(true);
        return;
      }

      setMessage(
        t("admin.clientsPurgeDone", {
          count: data.removed ?? 0,
        })
      );
      onDone?.();
    } catch {
      setMessage(t("admin.clientsPurgeError"));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        className={BTN_3D_COMPACT_SECONDARY}
        onClick={() => void run(false)}
      >
        {pending ? t("admin.clientsPurgePending") : t("admin.clientsPurgeButton")}
      </button>
      {message ? (
        <p className="max-w-xs text-right text-xs text-cream/55">{message}</p>
      ) : null}
    </div>
  );
}

export function AdminClientsList({
  clients: initialInbox,
  locale,
  onSelectEmail,
  onClientsChanged,
}: AdminClientsListProps) {
  const { t } = useLocale();
  const [panel, setPanel] = useState<ClientsPanel>("inbox");
  const [inbox, setInbox] = useState(initialInbox);
  const [trash, setTrash] = useState<AdminClientSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [emptyingTrash, setEmptyingTrash] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeClients = panel === "inbox" ? inbox : trash;

  const loadPanel = useCallback(
    async (target: ClientsPanel) => {
      setLoading(true);
      setError(null);
      try {
        const rows = await fetchClientBox(target);
        if (target === "inbox") {
          setInbox(rows);
        } else {
          setTrash(rows);
        }
      } catch {
        setError(t("admin.sectionLoadError"));
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  useEffect(() => {
    setInbox(initialInbox);
  }, [initialInbox]);

  useEffect(() => {
    if (panel === "trash" && trash.length === 0) {
      void loadPanel("trash");
    }
  }, [panel, trash.length, loadPanel]);

  async function handleInboxChanged() {
    await loadPanel("inbox");
    onClientsChanged?.();
  }

  async function handleTrashChanged() {
    await Promise.all([loadPanel("trash"), loadPanel("inbox")]);
    onClientsChanged?.();
  }

  async function handleEmptyTrash() {
    if (trash.length === 0) return;
    if (!window.confirm(t("admin.clientsEmptyTrashConfirm"))) return;

    setEmptyingTrash(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "emptyTrash" }),
      });
      if (!response.ok) throw new Error("empty_failed");
      setTrash([]);
      await handleInboxChanged();
    } catch {
      setError(t("admin.clientsTrashError"));
    } finally {
      setEmptyingTrash(false);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-white/8 pb-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-cream md:text-2xl">
            {t("admin.clientsListTitle")}
          </h2>
          <p className="mt-1 text-sm text-cream/55">{t("admin.clientsListLead")}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {panel === "inbox" ? (
            <PurgeSuspiciousClientsButton onDone={() => void handleInboxChanged()} />
          ) : null}
          <p className="text-sm text-cream/45">
            {t("admin.clientsListCount", { count: inbox.length })}
          </p>
        </div>
      </div>

      <AdminSubNav
        items={[
          {
            id: "inbox",
            label: t("admin.clientsInboxTab"),
            badge: inbox.length,
          },
          {
            id: "trash",
            label: t("admin.clientsTrashTab"),
            badge: trash.length,
          },
        ]}
        active={panel}
        onSelect={(next) => {
          setPanel(next);
          if (next === "trash") void loadPanel("trash");
        }}
        ariaLabel={t("admin.clientsSubNavLabel")}
      />

      {panel === "trash" && trash.length > 0 ? (
        <div className="flex justify-end">
          <button
            type="button"
            disabled={emptyingTrash}
            onClick={() => void handleEmptyTrash()}
            className="rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-200/90 transition-colors hover:bg-red-950/35 disabled:opacity-50"
          >
            {emptyingTrash
              ? t("admin.clientsEmptyTrashPending")
              : t("admin.clientsEmptyTrash")}
          </button>
        </div>
      ) : null}

      {error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="rounded-2xl border border-dashed border-white/15 bg-cinema-night/50 px-6 py-10 text-center text-sm text-cream/55">
          {t("admin.sectionLoading")}
        </p>
      ) : activeClients.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/15 bg-cinema-night/50 px-6 py-10 text-center text-sm text-cream/55">
          {panel === "inbox"
            ? t("admin.clientsListEmpty")
            : t("admin.clientsTrashEmpty")}
        </p>
      ) : (
        <div className="space-y-4">
          {activeClients.map((client) => (
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
                      {panel === "trash" && client.deletedAt
                        ? t("admin.clientsTrashedAt", {
                            date: formatDate(client.deletedAt, locale),
                          })
                        : t("admin.clientsRegisteredAt", {
                            date: formatDate(client.createdAt, locale),
                          })}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                    {panel === "inbox" && onSelectEmail ? (
                      <button
                        type="button"
                        onClick={() => onSelectEmail(client.email)}
                        className="rounded-xl border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs font-medium text-gold-light transition-colors hover:bg-gold/15"
                      >
                        {t("admin.clientsUseEmail")}
                      </button>
                    ) : null}
                    {panel === "inbox" ? (
                      <TrashClientButton
                        email={client.email}
                        onDone={() => void handleInboxChanged()}
                      />
                    ) : (
                      <RestoreClientButton
                        email={client.email}
                        onDone={() => void handleTrashChanged()}
                      />
                    )}
                  </div>
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
