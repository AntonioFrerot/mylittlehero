"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminSubNav } from "@/components/admin/AdminSubNav";
import { useLocale } from "@/components/LocaleProvider";
import type { ContactMessage } from "@/lib/contact/store";
import { BTN_3D_COMPACT_SECONDARY } from "@/lib/ui/button-3d-classes";

type ContactPanel = "inbox" | "trash";

type AdminContactMessagesListProps = {
  initialInbox: ContactMessage[];
  onInboxCountChange?: (count: number) => void;
};

function formatDate(value: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

async function fetchBox(box: ContactPanel): Promise<ContactMessage[]> {
  const response = await fetch(`/api/admin/contact-messages?box=${box}`);
  if (!response.ok) throw new Error("fetch_failed");
  return (await response.json()) as ContactMessage[];
}

export function AdminContactMessagesList({
  initialInbox,
  onInboxCountChange,
}: AdminContactMessagesListProps) {
  const { t, locale } = useLocale();
  const [panel, setPanel] = useState<ContactPanel>("inbox");
  const [inbox, setInbox] = useState(initialInbox);
  const [trash, setTrash] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [emptyingTrash, setEmptyingTrash] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const syncInboxCount = useCallback(
    (messages: ContactMessage[]) => {
      onInboxCountChange?.(messages.length);
    },
    [onInboxCountChange]
  );

  const loadPanel = useCallback(
    async (target: ContactPanel) => {
      setLoading(true);
      setError(null);
      try {
        const messages = await fetchBox(target);
        if (target === "inbox") {
          setInbox(messages);
          syncInboxCount(messages);
        } else {
          setTrash(messages);
        }
      } catch {
        setError(t("admin.sectionLoadError"));
      } finally {
        setLoading(false);
      }
    },
    [syncInboxCount, t]
  );

  useEffect(() => {
    syncInboxCount(initialInbox);
  }, [initialInbox, syncInboxCount]);

  useEffect(() => {
    if (panel === "trash" && trash.length === 0) {
      void loadPanel("trash");
    }
  }, [panel, trash.length, loadPanel]);

  const activeMessages = panel === "inbox" ? inbox : trash;

  async function moveToTrash(messageId: string) {
    setPendingId(messageId);
    setError(null);
    try {
      const response = await fetch("/api/admin/contact-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "trash", messageId }),
      });
      if (!response.ok) throw new Error("trash_failed");
      setInbox((current) => {
        const next = current.filter((message) => message.id !== messageId);
        syncInboxCount(next);
        return next;
      });
      if (panel === "trash") {
        await loadPanel("trash");
      }
    } catch {
      setError(t("admin.contactFormActionError"));
    } finally {
      setPendingId(null);
    }
  }

  async function handleEmptyTrash() {
    if (trash.length === 0) return;
    if (!window.confirm(t("admin.contactFormEmptyTrashConfirm"))) return;

    setEmptyingTrash(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/contact-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "emptyTrash" }),
      });
      if (!response.ok) throw new Error("empty_failed");
      setTrash([]);
    } catch {
      setError(t("admin.contactFormActionError"));
    } finally {
      setEmptyingTrash(false);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-white/8 pb-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-cream md:text-2xl">
            {t("admin.contactFormTitle")}
          </h2>
          <p className="mt-1 text-sm text-cream/55">{t("admin.contactFormLead")}</p>
        </div>
      </div>

      <AdminSubNav
        items={[
          {
            id: "inbox",
            label: t("admin.contactFormInboxTab"),
            badge: inbox.length,
          },
          {
            id: "trash",
            label: t("admin.contactFormTrashTab"),
            badge: trash.length,
          },
        ]}
        active={panel}
        onSelect={(next) => {
          setPanel(next);
          if (next === "trash") void loadPanel("trash");
        }}
        ariaLabel={t("admin.contactFormSubNavLabel")}
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
              ? t("admin.contactFormEmptyTrashPending")
              : t("admin.contactFormEmptyTrash")}
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
      ) : activeMessages.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/15 bg-cinema-night/50 px-6 py-10 text-center text-sm text-cream/55">
          {panel === "inbox"
            ? t("admin.contactFormEmpty")
            : t("admin.contactFormTrashEmpty")}
        </p>
      ) : (
        <ul className="space-y-4">
          {activeMessages.map((entry) => (
            <li
              key={entry.id}
              className="overflow-hidden rounded-2xl border border-white/10 bg-cinema-night/50"
            >
              <header className="border-b border-white/8 bg-black/20 px-4 py-3 md:px-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-cream">{entry.name}</p>
                    <a
                      href={`mailto:${entry.email}`}
                      className="text-sm text-gold-light/90 transition-colors hover:text-gold-light"
                    >
                      {entry.email}
                    </a>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <time dateTime={entry.createdAt} className="text-xs text-cream/45">
                      {formatDate(entry.createdAt, locale)}
                    </time>
                    {panel === "inbox" ? (
                      <button
                        type="button"
                        disabled={pendingId === entry.id}
                        onClick={() => void moveToTrash(entry.id)}
                        className={BTN_3D_COMPACT_SECONDARY}
                      >
                        {pendingId === entry.id
                          ? t("admin.contactFormTrashPending")
                          : t("admin.contactFormMoveToTrash")}
                      </button>
                    ) : null}
                  </div>
                </div>
              </header>
              <p className="whitespace-pre-wrap px-4 py-4 text-sm leading-relaxed text-cream/85 md:px-5">
                {entry.message}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
