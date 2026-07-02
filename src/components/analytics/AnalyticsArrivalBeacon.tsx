"use client";

import { useEffect } from "react";
import {
  arrivalStorageKeyForDay,
  getArrivalCalendarDayKey,
} from "@/lib/analytics/arrival-day";
import { VISITOR_COOKIE } from "@/lib/analytics/constants";
import { shouldRecordVisitEnvironment } from "@/lib/analytics/filter-visits";
import { shouldTrackVisit } from "@/lib/analytics/parse-visit";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function getOrCreateVisitorId(): string {
  const existing = readCookie(VISITOR_COOKIE)?.trim();
  if (existing) return existing;
  const visitorId = crypto.randomUUID();
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${VISITOR_COOKIE}=${encodeURIComponent(visitorId)}; path=/; max-age=${maxAge}; samesite=lax`;
  return visitorId;
}

export function AnalyticsArrivalBeacon() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const dayKey = getArrivalCalendarDayKey();
    const storageKey = arrivalStorageKeyForDay(dayKey);
    if (localStorage.getItem(storageKey) === "1") return;

    const pathname = window.location.pathname;
    const userAgent = navigator.userAgent;
    if (!shouldTrackVisit(pathname, userAgent)) return;
    if (!shouldRecordVisitEnvironment(window.location.hostname)) return;

    const visitorId = getOrCreateVisitorId();
    const payload = JSON.stringify({
      path: pathname,
      search: window.location.search || undefined,
      visitorId,
    });

    localStorage.setItem(storageKey, "1");

    const sent =
      typeof navigator.sendBeacon === "function" &&
      navigator.sendBeacon("/api/analytics/collect", new Blob([payload], { type: "application/json" }));

    if (!sent) {
      void fetch("/api/analytics/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {
        localStorage.removeItem(storageKey);
      });
    }
  }, []);

  return null;
}
