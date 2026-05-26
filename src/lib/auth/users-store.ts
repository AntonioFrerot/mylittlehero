import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { hashPassword, verifyPassword } from "./password";

import type { LocaleCode } from "@/lib/i18n/locales";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";

export type StoredUser = {
  email: string;
  name?: string;
  passwordHash: string;
  createdAt: string;
  subscriptionPlanId?: string;
  locale?: LocaleCode;
  /** @deprecated use locale */
  filmLanguage?: LocaleCode;
};

export type AccountDetails = {
  email: string;
  name?: string;
  subscriptionPlanId?: string;
  locale: LocaleCode;
};

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

async function readUsers(): Promise<StoredUser[]> {
  try {
    const raw = await readFile(USERS_FILE, "utf8");
    const parsed = JSON.parse(raw) as StoredUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeUsers(users: StoredUser[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

export async function findUserByEmail(
  email: string
): Promise<StoredUser | undefined> {
  const users = await readUsers();
  return users.find((u) => u.email === email);
}

export async function registerUser(input: {
  email: string;
  password: string;
  name?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const email = input.email.trim().toLowerCase();

  if (await findUserByEmail(email)) {
    return {
      ok: false,
      error: "Un compte existe déjà avec cette adresse e-mail.",
    };
  }

  const passwordHash = await hashPassword(input.password);
  const users = await readUsers();

  users.push({
    email,
    name: input.name?.trim() || undefined,
    passwordHash,
    createdAt: new Date().toISOString(),
  });

  await writeUsers(users);
  return { ok: true };
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<StoredUser | null> {
  const user = await findUserByEmail(email.trim().toLowerCase());
  if (!user) return null;

  const valid = await verifyPassword(password, user.passwordHash);
  return valid ? user : null;
}

export async function getAccountDetails(
  email: string
): Promise<AccountDetails | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;
  return {
    email: user.email,
    name: user.name,
    subscriptionPlanId: user.subscriptionPlanId,
    locale: user.locale ?? user.filmLanguage ?? DEFAULT_LOCALE,
  };
}

async function updateUser(
  email: string,
  patch: Partial<
    Pick<
      StoredUser,
      "name" | "passwordHash" | "subscriptionPlanId" | "locale" | "filmLanguage"
    >
  >
): Promise<{ ok: true; user: StoredUser } | { ok: false; error: string }> {
  const users = await readUsers();
  const index = users.findIndex((u) => u.email === email);
  if (index === -1) {
    return { ok: false, error: "Compte introuvable." };
  }

  const current = users[index]!;
  const next: StoredUser = { ...current, ...patch };

  if (patch.name !== undefined) {
    const trimmed = patch.name.trim();
    next.name = trimmed || undefined;
  }

  if (patch.subscriptionPlanId !== undefined) {
    next.subscriptionPlanId = patch.subscriptionPlanId || undefined;
  }

  users[index] = next;
  await writeUsers(users);
  return { ok: true, user: next };
}

export async function updateUserName(
  email: string,
  name: string
): Promise<{ ok: true; user: StoredUser } | { ok: false; error: string }> {
  if (!name.trim()) {
    return { ok: false, error: "Indiquez un prénom." };
  }
  return updateUser(email, { name });
}

export async function updateUserPassword(
  email: string,
  currentPassword: string,
  newPassword: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await findUserByEmail(email);
  if (!user) return { ok: false, error: "Compte introuvable." };

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) {
    return { ok: false, error: "Mot de passe actuel incorrect." };
  }

  if (newPassword.length < 6) {
    return {
      ok: false,
      error: "Le nouveau mot de passe doit contenir au moins 6 caractères.",
    };
  }

  const passwordHash = await hashPassword(newPassword);
  const result = await updateUser(email, { passwordHash });
  if (!result.ok) return result;
  return { ok: true };
}

export async function updateUserSubscription(
  email: string,
  subscriptionPlanId: string | null
): Promise<{ ok: true; user: StoredUser } | { ok: false; error: string }> {
  return updateUser(email, { subscriptionPlanId: subscriptionPlanId ?? "" });
}

export async function updateUserLocale(
  email: string,
  locale: LocaleCode
): Promise<{ ok: true; user: StoredUser } | { ok: false; error: string }> {
  return updateUser(email, { locale, filmLanguage: locale });
}

export async function getUserLocale(email: string): Promise<LocaleCode> {
  const user = await findUserByEmail(email);
  return user?.locale ?? user?.filmLanguage ?? DEFAULT_LOCALE;
}

/** @deprecated use updateUserLocale */
export async function updateUserFilmLanguage(
  email: string,
  filmLanguage: LocaleCode
): Promise<{ ok: true; user: StoredUser } | { ok: false; error: string }> {
  return updateUserLocale(email, filmLanguage);
}

/** @deprecated use getUserLocale */
export async function getUserFilmLanguage(email: string): Promise<LocaleCode> {
  return getUserLocale(email);
}
