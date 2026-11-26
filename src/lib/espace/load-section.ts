"use server";

import { getSession } from "@/lib/auth/get-session";
import { getMyAccountDetails } from "@/lib/auth/account-actions";
import { getMyCharacters } from "@/lib/characters/actions";
import { attachStoryToFilms } from "@/lib/film-creation/catalog-films";
import { listUserFilmsForUser } from "@/lib/film-creation/store";
import type { UserFilmWithStory } from "@/lib/film-creation/types";
import type { Character } from "@/lib/characters/types";
import type { EspaceSection } from "@/lib/espace/sections";

export type MonEspaceSectionPayload =
  | { section: "profil"; account: Awaited<ReturnType<typeof getMyAccountDetails>> }
  | { section: "personnages"; characters: Character[] }
  | { section: "films"; films: UserFilmWithStory[] };

export async function fetchMonEspaceSection(
  section: EspaceSection
): Promise<
  | { ok: true; data: MonEspaceSectionPayload }
  | { ok: false; error: "unauthorized" }
> {
  const session = await getSession();
  if (!session) {
    return { ok: false, error: "unauthorized" };
  }

  if (section === "profil") {
    const account = await getMyAccountDetails();
    return { ok: true, data: { section: "profil", account } };
  }

  if (section === "personnages") {
    const characters = await getMyCharacters();
    return { ok: true, data: { section: "personnages", characters } };
  }

  const filmsRaw = await listUserFilmsForUser(session.email);
  const films = await attachStoryToFilms(session.email, filmsRaw);
  return { ok: true, data: { section: "films", films } };
}