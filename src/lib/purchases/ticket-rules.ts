import type { PurchasePlanId } from "@/lib/i18n/purchase-catalog";
import { FILM_DURATION_MIN_SECONDS } from "@/lib/film-creation/duration";

/** 1 ticket = 5 minutes de film. */
export const TICKET_DURATION_SECONDS = 5 * 60;

export const PAID_FILM_DURATION_SECONDS = [5 * 60, 10 * 60] as const;

export function isPaidFilmDuration(seconds: number): boolean {
  return (PAID_FILM_DURATION_SECONDS as readonly number[]).includes(seconds);
}

export const PLAN_TICKET_GRANTS: Record<PurchasePlanId, number> = {
  "film-5min": 1,
  "film-10min": 2,
  "pack-3films": 6,
};

export function getTicketsRequiredForDuration(durationSeconds: number): number {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return 0;
  return Math.ceil(durationSeconds / TICKET_DURATION_SECONDS);
}

export function isFreeTrialFilmDuration(durationSeconds: number): boolean {
  return durationSeconds <= FILM_DURATION_MIN_SECONDS;
}

export function formatTicketCostLabel(
  tickets: number,
  locale: "fr" | "en"
): string {
  if (locale === "en") {
    return tickets === 1 ? "1 ticket" : `${tickets} tickets`;
  }
  return tickets === 1 ? "1 ticket" : `${tickets} tickets`;
}
