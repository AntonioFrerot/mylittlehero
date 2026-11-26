"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { WelcomeSampleOfferBubble } from "@/components/espace/WelcomeSampleOfferBubble";
import { useLocale } from "@/components/LocaleProvider";
import { BTN_3D_FAB } from "@/lib/ui/button-3d-classes";

const SupportChatWidget = dynamic(
  () =>
    import("@/components/support/SupportChatWidget").then(
      (module) => module.SupportChatWidget
    ),
  { ssr: false }
);

const DEFER_MS = 2_500;
const IDLE_TIMEOUT_MS = 3_000;

function useDeferSupportChatUi(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) return;

    let cancelled = false;
    const unlock = () => {
      if (!cancelled) setReady(true);
    };

    let idleHandle: number | undefined;
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

    if (typeof window.requestIdleCallback === "function") {
      idleHandle = window.requestIdleCallback(unlock, {
        timeout: IDLE_TIMEOUT_MS,
      });
    } else {
      timeoutHandle = setTimeout(unlock, DEFER_MS);
    }

    window.addEventListener("scroll", unlock, { passive: true, once: true });
    window.addEventListener("touchstart", unlock, { passive: true, once: true });
    window.addEventListener("pointerdown", unlock, { once: true });

    return () => {
      cancelled = true;
      if (idleHandle !== undefined && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleHandle);
      }
      if (timeoutHandle !== undefined) {
        clearTimeout(timeoutHandle);
      }
      window.removeEventListener("scroll", unlock);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("pointerdown", unlock);
    };
  }, [ready]);

  return ready;
}

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

export function SupportChatLazy() {
  const { t } = useLocale();
  const deferReady = useDeferSupportChatUi();
  const [widgetRequested, setWidgetRequested] = useState(false);

  if (!deferReady) {
    return null;
  }

  if (!widgetRequested) {
    return (
      <div className="support-chat-stack pointer-events-none fixed right-4 z-[60] flex flex-col items-end gap-2 safe-bottom sm:right-6">
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          <WelcomeSampleOfferBubble />
          <button
            type="button"
            onClick={() => setWidgetRequested(true)}
            className={`pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full border shadow-lg transition-all ${BTN_3D_FAB}`}
            aria-label={t("supportWidget.openFabAria")}
          >
            <ChatIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    );
  }

  return <SupportChatWidget initialOpen />;
}