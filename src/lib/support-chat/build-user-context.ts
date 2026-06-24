import { getSession } from "@/lib/auth/get-session";
import { isAdminEmail } from "@/lib/auth/is-admin";
import { findUserByEmail } from "@/lib/auth/users-store";
import { listCharacters } from "@/lib/characters/store";
import {
  formatCooldownRemaining,
  getFilmCreationCooldownState,
  getLatestFilmCreatedAt,
} from "@/lib/film-creation/creation-cooldown";
import { isFreeFilmAvailableForEmail } from "@/lib/film-creation/free-film";
import { listUserFilms } from "@/lib/film-creation/store";
import type { LocaleCode } from "@/lib/i18n/locales";
import { findPricingPlanById } from "@/lib/pricing";
import { getTicketBalance } from "@/lib/purchases/tickets";
import type { SupportUserContext } from "./types";

export async function buildSupportUserContext(
  locale: LocaleCode = "fr"
): Promise<SupportUserContext | null> {
  const session = await getSession();
  if (!session) return null;

  const [user, balance, characters, films, freeFilmAvailable] = await Promise.all([
    findUserByEmail(session.email),
    getTicketBalance(session.email),
    listCharacters(session.email),
    listUserFilms(session.email),
    isFreeFilmAvailableForEmail(session.email),
  ]);

  const cooldown = isAdminEmail(session.email)
    ? { active: false, endsAt: null, remainingMs: 0 }
    : getFilmCreationCooldownState(getLatestFilmCreatedAt(films));
  const plan = findPricingPlanById(user?.subscriptionPlanId, locale);

  return {
    email: session.email,
    name: session.name ?? user?.name,
    ticketBalance: balance,
    hasActiveSubscription: Boolean(user?.subscriptionPlanId),
    subscriptionPlanName: plan?.name,
    freeFilmAvailable,
    characterCount: characters.length,
    charactersWithPhoto: characters.filter((character) => Boolean(character.photoSrc))
      .length,
    filmCount: films.length,
    recentFilms: films.slice(0, 6).map((film) => ({
      title: film.title || "(sans titre)",
      status: film.status,
    })),
    creationCooldownActive: cooldown.active,
    creationCooldownRemaining: cooldown.active
      ? formatCooldownRemaining(cooldown.remainingMs)
      : null,
  };
}
