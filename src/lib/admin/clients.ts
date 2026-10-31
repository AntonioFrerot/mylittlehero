import "server-only";

import {
  loadAllCharactersByEmail,
  loadAllFilmsByEmail,
  loadJetonBalancesByEmail,
  loadPurchasedEmails,
  loadTicketBalancesByEmail,
} from "@/lib/admin/batch-loaders";
import { isAdminEmail } from "@/lib/auth/is-admin";
import { listCharacters } from "@/lib/characters/store";
import {
  listStoredUsers,
  type StoredUser,
  type UserAccountBox,
} from "@/lib/auth/users-store";
import { listUserFilms } from "@/lib/film-creation/store";
import { normalizeEmail } from "@/lib/db/normalize-email";
import { normalizeFilmStatus } from "@/lib/i18n/film-labels";
import type { LocaleCode } from "@/lib/i18n/locales";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { findPricingPlanById } from "@/lib/pricing";

export type AdminClientCharacter = {
  id: string;
  prenom: string;
  photoSrc?: string;
  audioSrc?: string;
  age?: string;
  taille?: string;
};

export type AdminClientFilm = {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  isFreeTrial?: boolean;
  isSample?: boolean;
};

export type AdminClientAccountBox = "inbox" | "trash";

export type AdminClientSummary = {
  email: string;
  name?: string;
  createdAt: string;
  deletedAt?: string;
  locale: LocaleCode;
  subscriptionPlanId?: string;
  subscriptionPlanName?: string;
  ticketBalance: number;
  jetonBalance: number;
  characterCount: number;
  filmCount: number;
  filmsReadyCount: number;
  filmsInProgressCount: number;
  hasPurchased: boolean;
};

export type AdminClientDetails = {
  characters: AdminClientCharacter[];
  films: AdminClientFilm[];
};

export type AdminClientEntry = AdminClientSummary & AdminClientDetails;

export async function listRegisteredUsers(
  box: UserAccountBox = "inbox"
): Promise<StoredUser[]> {
  return listStoredUsers(box);
}

function buildClientSummary(
  user: StoredUser,
  adminLocale: LocaleCode,
  ticketBalance: number,
  jetonBalance: number,
  filmCount: number,
  filmsReadyCount: number,
  characterCount: number,
  hasPurchased: boolean
): AdminClientSummary {
  const email = normalizeEmail(user.email);
  const locale = user.locale ?? DEFAULT_LOCALE;
  const plan = findPricingPlanById(user.subscriptionPlanId, adminLocale);

  return {
    email,
    name: user.name,
    createdAt: user.createdAt,
    locale,
    subscriptionPlanId: user.subscriptionPlanId,
    subscriptionPlanName: plan?.name,
    ticketBalance,
    jetonBalance,
    characterCount,
    filmCount,
    filmsReadyCount,
    filmsInProgressCount: filmCount - filmsReadyCount,
    hasPurchased,
    ...(user.deletedAt ? { deletedAt: user.deletedAt } : {}),
  };
}

export async function listAdminClientSummaries(
  adminLocale: LocaleCode = "fr",
  box: UserAccountBox = "inbox"
): Promise<AdminClientSummary[]> {
  const [users, filmsByEmail, charactersByEmail, ticketBalances, jetonBalances, purchased] =
    await Promise.all([
      listRegisteredUsers(box),
      loadAllFilmsByEmail(),
      loadAllCharactersByEmail(),
      loadTicketBalancesByEmail(),
      loadJetonBalancesByEmail(),
      loadPurchasedEmails(),
    ]);

  const summaries: AdminClientSummary[] = [];

  for (const user of users) {
    const email = normalizeEmail(user.email);
    if (isAdminEmail(email)) continue;

    const films = filmsByEmail.get(email) ?? [];
    const filmsReadyCount = films.filter(
      (film) => normalizeFilmStatus(film.status) === "ready"
    ).length;

    summaries.push(
      buildClientSummary(
        user,
        adminLocale,
        ticketBalances.get(email) ?? 0,
        jetonBalances.get(email) ?? 0,
        films.length,
        filmsReadyCount,
        (charactersByEmail.get(email) ?? []).length,
        purchased.has(email)
      )
    );
  }

  return summaries.sort((a, b) => {
    const aTime =
      box === "trash" && a.deletedAt
        ? new Date(a.deletedAt).getTime()
        : new Date(a.createdAt).getTime();
    const bTime =
      box === "trash" && b.deletedAt
        ? new Date(b.deletedAt).getTime()
        : new Date(b.createdAt).getTime();
    return bTime - aTime;
  });
}

export async function getAdminClientDetails(
  userEmail: string
): Promise<AdminClientDetails | null> {
  const email = normalizeEmail(userEmail);
  if (isAdminEmail(email)) return null;

  const [characters, films] = await Promise.all([
    listCharacters(email),
    listUserFilms(email),
  ]);

  return {
    characters: characters.map((character) => ({
      id: character.id,
      prenom: character.prenom,
      photoSrc: character.photoSrc || undefined,
      audioSrc: character.audioSrc,
      age: character.age,
      taille: character.taille,
    })),
    films: films.map((film) => ({
      id: film.id,
      title: film.title,
      status: film.status,
      createdAt: film.createdAt,
      isFreeTrial: film.isFreeTrial,
      isSample: film.isSample,
    })),
  };
}

/** Liste complète (utilisée par l’API admin clients). */
export async function listAdminClients(
  adminLocale: LocaleCode = "fr"
): Promise<AdminClientEntry[]> {
  const summaries = await listAdminClientSummaries(adminLocale);
  const [charactersByEmail, filmsByEmail] = await Promise.all([
    loadAllCharactersByEmail(),
    loadAllFilmsByEmail(),
  ]);

  return summaries.map((summary) => {
    const details = {
      characters: (charactersByEmail.get(summary.email) ?? []).map((character) => ({
        id: character.id,
        prenom: character.prenom,
        photoSrc: character.photoSrc || undefined,
        audioSrc: character.audioSrc,
        age: character.age,
        taille: character.taille,
      })),
      films: (filmsByEmail.get(summary.email) ?? []).map((film) => ({
        id: film.id,
        title: film.title,
        status: film.status,
        createdAt: film.createdAt,
        isFreeTrial: film.isFreeTrial,
        isSample: film.isSample,
      })),
    };

    return { ...summary, ...details };
  });
}
