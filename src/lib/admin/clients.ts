import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { isAdminEmail } from "@/lib/auth/is-admin";
import type { StoredUser } from "@/lib/auth/users-store";
import { listCharacters } from "@/lib/characters/store";
import { listUserFilms } from "@/lib/film-creation/store";
import { ensureSchema, getSql, isDatabaseEnabled } from "@/lib/db/client";
import { normalizeEmail } from "@/lib/db/normalize-email";
import { normalizeFilmStatus } from "@/lib/i18n/film-labels";
import type { LocaleCode } from "@/lib/i18n/locales";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { findPricingPlanById } from "@/lib/pricing";
import { getJetonBalance } from "@/lib/purchases/jetons";
import { userHasAnySitePurchase } from "@/lib/purchases/purchase-history";
import { getTicketBalance } from "@/lib/purchases/tickets";

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

export type AdminClientEntry = {
  email: string;
  name?: string;
  createdAt: string;
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
  characters: AdminClientCharacter[];
  films: AdminClientFilm[];
};

function rowToUser(row: {
  email: string;
  name: string | null;
  password_hash: string;
  created_at: Date;
  subscription_plan_id: string | null;
  locale: string | null;
}): StoredUser {
  return {
    email: row.email,
    name: row.name ?? undefined,
    passwordHash: row.password_hash,
    createdAt: row.created_at.toISOString(),
    subscriptionPlanId: row.subscription_plan_id ?? undefined,
    locale: (row.locale as LocaleCode | null) ?? undefined,
  };
}

async function listRegisteredUsers(): Promise<StoredUser[]> {
  if (isDatabaseEnabled()) {
    await ensureSchema();
    const db = getSql();
    const rows = await db<
      {
        email: string;
        name: string | null;
        password_hash: string;
        created_at: Date;
        subscription_plan_id: string | null;
        locale: string | null;
      }[]
    >`
      SELECT email, name, password_hash, created_at, subscription_plan_id, locale
      FROM users
      ORDER BY created_at DESC
    `;
    return rows.map(rowToUser);
  }

  try {
    const raw = await readFile(
      path.join(process.cwd(), "data", "users.json"),
      "utf8"
    );
    const parsed = JSON.parse(raw) as StoredUser[];
    if (!Array.isArray(parsed)) return [];
    return parsed.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch {
    return [];
  }
}

export async function listAdminClients(
  adminLocale: LocaleCode = "fr"
): Promise<AdminClientEntry[]> {
  const users = await listRegisteredUsers();
  const entries: AdminClientEntry[] = [];

  for (const user of users) {
    const email = normalizeEmail(user.email);
    if (isAdminEmail(email)) continue;

    const [characters, films, ticketBalance, jetonBalance, hasPurchased] =
      await Promise.all([
        listCharacters(email),
        listUserFilms(email),
        getTicketBalance(email),
        getJetonBalance(email),
        userHasAnySitePurchase(email),
      ]);

    const locale = user.locale ?? DEFAULT_LOCALE;
    const plan = findPricingPlanById(user.subscriptionPlanId, adminLocale);
    const filmsReadyCount = films.filter(
      (film) => normalizeFilmStatus(film.status) === "ready"
    ).length;

    entries.push({
      email,
      name: user.name,
      createdAt: user.createdAt,
      locale,
      subscriptionPlanId: user.subscriptionPlanId,
      subscriptionPlanName: plan?.name,
      ticketBalance,
      jetonBalance,
      characterCount: characters.length,
      filmCount: films.length,
      filmsReadyCount,
      filmsInProgressCount: films.length - filmsReadyCount,
      hasPurchased,
      characters: characters.map((character) => ({
        id: character.id,
        prenom: character.prenom,
        photoSrc: character.photoSrc || undefined,
        audioSrc: character.audioSrc,
        age: character.age,
        taille: character.taille,
      })),
      films: films
        .slice()
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .map((film) => ({
          id: film.id,
          title: film.title,
          status: film.status,
          createdAt: film.createdAt,
          isFreeTrial: film.isFreeTrial,
          isSample: film.isSample,
        })),
    });
  }

  return entries.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
