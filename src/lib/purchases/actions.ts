"use server";

import { getSession } from "@/lib/auth/get-session";
import { findUserByEmail } from "@/lib/auth/users-store";
import { isFreeFilmAvailableForEmail } from "@/lib/film-creation/free-film";
import { listUserFilms } from "@/lib/film-creation/store";
import { getTicketBalance } from "@/lib/purchases/tickets";

export type FilmTicketSummary = {
  balance: number;
  hasActiveSubscription: boolean;
  hasCreatedFilms: boolean;
  freeFilmAvailable: boolean;
};

export async function getMyFilmTicketSummary(): Promise<FilmTicketSummary | null> {
  const session = await getSession();
  if (!session) return null;

  const [balance, user, films, freeFilmAvailable] = await Promise.all([
    getTicketBalance(session.email),
    findUserByEmail(session.email),
    listUserFilms(session.email),
    isFreeFilmAvailableForEmail(session.email),
  ]);

  return {
    balance,
    hasActiveSubscription: Boolean(user?.subscriptionPlanId),
    hasCreatedFilms: films.length > 0,
    freeFilmAvailable,
  };
}
