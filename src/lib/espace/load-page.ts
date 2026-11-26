import { getMyAccountDetails } from "@/lib/auth/account-actions";
import { getMyCharacters } from "@/lib/characters/actions";
import { attachStoryToFilms } from "@/lib/film-creation/catalog-films";
import { listUserFilmsForUser } from "@/lib/film-creation/store";
import type { UserFilmWithStory } from "@/lib/film-creation/types";
import type { Character } from "@/lib/characters/types";
import type { EspaceSection } from "@/lib/espace/sections";
import { CREER_FILM_PATH } from "@/lib/navigation/creer-film";

export type MonEspacePageData = {
  createFilmHref: string;
  account: Awaited<ReturnType<typeof getMyAccountDetails>> | null;
  characters: Character[] | null;
  films: UserFilmWithStory[] | null;
};

export async function loadMonEspacePageData(
  email: string,
  section: EspaceSection
): Promise<MonEspacePageData> {
  const createFilmHref = CREER_FILM_PATH;

  if (section === "profil") {
    const account = await getMyAccountDetails();
    return { createFilmHref, account, characters: null, films: null };
  }

  if (section === "personnages") {
    const characters = await getMyCharacters();
    return { createFilmHref, account: null, characters, films: null };
  }

  const filmsRaw = await listUserFilmsForUser(email);
  const films = await attachStoryToFilms(email, filmsRaw);
  return { createFilmHref, account: null, characters: null, films };
}
