/** Jour calendaire utilisé pour compter les arrivées (minuit → minuit, Paris). */
export const ARRIVAL_STATS_TIMEZONE = "Europe/Paris";

const DAY_KEY_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: ARRIVAL_STATS_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Clé stable du type `2026-07-03` pour le jour calendaire à Paris. */
export function getArrivalCalendarDayKey(date: Date = new Date()): string {
  return DAY_KEY_FORMATTER.format(date);
}

export function arrivalStorageKeyForDay(dayKey: string): string {
  return `mlh_arrival_${dayKey}`;
}
