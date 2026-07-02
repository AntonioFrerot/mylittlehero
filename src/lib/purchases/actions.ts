"use server";

import { getSession } from "@/lib/auth/get-session";
import { findUserByEmail } from "@/lib/auth/users-store";
import { isFreeFilmAvailableForEmail } from "@/lib/film-creation/free-film";
import { listUserFilmsForUser } from "@/lib/film-creation/store";
import { getJetonBalanceForUser } from "@/lib/purchases/jetons";
import { userHasAnySitePurchase } from "@/lib/purchases/purchase-history";
import { getTicketBalanceForUser } from "@/lib/purchases/tickets";

export type FilmTicketSummary = {
  balance: number;
  jetonBalance: number;
  hasActiveSubscription: boolean;
  hasCreatedFilms: boolean;
  freeFilmAvailable: boolean;
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

  return {
    balance,
    jetonBalance,
    hasActiveSubscription: Boolean(user?.subscriptionPlanId),
    hasCreatedFilms: films.length > 0,
    freeFilmAvailable,
  };
}

export async function checkUserHasSitePurchase(): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;
  return userHasAnySitePurchase(session.email);
}
