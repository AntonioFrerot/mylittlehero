import { todayDayKey } from "@/lib/calendar/date-utils";
import { formatCooldownRemaining } from "./creation-cooldown";

export const FILM_DELIVERY_DEADLINE_MS = 24 * 60 * 60 * 1000;

export type DeliveryDeadlineState = {
  endsAt: string;
  remainingMs: number;
  overdue: boolean;
};

export function isFutureScheduledFilm(film: {
  scheduledDate?: string;
}): boolean {
  const scheduledDate = film.scheduledDate?.trim();
  if (!scheduledDate) return false;
  return scheduledDate > todayDayKey();
}

export function getDeliveryDeadlineEndsAt(createdAt: string): string {
  const anchorMs = new Date(createdAt).getTime();
  return new Date(anchorMs + FILM_DELIVERY_DEADLINE_MS).toISOString();
}

export function getDeliveryDeadlineState(
  createdAt: string,
  now: Date = new Date()
): DeliveryDeadlineState {
  const endsAt = getDeliveryDeadlineEndsAt(createdAt);
  const remainingMs = new Date(endsAt).getTime() - now.getTime();

  return {
    endsAt,
    remainingMs,
    overdue: remainingMs < 0,
  };
}

export function getDeliveryRemainingMs(
  createdAt: string,
  now: Date = new Date()
): number {
  return getDeliveryDeadlineState(createdAt, now).remainingMs;
}

export function formatDeliveryRemaining(ms: number): string {
  const absoluteMs = Math.abs(ms);
  const formatted = formatCooldownRemaining(absoluteMs);
  return ms < 0 ? `-${formatted}` : formatted;
}

export function partitionAwaitingAdminFilms<
  T extends { createdAt: string; scheduledDate?: string },
>(films: T[]): {
  urgent: T[];
  scheduled: T[];
} {
  const urgent: T[] = [];
  const scheduled: T[] = [];

  for (const film of films) {
    if (isFutureScheduledFilm(film)) {
      scheduled.push(film);
    } else {
      urgent.push(film);
    }
  }

  return {
    urgent: sortAwaitingByDeliveryUrgency(urgent),
    scheduled: sortAwaitingByScheduledDate(scheduled),
  };
}

export function sortAwaitingByDeliveryUrgency<
  T extends { createdAt: string },
>(films: T[]): T[] {
  return [...films].sort(
    (a, b) => getDeliveryRemainingMs(a.createdAt) - getDeliveryRemainingMs(b.createdAt)
  );
}

export function sortAwaitingByScheduledDate<
  T extends { scheduledDate?: string },
>(films: T[]): T[] {
  return [...films].sort((a, b) =>
    (a.scheduledDate ?? "").localeCompare(b.scheduledDate ?? "")
  );
}
