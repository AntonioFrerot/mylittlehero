import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  databaseRequiredError,
  ensureSchema,
  getSql,
  isDatabaseEnabled,
  isHostedProduction,
} from "@/lib/db/client";
import { isValidEmail, normalizeEmail } from "@/lib/db/normalize-email";
import type { LocaleCode } from "@/lib/i18n/locales";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { hashPassword, verifyPassword } from "./password";

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

async function readUsersFile(): Promise<StoredUser[]> {
  try {
    const raw = await readFile(USERS_FILE, "utf8");
    const parsed = JSON.parse(raw) as StoredUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeUsersFile(users: StoredUser[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

async function findUserByEmailDb(
  email: string
): Promise<StoredUser | undefined> {
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
    WHERE email = ${email}
    LIMIT 1
  `;
  const row = rows[0];
  return row ? rowToUser(row) : undefined;
}

async function findUserByEmailFile(
  email: string
): Promise<StoredUser | undefined> {
  const users = await readUsersFile();
  return users.find((u) => normalizeEmail(u.email) === email);
}

export async function findUserByEmail(
  email: string
): Promise<StoredUser | undefined> {
  const normalized = normalizeEmail(email);
  if (isDatabaseEnabled()) {
    return findUserByEmailDb(normalized);
  }
  return findUserByEmailFile(normalized);
}

export type RegisterUserError = "invalid_email" | "email_exists" | "unavailable";

export async function registerUser(input: {
  email: string;
  password: string;
  name?: string;
}): Promise<{ ok: true } | { ok: false; error: RegisterUserError }> {
  if (isHostedProduction() && !isDatabaseEnabled()) {
    return { ok: false, error: "unavailable" };
  }

  const email = normalizeEmail(input.email);
  if (!isValidEmail(email)) {
    return { ok: false, error: "invalid_email" };
  }

  try {
    if (await findUserByEmail(email)) {
      return { ok: false, error: "email_exists" };
    }

    const passwordHash = await hashPassword(input.password);
    const createdAt = new Date().toISOString();
    const name = input.name?.trim() || undefined;

    if (isDatabaseEnabled()) {
      await ensureSchema();
      const db = getSql();
      const inserted = await db<{ email: string }[]>`
        INSERT INTO users (email, name, password_hash, created_at)
        VALUES (${email}, ${name ?? null}, ${passwordHash}, ${createdAt})
        ON CONFLICT (email) DO NOTHING
        RETURNING email
      `;
      if (inserted.length === 0) {
        return { ok: false, error: "email_exists" };
      }
      return { ok: true };
    }

    const users = await readUsersFile();
    if (users.some((user) => normalizeEmail(user.email) === email)) {
      return { ok: false, error: "email_exists" };
    }

    users.push({
      email,
      name,
      passwordHash,
      createdAt,
    });
    await writeUsersFile(users);
    return { ok: true };
  } catch {
    return { ok: false, error: "unavailable" };
  }
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<StoredUser | null> {
  const user = await findUserByEmail(email);
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

async function updateUserDb(
  email: string,
  patch: Partial<
    Pick<
      StoredUser,
      "name" | "passwordHash" | "subscriptionPlanId" | "locale" | "filmLanguage"
    >
  >
): Promise<{ ok: true; user: StoredUser } | { ok: false; error: string }> {
  const current = await findUserByEmailDb(email);
  if (!current) {
    return { ok: false, error: "Compte introuvable." };
  }

  let name = current.name;
  if (patch.name !== undefined) {
    const trimmed = patch.name.trim();
    name = trimmed || undefined;
  }

  const next: StoredUser = {
    ...current,
    ...patch,
    name,
    subscriptionPlanId:
      patch.subscriptionPlanId !== undefined
        ? patch.subscriptionPlanId || undefined
        : current.subscriptionPlanId,
    locale:
      patch.locale !== undefined
        ? patch.locale
        : patch.filmLanguage !== undefined
          ? patch.filmLanguage
          : current.locale,
  };

  await ensureSchema();
  const db = getSql();
  await db`
    UPDATE users
    SET
      name = ${next.name ?? null},
      password_hash = ${next.passwordHash},
      subscription_plan_id = ${next.subscriptionPlanId ?? null},
      locale = ${next.locale ?? null}
    WHERE email = ${email}
  `;

  return { ok: true, user: next };
}

async function updateUserFile(
  email: string,
  patch: Partial<
    Pick<
      StoredUser,
      "name" | "passwordHash" | "subscriptionPlanId" | "locale" | "filmLanguage"
    >
  >
): Promise<{ ok: true; user: StoredUser } | { ok: false; error: string }> {
  const users = await readUsersFile();
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
  await writeUsersFile(users);
  return { ok: true, user: next };
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
  const normalized = normalizeEmail(email);
  if (isDatabaseEnabled()) {
    return updateUserDb(normalized, patch);
  }
  return updateUserFile(normalized, patch);
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
