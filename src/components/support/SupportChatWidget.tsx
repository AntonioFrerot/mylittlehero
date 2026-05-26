"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SUPPORT_WELCOME_MESSAGE } from "@/lib/support-chat/knowledge";

type UiMessage = {
  id: string;
  role: "user" | "assistant";
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

export function SupportChatWidget() {
  const [open, setOpen] = useState(false);
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

  useEffect(() => {
    if (!open) return;
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
    inputRef.current?.focus();
  }, [open, messages, pending]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || pending) return;

    const userMessage: UiMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
    };

    const history = [...messages, userMessage];
    setMessages(history);
    setInput("");
    setPending(true);

    try {
      const apiMessages = history
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await fetch("/api/support-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = (await response.json()) as {
        reply?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Erreur réseau");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.reply ?? "Je n’ai pas pu répondre. Réessayez ou contactez-nous.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          content:
            "Désolé, une erreur est survenue. Vous pouvez réessayer dans un instant ou nous écrire via la page Contact.",
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
    <div className="fixed right-4 z-[60] flex flex-col items-end gap-3 safe-bottom sm:right-6">
      {open && (
        <div
          className="flex w-[min(100vw-2rem,24rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-cinema-night/98 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:w-[22rem]"
          role="dialog"
          aria-label="Assistant MyLittleHero"
        >
          <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-gradient-to-r from-cinema-surface to-cinema-night px-4 py-3">
            <div className="min-w-0">
              <p className="font-display text-sm font-semibold text-cream">
                Assistant MyLittleHero
              </p>
              <p className="text-[11px] text-cream/50">
                Analyse votre question et répond sur mesure
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 text-cream/70 transition-colors hover:bg-white/5 hover:text-cream"
              aria-label="Fermer le chat"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>

          <div
            ref={listRef}
            className="flex max-h-[min(22rem,50vh)] flex-col gap-3 overflow-y-auto px-3 py-4"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <p
                  className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    message.role === "user"
                      ? "rounded-br-md bg-gradient-to-r from-gold-dark via-gold to-gold-light text-cinema-black"
                      : "rounded-bl-md border border-white/10 bg-cinema-black/50 text-cream/90"
                  }`}
                >
                  {message.content}
                </p>
              </div>
            ))}
            {pending && (
              <div className="flex justify-start">
                <p className="rounded-2xl rounded-bl-md border border-white/10 bg-cinema-black/50 px-3.5 py-2.5 text-sm text-cream/50">
                  <span className="inline-flex gap-1">
                    <span className="animate-pulse">●</span>
                    <span className="animate-pulse [animation-delay:150ms]">●</span>
                    <span className="animate-pulse [animation-delay:300ms]">●</span>
                  </span>
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-white/10 bg-cinema-black/40 p-3">
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                rows={2}
                placeholder="Votre question…"
                disabled={pending}
                className="min-h-[44px] flex-1 resize-none rounded-xl border border-white/10 bg-cinema-black/60 px-3 py-2 text-sm text-cream placeholder:text-cream/35 outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => void sendMessage()}
                disabled={pending || !input.trim()}
                className="shrink-0 self-end rounded-xl bg-gradient-to-r from-gold-dark via-gold to-gold-light px-3 py-2.5 text-xs font-semibold text-cinema-black transition-all hover:brightness-110 disabled:opacity-50"
              >
                Envoyer
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-cream/40">
              Besoin d&apos;un humain ?{" "}
              <Link href="/contact" className="text-gold-light/80 hover:text-gold-light">
                Contact
              </Link>
            </p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`flex h-14 w-14 items-center justify-center rounded-full border shadow-lg transition-all ${
          open
            ? "border-white/15 bg-cinema-night text-cream hover:bg-cinema-surface"
            : "border-gold/40 bg-gradient-to-br from-gold-dark via-gold to-gold-light text-cinema-black shadow-glow-gold hover:scale-105"
        }`}
        aria-label={open ? "Fermer l'assistant" : "Ouvrir l'assistant"}
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
