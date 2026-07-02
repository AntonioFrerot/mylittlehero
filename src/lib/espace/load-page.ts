import { getMyAccountDetails } from "@/lib/auth/account-actions";
import { findUserByEmailForUser } from "@/lib/auth/users-store";
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
import { getJetonBalanceForUser } from "@/lib/purchases/jetons";
import { getTicketBalanceForUser } from "@/lib/purchases/tickets";

export type MonEspacePageData = {
  createFilmHref: string;
  account: Awaited<ReturnType<typeof getMyAccountDetails>>;
  characters: Character[];
  films: UserFilmWithStory[];
};

export async function loadMonEspacePageData(
  email: string
): Promise<MonEspacePageData> {
  const [account, characters, filmsRaw, balance, jetonBalance, user, freeFilmAvailable] =
    await Promise.all([
      getMyAccountDetails(),
      getMyCharacters(),
      listUserFilmsForUser(email),
      getTicketBalanceForUser(email),
      getJetonBalanceForUser(email),
      findUserByEmailForUser(email),
      isFreeFilmAvailableForEmail(email),
    ]);

  const films = await attachStoryToFilms(email, filmsRaw);

  const createFilmHref = canCreateFilm({
    balance,
    jetonBalance,
    hasActiveSubscription: Boolean(user?.subscriptionPlanId),
    freeFilmAvailable,
  })
    ? CREER_FILM_PATH
    : PRICING_PATH;

  return { createFilmHref, account, characters, films };
}
