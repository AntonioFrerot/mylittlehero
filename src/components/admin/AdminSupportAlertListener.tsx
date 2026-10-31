"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useIsAdmin } from "@/components/auth/AuthProvider";
import { useLocale } from "@/components/LocaleProvider";
import {
  playSupportAlertSound,
  unlockSupportAlertAudio,
} from "@/lib/support-chat/play-alert-sound";
import type { SupportChatConversation } from "@/lib/support-chat/conversation-public";

type FeedResponse = {
  needsAttentionCount: number;
  serverTime: string;
  clients: {
    conversations: SupportChatConversation[];
  }[];
};

type ConversationSnap = {
  updatedAt: string;
  lastRole: string;
  messageCount: number;
};

function flattenConversations(data: FeedResponse): SupportChatConversation[] {
  return data.clients.flatMap((client) => client.conversations);
}

function buildSnap(
  conversations: SupportChatConversation[]
): Map<string, ConversationSnap> {
  const snap = new Map<string, ConversationSnap>();
  for (const conversation of conversations) {
    const last = conversation.messages.at(-1);
    snap.set(conversation.id, {
      updatedAt: conversation.updatedAt,
      lastRole: last?.role ?? "",
      messageCount: conversation.messages.length,
    });
  }
  return snap;
}

function hasNewClientMessage(
  previous: Map<string, ConversationSnap>,
  conversations: SupportChatConversation[]
): boolean {
  for (const conversation of conversations) {
    const last = conversation.messages.at(-1);
    if (last?.role !== "user") continue;

    const prior = previous.get(conversation.id);
    if (!prior) return true;

    if (
      conversation.updatedAt !== prior.updatedAt ||
      conversation.messages.length !== prior.messageCount
    ) {
      return true;
    }
  }
  return false;
}

type AdminSupportAlertListenerProps = {
  onNeedsAttentionChange?: (count: number) => void;
};

export function AdminSupportAlertListener({
  onNeedsAttentionChange,
}: AdminSupportAlertListenerProps) {
  const isAdmin = useIsAdmin();
  const { t } = useLocale();
  const [banner, setBanner] = useState<string | null>(null);
  const snapRef = useRef<Map<string, ConversationSnap> | null>(null);
  const readyRef = useRef(false);
  const lastAttentionRef = useRef(0);

  useEffect(() => {
    if (!isAdmin) return;

    const unlock = () => unlockSupportAlertAudio();
    document.addEventListener("pointerdown", unlock, { passive: true });
    document.addEventListener("keydown", unlock);

    return () => {
      document.removeEventListener("pointerdown", unlock);
      document.removeEventListener("keydown", unlock);
    };
  }, [isAdmin]);

  const poll = useCallback(async () => {
    const response = await fetch("/api/admin/support-chat", { cache: "no-store" });
    if (!response.ok) return;

    const data = (await response.json()) as FeedResponse;
    const conversations = flattenConversations(data);

    onNeedsAttentionChange?.(data.needsAttentionCount);
    window.dispatchEvent(
      new CustomEvent("mlh-support-meta", {
        detail: { needsAttentionCount: data.needsAttentionCount },
      })
    );

    const nextSnap = buildSnap(conversations);

    if (!readyRef.current) {
      snapRef.current = nextSnap;
      lastAttentionRef.current = data.needsAttentionCount;
      readyRef.current = true;
      return;
    }

    const previous = snapRef.current ?? new Map();
    const newClientMessage = hasNewClientMessage(previous, conversations);
    const attentionIncreased =
      data.needsAttentionCount > lastAttentionRef.current;

    if (newClientMessage || attentionIncreased) {
      playSupportAlertSound();
      setBanner(t("admin.supportLiveAlertBanner"));
    }

    snapRef.current = nextSnap;
    lastAttentionRef.current = data.needsAttentionCount;
  }, [onNeedsAttentionChange, t]);

  useEffect(() => {
    if (!isAdmin) return;

    void poll();
    const interval = window.setInterval(() => {
      void poll();
    }, 2000);

    return () => window.clearInterval(interval);
  }, [isAdmin, poll]);

  if (!isAdmin || !banner) return null;

  return (
    <div
      className="fixed inset-x-0 top-[calc(3.5rem+env(safe-area-inset-top,0px))] z-[80] flex justify-center px-4 md:top-[calc(4rem+env(safe-area-inset-top,0px))]"
      role="alert"
    >
      <Link
        href="/admin#manage-support"
        onClick={() => setBanner(null)}
        className="support-live-alert flex max-w-xl items-center gap-3 rounded-xl border border-gold/45 bg-gradient-to-r from-amber-950/95 via-cinema-night to-cinema-night px-4 py-3 text-sm font-medium text-cream shadow-lg shadow-black/40 animate-pulse"
      >
        <span className="inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-gold shadow-[0_0_12px_rgba(232,197,71,0.9)]" />
        <span>{banner}</span>
      </Link>
    </div>
  );
}
