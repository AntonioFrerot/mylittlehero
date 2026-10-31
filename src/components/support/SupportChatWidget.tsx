"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { WelcomeSampleOfferBubble } from "@/components/espace/WelcomeSampleOfferBubble";
import { useLocale } from "@/components/LocaleProvider";
import {
  BTN_3D_CHAT_SEND,
  BTN_3D_COMPACT_SECONDARY,
  BTN_3D_FAB,
  BTN_3D_ICON,
} from "@/lib/ui/button-3d-classes";
import { SUPPORT_WELCOME_MESSAGE } from "@/lib/support-chat/welcome-message";

type UiMessage = {
  id: string;
  role: "user" | "assistant" | "staff";
  content: string;
};

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path
        d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}

const CONVERSATION_STORAGE_KEY = "support-chat-conversation-id";

function peekConversationId(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(CONVERSATION_STORAGE_KEY);
}

function clearStoredConversationId() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(CONVERSATION_STORAGE_KEY);
}

function getOrCreateConversationId(): string {
  if (typeof window === "undefined") return "";
  const existing = peekConversationId();
  if (existing) return existing;
  const id = crypto.randomUUID();
  sessionStorage.setItem(CONVERSATION_STORAGE_KEY, id);
  return id;
}

function createWelcomeMessage(): UiMessage {
  return {
    id: "welcome",
    role: "assistant",
    content: SUPPORT_WELCOME_MESSAGE,
  };
}

export function SupportChatWidget({ initialOpen = false }: { initialOpen?: boolean }) {
  const { locale, t } = useLocale();
  const [open, setOpen] = useState(initialOpen);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [messages, setMessages] = useState<UiMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: SUPPORT_WELCOME_MESSAGE,
    },
  ]);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [humanMode, setHumanMode] = useState(false);
  const [chatEnded, setChatEnded] = useState(false);
  const [endingChat, setEndingChat] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    null
  );
  const lastSyncAtRef = useRef<string>(new Date(0).toISOString());

  const hasUserMessages = messages.some((message) => message.role === "user");
  const canEndChat = hasUserMessages && !chatEnded && !endingChat;

  useEffect(() => {
    if (!open) return;
    setActiveConversationId(peekConversationId());
  }, [open]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
    inputRef.current?.focus();
  }, [open, messages, pending]);

  useEffect(() => {
    if (!open) return;
    const conversationId = peekConversationId();
    if (!conversationId) return;

    const sync = async () => {
      try {
        const response = await fetch(
          `/api/support-chat/sync?conversationId=${encodeURIComponent(conversationId)}&since=${encodeURIComponent(lastSyncAtRef.current)}`,
          { cache: "no-store" }
        );
        if (!response.ok) return;
        const data = (await response.json()) as {
          humanTakeover?: boolean;
          closed?: boolean;
          messages?: { role: "user" | "assistant" | "staff"; content: string; createdAt: string }[];
          updatedAt?: string;
        };

        if (typeof data.humanTakeover === "boolean") {
          setHumanMode(data.humanTakeover);
        }

        const incoming = data.messages ?? [];
        if (incoming.length > 0) {
          setMessages((prev) => {
            const known = new Set(
              prev.map((message) => `${message.role}:${message.content}:${message.id}`)
            );
            const next = [...prev];
            for (const message of incoming) {
              if (message.role !== "staff" && message.role !== "assistant") continue;
              const id = `${message.role}-${message.createdAt}`;
              const key = `${message.role}:${message.content}:${id}`;
              if (known.has(key)) continue;
              known.add(key);
              next.push({
                id,
                role: message.role,
                content: message.content,
              });
            }
            return next;
          });
        }

        if (data.updatedAt) {
          lastSyncAtRef.current = data.updatedAt;
        } else if (incoming.length > 0) {
          lastSyncAtRef.current = new Date().toISOString();
        }

        if (data.closed) {
          clearStoredConversationId();
          setActiveConversationId(null);
          setHumanMode(false);
          setChatEnded(true);
        }
      } catch {
        // sync silencieux
      }
    };

    void sync();
    const interval = window.setInterval(() => {
      void sync();
    }, 2500);
    return () => window.clearInterval(interval);
  }, [open, chatEnded]);

  const endConversation = async () => {
    const conversationId =
      activeConversationId ?? peekConversationId() ?? getOrCreateConversationId();
    if (!conversationId || endingChat) return;

    setEndingChat(true);
    try {
      const response = await fetch("/api/support-chat/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });
      const data = (await response.json()) as {
        closingMessage?: string | null;
        error?: string;
      };
      if (!response.ok) throw new Error(data.error ?? "close_failed");

      if (data.closingMessage) {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-close-${Date.now()}`,
            role: "assistant",
            content: data.closingMessage!,
          },
        ]);
      }

      clearStoredConversationId();
      setActiveConversationId(null);
      setHumanMode(false);
      setChatEnded(true);
      lastSyncAtRef.current = new Date(0).toISOString();
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          content: t("supportWidget.networkError"),
        },
      ]);
    } finally {
      setEndingChat(false);
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || pending || endingChat) return;

    const userMessage: UiMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
    };

    const startingNewChat = chatEnded || !peekConversationId();
    const history = startingNewChat
      ? [createWelcomeMessage(), userMessage]
      : [...messages, userMessage];

    if (startingNewChat) {
      clearStoredConversationId();
      setChatEnded(false);
    }

    setMessages(history);
    setInput("");
    setPending(true);

    const conversationIdForSend = getOrCreateConversationId();
    setActiveConversationId(conversationIdForSend);

    try {
      const apiMessages = (startingNewChat ? [userMessage] : history)
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await fetch("/api/support-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          locale,
          conversationId: conversationIdForSend,
        }),
      });

      const data = (await response.json()) as {
        reply?: string | null;
        error?: string;
        conversationId?: string;
        humanMode?: boolean;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Erreur réseau");
      }

      if (data.conversationId && typeof window !== "undefined") {
        sessionStorage.setItem(CONVERSATION_STORAGE_KEY, data.conversationId);
        setActiveConversationId(data.conversationId);
      }

      if (data.humanMode) {
        setHumanMode(true);
      } else {
        setHumanMode(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: data.reply ?? t("supportWidget.networkError"),
          },
        ]);
      }

      lastSyncAtRef.current = new Date().toISOString();
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          content: t("supportWidget.networkError"),
        },
      ]);
    } finally {
      setPending(false);
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  };

  return (
    <div className="support-chat-stack fixed right-4 z-[60] flex flex-col items-end gap-2 safe-bottom sm:right-6">
      <WelcomeSampleOfferBubble />

      {open && (
        <div
          className="flex w-[min(100vw-2rem,24rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-cinema-surface shadow-[0_6px_18px_rgba(0,0,0,0.4)] sm:w-[22rem]"
          role="dialog"
          aria-label={t("supportWidget.dialogAria")}
        >
          <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-gradient-to-r from-cinema-surface to-cinema-night px-4 py-3">
            <div className="min-w-0">
              <p className="font-display text-sm font-semibold text-cream">
                {t("supportWidget.title")}
              </p>
              <p className="text-[11px] text-cream/50">
                {humanMode
                  ? t("supportWidget.subtitleHuman")
                  : t("supportWidget.subtitleBot")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className={`${BTN_3D_ICON} h-8 w-8 text-cream/70 hover:text-cream`}
              aria-label={t("supportWidget.minimizeAria")}
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>

          <div
            ref={listRef}
            className="flex max-h-[min(22rem,50vh)] flex-col gap-3 overflow-y-auto bg-cinema-surface px-3 py-4"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className="max-w-[90%]">
                  {message.role === "staff" ? (
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gold-light/80">
                      {t("supportWidget.staffLabel")}
                    </p>
                  ) : null}
                  <p
                    className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      message.role === "user"
                        ? "rounded-br-md bg-gradient-to-r from-gold-dark via-gold to-gold-light text-cinema-black"
                        : message.role === "staff"
                          ? "rounded-bl-md border border-gold/35 bg-gold/10 text-cream"
                          : "rounded-bl-md border border-white/10 bg-cinema-night text-cream/90"
                    }`}
                  >
                    {message.content}
                  </p>
                </div>
              </div>
            ))}
            {pending && (
              <div className="flex justify-start">
                <p className="rounded-2xl rounded-bl-md border border-white/10 bg-cinema-night px-3.5 py-2.5 text-sm text-cream/50">
                  <span className="inline-flex gap-1">
                    <span className="animate-pulse">●</span>
                    <span className="animate-pulse [animation-delay:150ms]">●</span>
                    <span className="animate-pulse [animation-delay:300ms]">●</span>
                  </span>
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-white/10 bg-cinema-night p-3">
            {canEndChat ? (
              <button
                type="button"
                onClick={() => void endConversation()}
                disabled={endingChat}
                className={`${BTN_3D_COMPACT_SECONDARY} mb-3 w-full justify-center text-xs font-semibold`}
              >
                {endingChat
                  ? t("supportWidget.endChatPending")
                  : t("supportWidget.endChat")}
              </button>
            ) : null}
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                rows={2}
                placeholder={
                  chatEnded
                    ? t("supportWidget.newChatPlaceholder")
                    : t("supportWidget.placeholder")
                }
                disabled={pending || endingChat}
                className="support-chat-input min-h-[44px] flex-1 resize-none rounded-xl border border-white/10 bg-cinema-black px-3 py-2 text-[16px] leading-snug text-cream placeholder:text-cream/35 outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 disabled:opacity-60 sm:text-sm"
              />
              <button
                type="button"
                onClick={() => void sendMessage()}
                disabled={pending || endingChat || !input.trim()}
                className={BTN_3D_CHAT_SEND}
              >
                {t("supportWidget.send")}
              </button>
            </div>
            <div className="mt-2 flex flex-col items-center gap-1.5">
              <p className="text-center text-[10px] text-cream/40">
                {t("supportWidget.contactHint")}{" "}
                <Link href="/contact" className="text-gold-light/80 hover:text-gold-light">
                  {t("supportWidget.contactLink")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`flex h-14 w-14 items-center justify-center rounded-full border shadow-lg transition-all ${
          open
            ? `${BTN_3D_ICON} h-14 w-14 rounded-full text-cream`
            : BTN_3D_FAB
        }`}
        aria-label={
          open ? t("supportWidget.closeFabAria") : t("supportWidget.openFabAria")
        }
        aria-expanded={open}
      >
        {open ? (
          <CloseIcon className="h-6 w-6" />
        ) : (
          <ChatIcon className="h-6 w-6" />
        )}
      </button>
    </div>
  );
}
