import "server-only";

import { todayDayKey } from "@/lib/calendar/date-utils";
import { findUserByEmail } from "@/lib/auth/users-store";
import { listUserFilms } from "@/lib/film-creation/store";
import {
  hasActiveSubscriptionForUser,
  resolveSubscriptionPlanId,
} from "@/lib/purchases/has-active-subscription";
import { getSubscriptionAnchorDayKey } from "@/lib/purchases/subscription-anchor";
import {
  buildSubscriptionPeriodReferenceId,
  getSubscriptionYearIndex,
  getSubscriptionYearStartDayKey,
  listGrantDatesForSubscriptionYear,
} from "@/lib/purchases/subscription-grant-dates";
import {
  getAnnualGrantCapForTier,
  getGrantPeriodForTier,
  getTicketGrantsForSubscriptionPeriod,
  getSubscriptionTierFromPlanId,
} from "@/lib/purchases/subscription-tier";
import { tryGrantSubscriptionPeriodTicket } from "@/lib/purchases/tickets";
import { collectSubscriptionGrantScheduleDates } from "@/lib/purchases/subscription-grant-dates";

export async function syncSubscriptionPeriodicGrants(
  userEmail: string
): Promise<void> {
  const user = await findUserByEmail(userEmail);
  const planId = resolveSubscriptionPlanId({
    email: userEmail,
    subscriptionPlanId: user?.subscriptionPlanId,
  });

  if (
    !hasActiveSubscriptionForUser({
      email: userEmail,
      subscriptionPlanId: user?.subscriptionPlanId,
    }) ||
    !planId
  ) {
    return;
  }

  const tier = getSubscriptionTierFromPlanId(planId);
  if (!tier) return;

  const anchorDayKey = await getSubscriptionAnchorDayKey(
    userEmail,
    user?.createdAt
  );
  if (!anchorDayKey) return;

  const period = getGrantPeriodForTier(tier);
  const annualCap = getAnnualGrantCapForTier(tier);
  const todayKey = todayDayKey();
  const yearIndex = getSubscriptionYearIndex(anchorDayKey, todayKey);
  const yearStart = getSubscriptionYearStartDayKey(anchorDayKey, yearIndex);
  const grantDates = listGrantDatesForSubscriptionYear({
    anchorDayKey,
    period,
    annualCap,
    yearIndex,
    todayKey,
  });

  const films = await listUserFilms(userEmail);
  const scheduledGrantDates = new Set(
    collectSubscriptionGrantScheduleDates(films)
  );

  for (let index = 0; index < grantDates.length; index += 1) {
    const grantDate = grantDates[index]!;
    if (grantDate > todayKey) break;

    const referenceId = buildSubscriptionPeriodReferenceId({
      yearStartDayKey: yearStart,
      periodIndex: index + 1,
    });

    if (scheduledGrantDates.has(grantDate)) {
      continue;
    }

    const ticketCount = getTicketGrantsForSubscriptionPeriod({
      tier,
      periodIndex: index + 1,
    });
    await tryGrantSubscriptionPeriodTicket(userEmail, referenceId, ticketCount);
  }
}
