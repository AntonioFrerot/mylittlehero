"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import {
  conversationNeedsAttention,
  type AdminSupportChatClient,
  type SupportChatConversation,
} from "@/lib/support-chat/conversation-public";
import type { StoredChatMessage } from "@/lib/support-chat/message-types";
import { BTN_3D_COMPACT_SECONDARY, BTN_3D_PRIMARY_ACTION } from "@/lib/ui/button-3d-classes";

type FeedResponse = {
  clients: AdminSupportChatClient[];
  needsAttentionCount: number;
  serverTime: string;
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

function MessageBubble({
  message,
  t,
}: {
  message: StoredChatMessage;
  t: (key: import("@/lib/i18n/translator").TranslationKey) => string;
}) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <p className="max-w-[90%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-gradient-to-r from-gold-dark via-gold to-gold-light px-3.5 py-2.5 text-sm leading-relaxed text-cinema-black">
          {message.content}
        </p>
      </div>
    );
  }

  const isStaff = message.role === "staff";
  return (
    <div className="flex justify-start">
      <div className="max-w-[90%]">
        {isStaff ? (
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gold-light/80">
            {t("admin.supportLiveStaffLabel")}
          </p>
        ) : null}
        <p
          className={`whitespace-pre-wrap rounded-2xl rounded-bl-md px-3.5 py-2.5 text-sm leading-relaxed ${
            isStaff
              ? "border border-gold/35 bg-gold/10 text-cream"
              : "border border-white/10 bg-cinema-night text-cream/90"
          }`}
        >
          {message.content}
        </p>
      </div>
    </div>
  );
}

type AdminSupportLivePanelProps = {
  onMetaChange?: (meta: { needsAttentionCount: number; clientCount: number }) => void;
};

export function AdminSupportLivePanel({ onMetaChange }: AdminSupportLivePanelProps) {
  const { t, locale } = useLocale();
  const [clients, setClients] = useState<AdminSupportChatClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openConversationId, setOpenConversationId] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const refresh = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!options?.silent) setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/admin/support-chat", { cache: "no-store" });
        if (!response.ok) throw new Error("fetch_failed");
        const data = (await response.json()) as FeedResponse;
        setClients(data.clients);
        onMetaChange?.({
          needsAttentionCount: data.needsAttentionCount,
          clientCount: data.clients.length,
        });
        window.dispatchEvent(
          new CustomEvent("mlh-support-meta", {
            detail: { needsAttentionCount: data.needsAttentionCount },
          })
        );
      } catch {
        setError(t("admin.sectionLoadError"));
      } finally {
        if (!options?.silent) setLoading(false);
      }
    },
    [onMetaChange, t]
  );

  useEffect(() => {
    void refresh();
    const interval = window.setInterval(() => {
      void refresh({ silent: true });
    }, 2500);
    return () => window.clearInterval(interval);
  }, [refresh]);

  const allConversations = clients.flatMap((client) =>
    client.conversations.map((conversation) => ({ client, conversation }))
  );

  async function runAction(
    conversationId: string,
    action: "takeover" | "release" | "reply" | "close",
    message?: string
  ) {
    setPendingAction(`${action}:${conversationId}`);
    setError(null);
    try {
      const response = await fetch("/api/admin/support-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, conversationId, message }),
      });
      if (!response.ok) throw new Error("action_failed");
      if (action === "reply") setReplyDraft("");
      await refresh({ silent: true });
    } catch {
      setError(t("admin.supportLiveActionError"));
    } finally {
      setPendingAction(null);
    }
  }

  function clientLabel(client: AdminSupportChatClient): string {
    if (client.email) return client.email;
    return t("admin.supportLiveGuestClient");
  }

  if (loading && clients.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-white/15 bg-cinema-night/50 px-6 py-10 text-center text-sm text-cream/55">
        {t("admin.sectionLoading")}
      </p>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-white/8 pb-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-cream md:text-2xl">
            {t("admin.supportChatTitle")}
          </h2>
          <p className="mt-1 text-sm text-cream/55">{t("admin.supportLiveLead")}</p>
        </div>
        <p className="text-xs text-cream/45">{t("admin.supportLivePollingHint")}</p>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      {allConversations.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/15 bg-cinema-night/50 px-6 py-10 text-center text-sm text-cream/55">
          {t("admin.supportChatEmpty")}
        </p>
      ) : (
        <div className="space-y-4">
          {allConversations.map(({ client, conversation }) => {
            const isOpen = openConversationId === conversation.id;
            const isClosed = Boolean(conversation.closedAt);
            const needsReply = conversationNeedsAttention(conversation);

            return (
              <article
                key={conversation.id}
                className={`overflow-hidden rounded-2xl border bg-cinema-night/50 ${
                  needsReply ? "border-gold/35" : "border-white/10"
                }`}
              >
                <button
                  type="button"
                  className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.03] md:px-5"
                  onClick={() =>
                    setOpenConversationId(isOpen ? null : conversation.id)
                  }
                >
                  <div className="min-w-0">
                    <p className="font-medium text-cream">{clientLabel(client)}</p>
                    {client.name ? (
                      <p className="text-sm text-cream/55">{client.name}</p>
                    ) : null}
                    <p className="mt-1 text-xs text-cream/45">
                      {t("admin.supportChatSession", {
                        date: formatDate(conversation.updatedAt, locale),
                      })}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    {needsReply ? (
                      <span className="rounded-full border border-gold/40 bg-gold/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold-light">
                        {t("admin.supportLiveNeedsReply")}
                      </span>
                    ) : null}
                    {isClosed ? (
                      <span className="rounded-full border border-white/20 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cream/55">
                        {t("admin.supportLiveClosedBadge")}
                      </span>
                    ) : null}
                    {conversation.humanTakeover && !isClosed ? (
                      <span className="text-[10px] font-medium uppercase tracking-wide text-emerald-300/85">
                        {t("admin.supportLiveHumanMode")}
                      </span>
                    ) : null}
                  </div>
                </button>

                {isOpen ? (
                  <div className="space-y-4 border-t border-white/8 bg-cinema-black/30 px-4 py-4 md:px-5">
                    <div className="space-y-3">
                      {conversation.messages.map((message, index) => (
                        <MessageBubble
                          key={`${conversation.id}-${index}-${message.createdAt}`}
                          message={message}
                          t={t}
                        />
                      ))}
                    </div>

                    {isClosed ? (
                      <p className="text-xs text-cream/45">{t("admin.supportLiveClosedHint")}</p>
                    ) : (
                      <>
                    <div className="flex flex-wrap gap-2">
                      {!conversation.humanTakeover ? (
                        <>
                          <button
                            type="button"
                            disabled={pendingAction !== null}
                            className={BTN_3D_PRIMARY_ACTION}
                            onClick={() => void runAction(conversation.id, "takeover")}
                          >
                            {pendingAction === `takeover:${conversation.id}`
                              ? t("admin.supportLivePending")
                              : t("admin.supportLiveTakeover")}
                          </button>
                          <p className="w-full text-xs text-cream/45">
                            {t("admin.supportLiveTakeoverHint")}
                          </p>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            disabled={pendingAction !== null}
                            className={BTN_3D_COMPACT_SECONDARY}
                            onClick={() => void runAction(conversation.id, "release")}
                          >
                            {pendingAction === `release:${conversation.id}`
                              ? t("admin.supportLivePending")
                              : t("admin.supportLiveReleaseBot")}
                          </button>
                          <p className="w-full text-xs text-emerald-300/75">
                            {t("admin.supportLiveHumanActiveHint")}
                          </p>
                        </>
                      )}
                      <button
                        type="button"
                        disabled={pendingAction !== null}
                        className={BTN_3D_COMPACT_SECONDARY}
                        onClick={() => void runAction(conversation.id, "close")}
                      >
                        {pendingAction === `close:${conversation.id}`
                          ? t("admin.supportLivePending")
                          : t("admin.supportLiveCloseChat")}
                      </button>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs text-cream/55">
                        {t("admin.supportLiveReplyLabel")}
                      </label>
                      <textarea
                        value={openConversationId === conversation.id ? replyDraft : ""}
                        onChange={(event) => setReplyDraft(event.target.value)}
                        rows={3}
                        disabled={!conversation.humanTakeover}
                        className="w-full rounded-xl border border-white/10 bg-cinema-black/60 px-3 py-2 text-sm text-cream outline-none focus:border-gold/45 disabled:cursor-not-allowed disabled:opacity-45"
                        placeholder={
                          conversation.humanTakeover
                            ? t("admin.supportLiveReplyPlaceholder")
                            : t("admin.supportLiveReplyLockedPlaceholder")
                        }
                      />
                      <button
                        type="button"
                        disabled={
                          pendingAction !== null ||
                          !conversation.humanTakeover ||
                          !replyDraft.trim() ||
                          openConversationId !== conversation.id
                        }
                        className={BTN_3D_PRIMARY_ACTION}
                        onClick={() =>
                          void runAction(conversation.id, "reply", replyDraft)
                        }
                      >
                        {pendingAction === `reply:${conversation.id}`
                          ? t("admin.supportLivePending")
                          : t("admin.supportLiveSendReply")}
                      </button>
                    </div>
                      </>
                    )}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
