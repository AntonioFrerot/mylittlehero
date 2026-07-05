import "server-only";

import { todayDayKey } from "@/lib/calendar/date-utils";
import { listUserFilms } from "@/lib/film-creation/store";
import {
  hasActiveSubscriptionForUser,
  resolveSubscriptionPlanId,
} from "@/lib/purchases/has-active-subscription";
import { getSubscriptionAnchorDayKey } from "@/lib/purchases/subscription-anchor";
import {
  collectSubscriptionGrantScheduleDates,
  getNextSubscriptionGrantDate,
  getRemainingSubscriptionGrantScheduleSlots,
  isSubscriptionGrantScheduling,
  countElapsedGrantPeriodsInCurrentYear,
} from "@/lib/purchases/subscription-grant-dates";
import {
  getAnnualGrantCapForTier,
  getGrantPeriodForTier,
  getSubscriptionTierFromPlanId,
} from "@/lib/purchases/subscription-tier";
import type { SubscriptionGrantScheduleContext } from "@/lib/purchases/subscription-scheduling-types";

export type { SubscriptionGrantScheduleContext } from "@/lib/purchases/subscription-scheduling-types";

export { collectSubscriptionGrantScheduleDates } from "@/lib/purchases/subscription-grant-dates";

export async function buildSubscriptionGrantScheduleContext(input: {
  email: string;
  ticketBalance: number;
  subscriptionPlanId?: string | null;
  registrationDate?: string | null;
}): Promise<SubscriptionGrantScheduleContext> {
  const inactive: SubscriptionGrantScheduleContext = {
    active: false,
    tier: null,
    period: null,
    anchorDayKey: null,
    minScheduleDayKey: null,
    remainingScheduleSlots: 0,
    annualGrantCap: 0,
    elapsedGrantsInYear: 0,
    scheduledGrantCount: 0,
    canScheduleMore: false,
  };

  const hasActiveSubscription = hasActiveSubscriptionForUser({
    email: input.email,
    subscriptionPlanId: input.subscriptionPlanId,
  });

  if (
    !isSubscriptionGrantScheduling({
      hasActiveSubscription,
      ticketBalance: input.ticketBalance,
    })
  ) {
    return inactive;
  }

  const planId = resolveSubscriptionPlanId({
    email: input.email,
    subscriptionPlanId: input.subscriptionPlanId,
  });
  const tier = getSubscriptionTierFromPlanId(planId);
  if (!tier) return inactive;

  const anchorDayKey = await getSubscriptionAnchorDayKey(
    input.email,
    input.registrationDate
  );
  if (!anchorDayKey) return inactive;

  const period = getGrantPeriodForTier(tier);
  const annualGrantCap = getAnnualGrantCapForTier(tier);
  const films = await listUserFilms(input.email);
  const priorGrantDates = collectSubscriptionGrantScheduleDates(films);
  const elapsedGrantsInYear = countElapsedGrantPeriodsInCurrentYear({
    anchorDayKey,
    period,
    annualCap: annualGrantCap,
  });
  const scheduledGrantCount = priorGrantDates.filter(
    (date) => date >= todayDayKey()
  ).length;
  const remainingScheduleSlots = getRemainingSubscriptionGrantScheduleSlots({
    anchorDayKey,
    period,
    annualCap: annualGrantCap,
    scheduledGrantDates: priorGrantDates,
  });
  const canScheduleMore = remainingScheduleSlots > 0;
  const minScheduleDayKey = canScheduleMore
    ? getNextSubscriptionGrantDate({
        anchorDayKey,
        period,
        priorGrantDates,
      })
    : null;

  return {
    active: true,
    tier,
    period,
    anchorDayKey,
    minScheduleDayKey,
    remainingScheduleSlots,
    annualGrantCap,
    elapsedGrantsInYear,
    scheduledGrantCount,
    canScheduleMore,
  };
}

export async function validateSubscriptionGrantScheduleDate(input: {
  email: string;
  ticketBalance: number;
  subscriptionPlanId?: string | null;
  registrationDate?: string | null;
  scheduledDate: string;
}): Promise<{ ok: true } | { ok: false; errorKey: string }> {
  const context = await buildSubscriptionGrantScheduleContext({
    email: input.email,
    ticketBalance: input.ticketBalance,
    subscriptionPlanId: input.subscriptionPlanId,
    registrationDate: input.registrationDate,
  });

  if (!context.active) {
    return { ok: true };
  }

  if (!context.canScheduleMore) {
    return {
      ok: false,
      errorKey: "filmCreation.errors.subscriptionGrantQuotaReached",
    };
  }

  if (!context.minScheduleDayKey) {
    return {
      ok: false,
      errorKey: "filmCreation.errors.subscriptionGrantQuotaReached",
    };
  }

  if (input.scheduledDate < context.minScheduleDayKey) {
    return { ok: false, errorKey: "filmCreation.errors.subscriptionGrantDateTooEarly" };
  }

  return { ok: true };
}

export { isSubscriptionGrantScheduling } from "./subscription-grant-dates";
