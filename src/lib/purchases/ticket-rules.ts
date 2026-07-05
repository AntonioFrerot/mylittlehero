import type { PurchasePlanId, JetonPurchasePlanId } from "@/lib/i18n/purchase-catalog";

/** 1 ticket = 5 minutes de film. */
export const TICKET_DURATION_SECONDS = 5 * 60;

/** Durée du film gratuit unique (essai). */
export const FREE_FILM_DURATION_SECONDS = 15;

/** Durée d'un échantillon payant (jeton). */
export const SAMPLE_FILM_DURATION_SECONDS = 30;

export const JETONS_REQUIRED_FOR_SAMPLE = 1;

export const PAID_FILM_DURATION_MIN_SECONDS = TICKET_DURATION_SECONDS;
export const PAID_FILM_DURATION_MAX_SECONDS = 30 * 60;

export const PAID_FILM_DURATION_SECONDS = Array.from(
  { length: PAID_FILM_DURATION_MAX_SECONDS / TICKET_DURATION_SECONDS },
  (_, index) => (index + 1) * TICKET_DURATION_SECONDS
) as readonly number[];

export function isPaidFilmDuration(seconds: number): boolean {
  return (
    Number.isFinite(seconds) &&
    seconds >= PAID_FILM_DURATION_MIN_SECONDS &&
    seconds <= PAID_FILM_DURATION_MAX_SECONDS &&
    seconds % TICKET_DURATION_SECONDS === 0
  );
}

export const PLAN_TICKET_GRANTS: Record<
  Exclude<PurchasePlanId, JetonPurchasePlanId>,
  number
> = {
  "film-5min": 1,
  "film-10min": 2,
  "pack-3films": 6,
  "ticket-1": 1,
  "ticket-3": 3,
  "ticket-10": 10,
};

export function getTicketsRequiredForDuration(durationSeconds: number): number {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return 0;
  return Math.ceil(durationSeconds / TICKET_DURATION_SECONDS);
}

export function getMaxAffordablePaidStepIndex(
  ticketBalance: number,
  steps: readonly number[] = PAID_FILM_DURATION_SECONDS
): number {
  let maxIndex = -1;

  for (let index = 0; index < steps.length; index += 1) {
    const seconds = steps[index];
    if (seconds != null && getTicketsRequiredForDuration(seconds) <= ticketBalance) {
      maxIndex = index;
    }
  }

  return maxIndex;
}

export function isFreeTrialFilmDuration(durationSeconds: number): boolean {
  return durationSeconds === FREE_FILM_DURATION_SECONDS;
}

export function isSampleFilmDuration(durationSeconds: number): boolean {
  return durationSeconds === SAMPLE_FILM_DURATION_SECONDS;
}

export function isAllowedFilmDuration(durationSeconds: number): boolean {
  return (
    isPaidFilmDuration(durationSeconds) ||
    isFreeTrialFilmDuration(durationSeconds) ||
    isSampleFilmDuration(durationSeconds)
  );
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
