"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuthUser } from "@/hooks/use-auth-user";
import { requestNotificationsRefresh } from "@/lib/notifications/refresh";

type PendingValidationReminder = {
  filmId: string;
  timerStartedAt: string;
  dueAt: string;
  isDue: boolean;
};

type PendingValidationRemindersResponse = {
  reminders: PendingValidationReminder[];
};

async function sendValidationReminder(filmId: string): Promise<void> {
  try {
    const response = await fetch("/api/story-validation-reminder/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filmId }),
    });
    if (!response.ok) return;
    requestNotificationsRefresh();
  } catch {
    // silencieux
  }
}

const PATHNAME_SYNC_DEBOUNCE_MS = 5000;

export function StoryValidationReminderPoll() {
  const user = useAuthUser();
  const pathname = usePathname();
  const timeoutIdsRef = useRef<number[]>([]);
  const pathnameSyncReadyRef = useRef(false);

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
          void sendValidationReminder(reminder.filmId);
          continue;
        }

        const dueAtMs = new Date(reminder.dueAt).getTime();
        const delayMs = dueAtMs - Date.now();
        if (delayMs <= 0) {
          void sendValidationReminder(reminder.filmId);
          continue;
        }

        const timeoutId = window.setTimeout(() => {
          void sendValidationReminder(reminder.filmId);
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
      pathnameSyncReadyRef.current = false;
      return;
    }

    pathnameSyncReadyRef.current = false;
    void syncReminders();

    return () => {
      clearScheduledTimeouts();
    };
  }, [clearScheduledTimeouts, syncReminders, user]);

  useEffect(() => {
    if (!user) return;

    if (!pathnameSyncReadyRef.current) {
      pathnameSyncReadyRef.current = true;
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void syncReminders();
    }, PATHNAME_SYNC_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [pathname, syncReminders, user]);

  return null;
}
