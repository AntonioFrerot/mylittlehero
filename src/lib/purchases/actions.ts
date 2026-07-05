"use server";

import { getSession } from "@/lib/auth/get-session";
import { findUserByEmail } from "@/lib/auth/users-store";
import { isFreeFilmAvailableForEmail } from "@/lib/film-creation/free-film";
import { listUserFilmsForUser } from "@/lib/film-creation/store";
import { getJetonBalanceForUser } from "@/lib/purchases/jetons";
import { userHasAnySitePurchase } from "@/lib/purchases/purchase-history";
import { getTicketBalanceForUser } from "@/lib/purchases/tickets";
import { hasActiveSubscriptionForUser } from "@/lib/purchases/has-active-subscription";
import type { SubscriptionGrantScheduleContext } from "@/lib/purchases/subscription-scheduling-types";
import { buildSubscriptionGrantScheduleContext } from "@/lib/purchases/subscription-scheduling";

export type FilmTicketSummary = {
  balance: number;
  jetonBalance: number;
  hasActiveSubscription: boolean;
  hasCreatedFilms: boolean;
  freeFilmAvailable: boolean;
  subscriptionGrantSchedule: SubscriptionGrantScheduleContext;
};

export async function getMyFilmTicketSummary(): Promise<FilmTicketSummary | null> {
  const session = await getSession();
  if (!session) return null;

  const [balance, jetonBalance, user, films, freeFilmAvailable] = await Promise.all([
    getTicketBalanceForUser(session.email),
    getJetonBalanceForUser(session.email),
    findUserByEmail(session.email),
    listUserFilmsForUser(session.email),
    isFreeFilmAvailableForEmail(session.email),
  ]);

  const subscriptionGrantSchedule = await buildSubscriptionGrantScheduleContext({
    email: session.email,
    ticketBalance: balance,
    subscriptionPlanId: user?.subscriptionPlanId,
    registrationDate: user?.createdAt,
  });

  return {
    balance,
    jetonBalance,
    hasActiveSubscription: hasActiveSubscriptionForUser({
      email: session.email,
      subscriptionPlanId: user?.subscriptionPlanId,
    }),
    hasCreatedFilms: films.length > 0,
    freeFilmAvailable,
    subscriptionGrantSchedule,
  };
}

export async function checkUserHasSitePurchase(): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;
  return userHasAnySitePurchase(session.email);
}
