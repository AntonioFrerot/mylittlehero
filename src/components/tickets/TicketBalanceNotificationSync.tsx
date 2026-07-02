"use client";

import { useEffect } from "react";
import { useAuthUser } from "@/hooks/use-auth-user";
import { useTicketBalance } from "@/hooks/use-ticket-balance";
import { NOTIFICATIONS_REFRESH_EVENT } from "@/lib/notifications/refresh";
import type { UserNotification } from "@/lib/notifications/types";
import {
  readLastTicketBalanceNotificationAt,
  writeLastTicketBalanceNotificationAt,
} from "@/lib/tickets/client-balance-cache";

const TICKET_SYNC_INTERVAL_MS = 30_000;

type NotificationsResponse = {
  notifications: UserNotification[];
};

function findLatestTicketBalanceNotification(
  notifications: UserNotification[]
): UserNotification | null {
  let latest: UserNotification | null = null;

  for (const notification of notifications) {
    if (notification.kind !== "ticket_balance_updated") continue;
    if (!latest || notification.createdAt > latest.createdAt) {
      latest = notification;
    }
  }

  return latest;
}

export function TicketBalanceNotificationSync() {
  const user = useAuthUser();
  const { setTicketBalance } = useTicketBalance();

  useEffect(() => {
    if (!user?.email) return;
    const userEmail = user.email;

    let cancelled = false;

    async function syncFromNotifications() {
      if (document.visibilityState !== "visible") return;

      try {
        const response = await fetch("/api/notifications", { cache: "no-store" });
        if (!response.ok || cancelled) return;

        const data = (await response.json()) as NotificationsResponse;
        const latest = findLatestTicketBalanceNotification(data.notifications);
        if (!latest) return;

        const lastApplied = readLastTicketBalanceNotificationAt(userEmail);
        if (lastApplied && latest.createdAt <= lastApplied) return;

        const balance = Number(latest.body);
        if (!Number.isFinite(balance)) return;

        setTicketBalance(balance);
        writeLastTicketBalanceNotificationAt(userEmail, latest.createdAt);
      } catch {
        // Ignore network errors; next sync will retry.
      }
    }

    const sync = () => {
      void syncFromNotifications();
    };

    sync();
    window.addEventListener(NOTIFICATIONS_REFRESH_EVENT, sync);
    document.addEventListener("visibilitychange", sync);
    const intervalId = window.setInterval(sync, TICKET_SYNC_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.removeEventListener(NOTIFICATIONS_REFRESH_EVENT, sync);
      document.removeEventListener("visibilitychange", sync);
      window.clearInterval(intervalId);
    };
  }, [user?.email, setTicketBalance]);

  return null;
}
