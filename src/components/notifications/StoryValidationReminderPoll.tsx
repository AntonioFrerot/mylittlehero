"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuthUser } from "@/hooks/use-auth-user";
import {
  requestNotificationsRefresh,
  VALIDATION_REMINDER_STATUS_POLL_MS,
} from "@/lib/notifications/refresh";

type PendingValidationReminder = {
  filmId: string;
  generationCompletedAt: string;
  dueAt: string;
  isDue: boolean;
};

type PendingValidationRemindersResponse = {
  reminders: PendingValidationReminder[];
};

async function triggerReminderCheck(): Promise<void> {
  try {
    const response = await fetch("/api/notifications", { cache: "no-store" });
    if (!response.ok) return;
    requestNotificationsRefresh();
  } catch {
    // silencieux
  }
}

export function StoryValidationReminderPoll() {
  const user = useAuthUser();
  const pathname = usePathname();
  const timeoutIdsRef = useRef<number[]>([]);

  const clearScheduledTimeouts = useCallback(() => {
    for (const timeoutId of timeoutIdsRef.current) {
      window.clearTimeout(timeoutId);
    }
    timeoutIdsRef.current = [];
  }, []);

  const scheduleReminders = useCallback(
    (reminders: PendingValidationReminder[]) => {
      clearScheduledTimeouts();

      for (const reminder of reminders) {
        if (reminder.isDue) {
          void triggerReminderCheck();
          continue;
        }

        const dueAtMs = new Date(reminder.dueAt).getTime();
        const delayMs = dueAtMs - Date.now();
        if (delayMs <= 0) {
          void triggerReminderCheck();
          continue;
        }

        const timeoutId = window.setTimeout(() => {
          void triggerReminderCheck();
        }, delayMs);
        timeoutIdsRef.current.push(timeoutId);
      }
    },
    [clearScheduledTimeouts]
  );

  const syncReminders = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch("/api/films/pending-validation-reminders", {
        cache: "no-store",
      });
      if (!response.ok) return;

      const data = (await response.json()) as PendingValidationRemindersResponse;
      scheduleReminders(data.reminders ?? []);
    } catch {
      // silencieux
    }
  }, [scheduleReminders, user]);

  useEffect(() => {
    if (!user) {
      clearScheduledTimeouts();
      return;
    }

    void syncReminders();

    const statusIntervalId = window.setInterval(() => {
      void syncReminders();
    }, VALIDATION_REMINDER_STATUS_POLL_MS);

    return () => {
      clearScheduledTimeouts();
      window.clearInterval(statusIntervalId);
    };
  }, [clearScheduledTimeouts, syncReminders, user]);

  useEffect(() => {
    if (!user) return;
    void syncReminders();
  }, [pathname, syncReminders, user]);

  return null;
}
