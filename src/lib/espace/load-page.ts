import { getMyAccountDetails } from "@/lib/auth/account-actions";
import { findUserByEmail } from "@/lib/auth/users-store";
import { getMyCharacters } from "@/lib/characters/actions";
import { attachStoryToFilms } from "@/lib/film-creation/catalog-films";
import { isFreeFilmAvailableForEmail } from "@/lib/film-creation/free-film";
import { listUserFilmsForUser } from "@/lib/film-creation/store";
import type { UserFilmWithStory } from "@/lib/film-creation/types";
import type { Character } from "@/lib/characters/types";
import {
  canCreateFilm,
  CREER_FILM_PATH,
  PRICING_PATH,
} from "@/lib/navigation/creer-film";
import { getTicketBalanceForUser } from "@/lib/purchases/tickets";
import type { EspaceSection } from "@/lib/espace/sections";

export type MonEspacePageData = {
  createFilmHref: string;
  account: Awaited<ReturnType<typeof getMyAccountDetails>>;
  characters: Character[];
  films: UserFilmWithStory[];
};

async function resolveCreateFilmHrefForEmail(email: string): Promise<string> {
  const [balance, user, films, freeFilmAvailable] = await Promise.all([
    getTicketBalanceForUser(email),
    findUserByEmail(email),
    listUserFilmsForUser(email),
    isFreeFilmAvailableForEmail(email),
  ]);

  const summary = {
    balance,
    hasActiveSubscription: Boolean(user?.subscriptionPlanId),
    hasCreatedFilms: films.length > 0,
    freeFilmAvailable,
  };

  return canCreateFilm(summary) ? CREER_FILM_PATH : PRICING_PATH;
}

export async function loadMonEspacePageData(
  email: string,
  section: EspaceSection
): Promise<MonEspacePageData> {
  if (section === "profil") {
    const [account, createFilmHref] = await Promise.all([
      getMyAccountDetails(),
      resolveCreateFilmHrefForEmail(email),
    ]);
    return { createFilmHref, account, characters: [], films: [] };
  }

  if (section === "personnages") {
    const [characters, createFilmHref] = await Promise.all([
      getMyCharacters(),
      resolveCreateFilmHrefForEmail(email),
    ]);
    return { createFilmHref, account: null, characters, films: [] };
  }

  const [films, createFilmHref] = await Promise.all([
    listUserFilmsForUser(email).then((items) => attachStoryToFilms(email, items)),
    resolveCreateFilmHrefForEmail(email),
  ]);

  return { createFilmHref, account: null, characters: [], films };
}
