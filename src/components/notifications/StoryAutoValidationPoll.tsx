"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthUser } from "@/hooks/use-auth-user";

type PendingAutoValidation = {
  filmId: string;
  timerStartedAt: string;
  dueAt: string;
  isDue: boolean;
};

type PendingAutoValidationsResponse = {
  validations: PendingAutoValidation[];
};

async function runAutoValidation(
  filmId: string,
  onValidated: () => void
): Promise<void> {
  try {
    const response = await fetch("/api/story-auto-validation/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filmId }),
    });
    if (!response.ok) return;

    const data = (await response.json()) as { validated?: boolean };
    if (data.validated) {
      onValidated();
    }
  } catch {
    // silencieux
  }
}

const PATHNAME_SYNC_DEBOUNCE_MS = 5000;

export function StoryAutoValidationPoll() {
  const user = useAuthUser();
  const pathname = usePathname();
  const router = useRouter();
  const timeoutIdsRef = useRef<number[]>([]);
  const pathnameSyncReadyRef = useRef(false);

  const clearScheduledTimeouts = useCallback(() => {
    for (const timeoutId of timeoutIdsRef.current) {
      window.clearTimeout(timeoutId);
    }
    timeoutIdsRef.current = [];
  }, []);

  const handleValidated = useCallback(() => {
    router.refresh();
  }, [router]);

  const scheduleAutoValidations = useCallback(
    (validations: PendingAutoValidation[]) => {
      clearScheduledTimeouts();

      for (const validation of validations) {
        if (validation.isDue) {
          void runAutoValidation(validation.filmId, handleValidated);
          continue;
        }

        const dueAtMs = new Date(validation.dueAt).getTime();
        const delayMs = dueAtMs - Date.now();
        if (delayMs <= 0) {
          void runAutoValidation(validation.filmId, handleValidated);
          continue;
        }

        const timeoutId = window.setTimeout(() => {
          void runAutoValidation(validation.filmId, handleValidated);
        }, delayMs);
        timeoutIdsRef.current.push(timeoutId);
      }
    },
    [clearScheduledTimeouts, handleValidated]
  );

  const syncAutoValidations = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch("/api/films/pending-auto-validations", {
        cache: "no-store",
      });
      if (!response.ok) return;

      const data = (await response.json()) as PendingAutoValidationsResponse;
      scheduleAutoValidations(data.validations ?? []);
    } catch {
      // silencieux
    }
  }, [scheduleAutoValidations, user]);

  useEffect(() => {
    if (!user) {
      clearScheduledTimeouts();
      pathnameSyncReadyRef.current = false;
      return;
    }

    pathnameSyncReadyRef.current = false;
    void syncAutoValidations();

    return () => {
      clearScheduledTimeouts();
    };
  }, [clearScheduledTimeouts, syncAutoValidations, user]);

  useEffect(() => {
    if (!user) return;

    if (!pathnameSyncReadyRef.current) {
      pathnameSyncReadyRef.current = true;
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void syncAutoValidations();
    }, PATHNAME_SYNC_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [pathname, syncAutoValidations, user]);

  return null;
}
