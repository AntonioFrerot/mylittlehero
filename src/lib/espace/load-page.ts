import { getMyAccountDetails } from "@/lib/auth/account-actions";
import { getMyCharacters } from "@/lib/characters/actions";
import { attachStoryToFilms } from "@/lib/film-creation/catalog-films";
import { listUserFilmsForUser } from "@/lib/film-creation/store";
import type { UserFilmWithStory } from "@/lib/film-creation/types";
import type { Character } from "@/lib/characters/types";
import {
  CREER_FILM_PATH,
} from "@/lib/navigation/creer-film";

export type MonEspacePageData = {
  createFilmHref: string;
  account: Awaited<ReturnType<typeof getMyAccountDetails>>;
  characters: Character[];
  films: UserFilmWithStory[];
};

export async function loadMonEspacePageData(
  email: string
): Promise<MonEspacePageData> {
  const [account, characters, filmsRaw] = await Promise.all([
    getMyAccountDetails(),
    getMyCharacters(),
    listUserFilmsForUser(email),
  ]);

  const films = await attachStoryToFilms(email, filmsRaw);

  const createFilmHref = CREER_FILM_PATH;

  return { createFilmHref, account, characters, films };
}
