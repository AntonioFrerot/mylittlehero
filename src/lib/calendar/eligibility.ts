import { todayDayKey } from "./date-utils";
import type { FilmScheduleEntry } from "./types";

export function countActiveScheduledSlots(
  schedules: FilmScheduleEntry[]
): number {
  const today = todayDayKey();
  return schedules.filter(
    (entry) => entry.scheduledDate >= today && !entry.filmId
  ).length;
}

export function getAvailableScheduleSlots(input: {
  ticketBalance: number;
  hasActiveSubscription: boolean;
  schedules: FilmScheduleEntry[];
}): number {
  if (input.hasActiveSubscription) {
    return 999;
  }

  const reserved = countActiveScheduledSlots(input.schedules);
  return Math.max(0, input.ticketBalance - reserved);
}

export function canScheduleFilms(input: {
  ticketBalance: number;
  hasActiveSubscription: boolean;
}): boolean {
  return input.hasActiveSubscription || input.ticketBalance > 0;
}
